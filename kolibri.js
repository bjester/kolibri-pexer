const { spawn } = require('child_process');
const path = require('path');

const Defer = require('promise-be-deferred');
const yauzl = require('yauzl');

class Kolibri
{
  constructor(pexFile, options) {
    this._pexFile = pexFile;
    this._options = options;
  }

  getHome(child = true) {
    const home = path.resolve(this._options.homeDirectory, path.basename(this._pexFile, '.pex'));

    return child
      ? path.resolve(home, `${this._options.python}-${this._options.port}`)
      : home;
  }

  getInfo() {
    const read = new Defer();
    const buf = [];

    yauzl.open(this._pexFile, { lazyEntries: true }, (err, zipFile) => {
      if (err) throw err;

      zipFile.on('entry', (entry) => {
        if (entry.fileName !== 'PEX-INFO') {
          return process.nextTick(() => zipFile.readEntry());
        }

        zipFile.openReadStream(entry, (err, pexInfo) => {
          pexInfo.on('data', data => buf.push(data));
          pexInfo.on('end', () => {
            zipFile.close();
            read.resolve(JSON.parse(Buffer.concat(buf).toString()));
          });
        });
      });
      zipFile.readEntry();
    });

    return read;
  }

  spawn(command, args = []) {
    const { logger } = this._options;
    args.unshift(this._pexFile, command);

    const contentDirectory = this._options.clean
      ? 'content'
      : this._options.contentDirectory;

    logger.verbose(`KOLIBRI_HOME=${this.getHome()}`);
    logger.verbose(`KOLIBRI_CONTENT_DIR=${contentDirectory}`);
    logger.verbose(`KOLIBRI_RUN_MODE=${this._options.runMode}`);
    logger.verbose(`KOLIBRI_HTTP_PORT=${this._options.port}`);

    return spawn(this._options.python, args, {
      env: Object.assign({} , process.env, {
        KOLIBRI_HOME: this.getHome(),
        KOLIBRI_CONTENT_DIR: contentDirectory,
        KOLIBRI_RUN_MODE: this._options.runMode,
        KOLIBRI_HTTP_PORT: this._options.port,
      }),
    });
  }

  manage(args) {
    const { logger } = this._options;
    logger.verbose(`Invoking management command: ${args.join(', ')}`);

    const child = this.spawn('manage', args);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    return new Promise(resolve => {
      child.on('exit', () => resolve(null));
    });
  }
}

Kolibri.build = function(argv)
{
  if (!argv.pex) {
    return null;
  }
  return new Kolibri(path.resolve(process.cwd(), argv.pex), argv);
};

module.exports = Kolibri;
