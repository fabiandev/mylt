#!/usr/bin/env node

'use strict';

const async = require('async');
const spawn = require('child_process').spawn;
const path = require('path');
const storage = require('node-persist');
const yargs = require('yargs');

const NODE_TLS_REJECT_UNAUTHORIZED = process.env.NODE_TLS_REJECT_UNAUTHORIZED;

const LT_OPTIONS = [
  'h', 'host',
  's', 'subdomain',
  'l', 'local-host',
  'o', 'open',
  'p', 'port'
];

function close(code) {
  console.log('Closing tunnel connection.');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = NODE_TLS_REJECT_UNAUTHORIZED;
  if (code) process.exit(code)
  process.exit()
}

storage.initSync({
  dir: path.join(__dirname, '.storage')
});

const argv = yargs
  .usage('Usage: $0 <command> [options]')
  .command({
    command: 'run',
    desc: 'Run localtunnel (lt) with defaults, or provide lt options.',
    handler: argv => run(argv)
  })
  .command({
    command: 'list',
    desc: 'List saved default values.',
    handler: argv => list(argv)
  })
  .command({
    command: 'set <key> [value]',
    desc: 'Set a default value for localtunnel.',
    builder: yargs => yargs.default('value', 'true'),
    handler: argv => set(argv)
  })
  .command({
    command: 'unset <key>',
    desc: 'Remove a default value.',
    handler: argv => unset(argv)
  })
  .command({
    command: 'trust',
    desc: 'Trust self signed certificates by default. (Same as: mylt set trust)',
    handler: argv => trust(argv)
  })
  .help('help', 'Show this help')
  .version(require('./package').version)
  .argv;

if (argv._.length === 0) {
  yargs.showHelp();
  close();
}

if ([
    'run', 'list', 'set',
    'unset', 'trust', 'help'
  ].indexOf(argv._[0]) === -1) {
  yargs.showHelp();
  close();
}

function run(argv) {
  const command = [];

  storage.forEach((key, value) => {
    command.push(key.length > 1 ? `--${key}` : `-${key}`);
    command.push(value);
  });

  LT_OPTIONS.forEach((key, value) => {
    if (!argv.hasOwnProperty(key)) return;
    let match = false;
    let option = key.length > 1 ? `--${key}` : `-${key}`;

    command.forEach((k, v) => {
      if (option !== k) return;
      command[k] = argv[key];
      match = true;
    });

    if (!match) {
      command.push(option);
      command.push(argv[key]);
    }
  });

  if (command.indexOf('--trust') !== -1) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  console.log('Executing:', 'lt', command.join(' '));

  const child = spawn(`lt`, command);

  child.stdout.setEncoding('utf8')

  child.stdout.on('data', data => {
    console.log(data);
  });

  child.stderr.on('data', data => {
    console.log('Error: ' + data);
  });

  child.on('close', code => {
    close(code);
  });
}

function list() {
  storage.forEach((key, value) => {
    console.log(`${key}: ${value}`);
  });

  close();
}

function trust() {
  set({
    key: 'trust',
    value: 'true'
  });
}

function set(argv) {
  console.log(`Setting "${argv.key}" to "${argv.value}"`)
  storage.setItem(argv.key, argv.value).then(close);
}

function unset(argv) {
  console.log(`Removing "${argv.key}"`)
  storage.removeItem(argv.key).then(close);
}

function close(code) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = NODE_TLS_REJECT_UNAUTHORIZED;
  if (code) process.exit(code)
  process.exit()
}

process.on('SIGINT', () => {
  close();
});

process.on('SIGTERM', () => {
  close();
});
