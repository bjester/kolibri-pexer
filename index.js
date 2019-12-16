#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const Yargs = require('yargs');
const findUp = require('find-up');
const winston = require('winston');
const { combine, label, printf } = winston.format;

const Kolibri = require('./kolibri');

const configPath = findUp.sync(['.pexerrc', '.pexerrc.json']);
const config = configPath
  ? JSON.parse(fs.readFileSync(configPath))
  : {
    homeFolder: path.resolve(os.homedir(), '.kolibri-pexer'),
    homeTemplate: path.resolve(os.homedir(), '.kolibri'),
    python: 'python',
    runMode: 'test',
  };

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
  .commandDir('commands')
  .demandCommand()
  .help()
  .argv
;
