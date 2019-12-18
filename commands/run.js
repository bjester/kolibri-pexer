const Defer = require('promise-be-deferred');
const filter = require('stream-filter');

const init = require('./init');

function handler(argv) {
  return init.handler(argv)
    .then(() => {
      const { kolibri, logger } = argv;
      const executed = new Defer();
      const interrupted = new Defer();
      let started = false;
      let killing = false;
      let killTimer = null;

      logger.info('Starting Kolibri');

      process.on('SIGTERM', () => interrupted.resolve('SIGTERM'));
      process.on('SIGINT', () => interrupted.resolve('SIGINT'));

      const args = [];
      if (!argv.background) {
        args.push(['--foreground']);
      }

      const start = kolibri.spawn('start', args);
      start.on('close', () => executed.resolve());

      start.stdout.pipe(process.stdout);
      start.stderr.pipe(filter(data => {
        if (!started) {
          started = /ENGINE Serving on/.test(data.toString());
          return true;
        }

        if (/INFO/.test(data.toString()) && !argv.verbose && !killing) {
          return false;
        }

        return true;
      })).pipe(process.stderr);

      interrupted.then(signal => {
        killing = true;
        start.kill(signal);

        killTimer = setTimeout(() => {
          if (!start.killed) {
            logger.warn('KILLING!');
            start.kill('SIGKILL');
          }
        }, 10000);
      });

      return executed.then(() => clearTimeout(killTimer));
    });
}

module.exports = {
  command: 'run <pex>',
  aliases: ['r', 'start'],
  describe: 'run a Kolibri pex',
  builder: (yargs) => {
    yargs
      .option('background', {
        type: 'boolean',
        description: 'run in background instead of foreground (default)',
        default: false,
      })
      .positional('pex', {
        describe: 'the pex file',
      });
  },
  handler,
};