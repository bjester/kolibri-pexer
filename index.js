#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const Yargs = require('yargs');
const findUp = require('find-up');
const winston = require('winston');
const { combine, label, printf } = winston.format;

const Kolibri = require('./kolibri');
const CONFIG_DEFAULTS = {
  homeDirectory: path.resolve(os.homedir(), '.kolibri-pexer'),
  homeTemplate: path.resolve(os.homedir(), '.kolibri'),
  contentDirectory: path.resolve(os.homedir(), '.kolibri', 'content'),
  python: 'python',
  runMode: 'test',
};

const configPath = findUp.sync(['.pexerrc', '.pexerrc.json']);
const config = configPath
  ? Object.assign({}, CONFIG_DEFAULTS, JSON.parse(fs.readFileSync(configPath)))
  : CONFIG_DEFAULTS;

if (!config.runMode) {
  config.runMode = 'test';
}

Yargs
  .config(config)
  .option('verbose', {
    type: 'boolean',
    description: 'enable verbose output',
    default: false,
  })
  .option('python', {
    alias: 'p',
    type: 'string',
    description: 'python binary to use',
  })
  .option('port', {
    type: 'number',
    description: 'the port to run Kolibri on',
    default: 8080,
  })
  .option('clean', {
    type: 'boolean',
    description: 'do not use content directory or home template',
    default: false,
  })
  .middleware((argv) => {
    return {
      kolibri: Kolibri.build(argv),
      logger: winston.createLogger({
        level: argv.verbose ? 'verbose' : 'warn',
        exitOnError: false,
        transports: [
          new winston.transports.Console(),
        ],
        format: combine(
          label({label: 'NEXER'}),
          printf(({level, message, label}) => {
            return `[${label}] ${level.toUpperCase()}: ${message}`;
          })
        )
      })
    };
  })
  .command({
    command: 'config',
    describe: 'outputs the config',
    handler() { console.log(config) },
  })
  .commandDir('commands')
  .demandCommand()
  .help()
  .argv
;
