const path = require('path');
const fs = require('fs-extra');

function handler(argv) {
  const home = argv.kolibri.getHome();
  const { logger } = argv;

  return fs.pathExists(home)
    .then(exists => {
      if (!exists) {
        logger.info(`Creating new home directory for pex ${home}`);
        return fs.ensureDir(home);
      }
      else {
        logger.info(`Home directory already exists`);
      }
    })
    .then(() => fs.pathExists(path.resolve(home, '.data_version')))
    .then(exists => {
      if (exists || !argv.homeTemplate) {
        logger.info(`Home directory is already initialized`);

        return Promise.resolve();
      }

      logger.warn(`Copying home directory template`);
      return fs.copy(argv.homeTemplate, home);
    });
}

module.exports = {
  command: 'init <pex>',
  alias: 'i',
  describe: 'initialize a home directory for a Kolibri pex',
  builder: (yargs) => {
    yargs.positional('pex', {
      describe: 'the pex file',
    });
  },
  handler,
};