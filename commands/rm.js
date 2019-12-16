const fs = require('fs-extra');

function handler(argv) {
  const home = argv.kolibri.getHome(false);
  return fs.remove(home);
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