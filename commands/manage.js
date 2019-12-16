const repl = require('repl');

const init = require('./init');

function handler(argv) {
  return init.handler(argv)
    .then(() => {
      const server = repl.start({
        prompt: '> ',
        eval(cmd, context, filename, callback) {
          const command = cmd.replace(/\n|\s+/g, ' ')
            .trim()
            .split(' ');

          const child = argv.kolibri.spawn('manage', command);
          child.stdout.pipe(process.stdout);
          child.stderr.pipe(process.stderr);
          child.on('exit', () => callback(null));
        }
      });

      return new Promise((resolve) => {
        server.on('exit', () => resolve());
      });
    });
}

module.exports = {
  command: 'manage <pex>',
  alias: 'm',
  describe: 'manage a Kolibri pex',
  builder: (yargs) => {
    yargs.positional('pex', {
      describe: 'the pex file',
    });
  },
  handler,
};