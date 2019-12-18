const Defer = require('promise-be-deferred');

const init = require('./init');

function handler(argv) {
  return init.handler(argv)
    .then(() => {
      const { kolibri, logger } = argv;
      const executed = new Defer();

      logger.info('Stopping Kolibri');

      const stop = kolibri.spawn('stop', []);
      stop.on('close', () => executed.resolve());

      stop.stdout.pipe(process.stdout);
      stop.stderr.pipe(process.stderr);

      return executed;
    });
}

module.exports = {
  command: 'stop <pex>',
  describe: 'stop an already background running Kolibri pex',
  builder: (yargs) => {
    yargs
      .positional('pex', {
        describe: 'the pex file',
      });
  },
  handler,
};