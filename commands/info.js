function handler(argv) {
  return argv.kolibri.getInfo()
    .then(info => {
      console.log(info);
    });
}

module.exports = {
  command: 'info <pex>',
  describe: 'shows info for a Kolibri pex',
  builder: (yargs) => {
    yargs.positional('pex', {
      describe: 'the pex file',
    });
  },
  handler,
};