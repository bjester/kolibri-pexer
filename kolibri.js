const { spawn } = require('child_process');
const path = require('path');

class Kolibri
{
  constructor(pexFile, options) {
    this._pexFile = pexFile;
    this._options = options;
  }

  getHome(withPython = true) {
    const home = path.resolve(this._options.homeFolder, path.basename(this._pexFile, '.pex'));
    return withPython
      ? path.resolve(home, this._options.python)
      : home;
  }

  spawn(command, args = []) {
    const { logger } = this._options;
    args.unshift(this._pexFile, command);

    logger.verbose(`KOLIBRI_HOME=${this.getHome()}`);
    logger.verbose(`KOLIBRI_RUN_MODE=${this._options.runMode}`);

    return spawn(this._options.python, args, {
      env: Object.assign({} , process.env, {
        KOLIBRI_HOME: this.getHome(),
        KOLIBRI_RUN_MODE: this._options.runMode,
      }),
    });
  }
}

Kolibri.build = function(argv)
{
  return new Kolibri(path.resolve(process.cwd(), argv.pex), argv);
};

module.exports = Kolibri;
