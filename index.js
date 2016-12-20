#!/usr/bin/env node

'use strict';

const async = require('async');
const spawn = require('child_process').spawn;
const storage = require('node-persist');
const yargs = require('yargs');

const NODE_TLS_REJECT_UNAUTHORIZED = process.env.NODE_TLS_REJECT_UNAUTHORIZED;

storage.initSync({
  dir: '.storage'
});

const argv = yargs
  .usage('Usage: $0 <options>')
  .option('r', {
    alias: 'run',
    describe: 'Runs localtunnel. Requires lt to be installed.'
  })
  .option('list', {
    describe: 'Shows the current configuration.'
  })
  .option('allow-self-signed', {
    describe: 'Allow self signed certificates by the server.'
  })
  .option('default-host', {
    describe: 'Save the default host.'
  })
  .help('help', 'Show this help')
  .version(require('./package').version)
  .argv;

async.parallel([
    cb => {
      if (!argv.run) {
        cb(null);
        return;
      }

      if (!argv.p && !argv.port) {
        console.log('Missing required argument: port');
        cb(true);
        return;
      }

      let cert = storage.getItemSync('cert');
      let defaultHost = storage.getItemSync('host');

      let host = argv.h || argv.host || defaultHost || undefined;
      let port = argv.p || argv.port || undefined;
      let subdomain = argv.s || argv.subdomain || undefined;
      let localhost = argv.l || argv.localhost || undefined;
      let open = argv.o || argv.open || undefined;

      let command = [];

      if (cert) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      }

      if (host) {
        command.push('-h');
        command.push(host)
      }

      if (port) {
        command.push('-p');
        command.push(port);
      }

      if (subdomain) {
        command.push('-s');
        command.push(subdomain);
      }

      if (localhost) {
        command.push('-l');
        command.push(localhost)
      }

      if (open) {
        command.push('-o');
        command.push(open);
      }

      console.log('Executing localtunnel...');

      const child = spawn(`lt`, command);
      child.stdout.setEncoding('utf8')

      child.stdout.on('data', data => {
        console.log(data);
      });
      child.stderr.on('data', data => {
        console.log('Error: ' + data);
      });
      child.on('close', code => {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = NODE_TLS_REJECT_UNAUTHORIZED;
        process.exit(code)
      });
    },
    cb => {
      if (!argv['default-host']) {
        cb(null);
        return;
      }

      console.log(`Setting default host to: ${argv['default-host']}`)
      storage.setItem('host', argv['default-host'])
        .then(() => {
          console.log('Done setting default host.')
          cb(null, argv['default-host']);
        })
        .catch(() => {
          console.log('Error setting host.');
          cb(true)
        });
    },
    cb => {
      if (!argv['allow-self-signed']) {
        cb(null);
        return;
      }

      console.log(`Setting option for allowing self signed certificates to: ${argv['allow-self-signed']}`)
      storage.setItem('cert', argv['allow-self-signed'])
        .then(() => {
          console.log('Done setting certificate option.')
          cb(null, argv['allow-self-signed']);
        })
        .catch((err) => {
          console.log('Error setting certificate option.');
          cb(true);
        });
    },
    cb => {
      if (!argv.list) {
        cb(null)
        return;
      }

      console.log(`Getting current options...`);

      let host = storage.getItemSync('host');
      let cert = storage.getItemSync('cert');

      console.log(`Default host: ${host}`);
      console.log(`Allow self-signed certificates: ${cert}`);

      cb(null, {
        host,
        cert
      })
    }
  ],
  (err, results) => {
    if (typeof results === Array && results.contains('running')) {
      return;
    }

    if (err) {
      process.exit(1);
    }

    if (!results.filter((value) => {
        return value !== undefined;
      }).length) {
      yargs.showHelp();
    }

    process.exit(0);
  }
);

process.on('SIGINT', () => {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = NODE_TLS_REJECT_UNAUTHORIZED;
  process.exit();
});

process.on('SIGTERM', () => {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = NODE_TLS_REJECT_UNAUTHORIZED;
  process.exit();
});
