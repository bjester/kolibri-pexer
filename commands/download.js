const fs = require('fs');
const path = require('path');
const https = require('https');
const {Octokit} = require('@octokit/core');

const octokit = new Octokit();
const options = {
  owner: 'learningequality',
  repo: 'kolibri',
};
const BYTES_PER_MB = 1048576;

function handler(argv) {
  const version = argv.kolibri_version;
  const { logger } = argv;

  let lastProgress = 0;
  let lastTime = 0;
  const logProgress = (current, total) => {
    const time = (new Date()).getTime();
    const timeDiff = Math.max(0, time - lastTime) / 1000;
    const rate = ((current - lastProgress) / BYTES_PER_MB / timeDiff).toFixed(2);
    lastProgress = current;
    lastTime = time;

    current = (current / BYTES_PER_MB).toFixed(2);
    total = (total / BYTES_PER_MB).toFixed(2);
    logger.info(`Downloaded ${current}MB of ${total}MB (${rate} MB/s)`);
  };

  logger.info(`Looking up tag ${version}`);
  return octokit.request('GET /repos/{owner}/{repo}/releases/tags/{tag}', {
    ...options,
    tag: version,
  })
    .then(releaseResponse => {
      if (releaseResponse.status !== 200) {
        throw new Error(`Version tag ${version} not found | ${releaseResponse.status}`);
      }

      const asset = releaseResponse.data.assets.find(asset => /pex$/.test(asset.name));
      if (!asset) {
        throw new Error(`Couldn't find PEX asset for release ${version}`);
      }

      const assetFile = path.resolve(argv.homeDirectory, asset.name);
      return fs.promises.access(assetFile, fs.constants.F_OK)
        .then(() => logger.info(`${asset.name} is already downloaded`))
        .catch(() => {
          logger.info(`Downloading ${asset.name}`);
          return octokit.request('GET /repos/{owner}/{repo}/releases/assets/{asset_id}', {
            ...options,
            asset_id: asset.id,
            headers: {
              accept: 'application/octet-stream'
            }
          })
            .then(assetResponse => {
              const assetURL = assetResponse.status === 302
                ? assetResponse.headers.location
                : assetResponse.url;

              const file = fs.createWriteStream(assetFile);
              let receivedSize = 0;
              let totalSize = 0;
              const logInterval = setInterval(() => logProgress(receivedSize, totalSize), 1000);
              https.get(assetURL, (response) => {
                totalSize = parseInt(response.headers['content-length'], 10);
                logProgress(0, totalSize);
                response.on("data", chunk => {
                  receivedSize += chunk.length;
                });
                response.on("end", () => {
                  receivedSize = totalSize;
                  clearInterval(logInterval);
                  logProgress(receivedSize, totalSize);
                  logger.info(`Download complete`);
                })
                response.pipe(file);
              });
            });
        });
    })
    .catch(e => {
      if (e.response && e.status === 404) {
        console.warn(`Version tag ${version} not found`);
      }
    });
}

module.exports = {
  command: 'download <kolibri_version>',
  describe: 'downloads a PEX with specific version',
  builder: (yargs) => {
    yargs
      .positional('kolibri_version', {
        describe: 'the version of Kolibri for which to download the PEX file (e.g. v0.15.0)',
      })
      .option('silent', {
        type: 'boolean',
        description: 'do not output downloading progress',
        default: false,
      });
  },
  handler,
};
