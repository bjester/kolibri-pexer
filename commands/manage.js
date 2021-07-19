const repl = require('repl');

const init = require('./init');

function handler(argv) {
  return init.handler(argv)
    .then(() => {
      const managementArgs = [].concat(argv.management_args).concat(argv._).filter(c => c !== 'manage');
      if (managementArgs.length > 0) {
        return argv.kolibri.manage(managementArgs);
      }

      const server = repl.start({
        prompt: '> ',
        eval(cmd, context, filename, callback) {
          const command = cmd.replace(/\n|\s+/g, ' ')
            .trim()
            .split(' ');

          argv.kolibri.manage(command).then(callback)
        }
      });

      return new Promise((resolve) => {
        server.on('exit', () => resolve());
      });
    });
}

module.exports = {
  command: 'manage <pex> [management_args..]',
  alias: 'm',
  describe: 'manage a Kolibri pex',
  builder: (yargs) => {
    yargs.positional('pex', {
      describe: 'the pex file',
    });
    yargs.positional('management_args', {
      describe: 'the management command and arguments',
    });
  },
  handler,
};