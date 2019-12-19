const os = require('os');
const fs = require('fs-extra');
const path = require('path');

function handler(argv) {
  const home = argv.kolibri.getHome(false);
  argv.logger.verbose(`Removing ${home}`);

  return fs.remove(home)
    .then(() => argv.logger.verbose('Reading PEX info'))
    .then(() => argv.kolibri.getInfo())
    .then(info => {
      // Remove unzipped .pex data
      const pexName = Object.entries(info.distributions)
        .map((entry) => {
          return entry.join('.');
        })
        .join('.');

      const pexInstall = path.resolve(os.homedir(), '.pex', 'install', pexName);
      argv.logger.verbose(`Removing ${pexInstall}`);
      return fs.remove(path.resolve(os.homedir(), '.pex', 'install', pexName));
    });
}

module.exports = {
  command: 'rm <pex>',
  describe: 'removes a home directory for a Kolibri pex',
  builder: (yargs) => {
    yargs.positional('pex', {
      describe: 'the pex file',
    });
  },
  handler,
};