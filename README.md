# mylt

A simple [localtunnel](https://github.com/localtunnel/localtunnel) client helper to make it easier to use with a custom [localtunnel server](https://github.com/localtunnel/server).

## Quick Start

```sh
$ npm install -g localtunnel mylt
$ mylt set port 5000
$ mylt set host https://tunnel.example.tld:1234
$ mylt list
$ mylt run --open
```
## Commands

### set

You can set any option via `mylt set <key> [value]`, to pass it on as default value when running `mylt run`.
If no value is passed, `true` will be used.

```sh
$ mylt set <key> [value]
```

### unset

Removes a previously set default value.

```sh
$ mylt unset <key>
```

### trust

This accepts self-signed certificates from the server. It is an alias for `mylt set trust`
and can be removed with `mylt unset trust`. There is a native command, because it is not
part of the localtunnel options.

```sh
$ mylt trust
```

### list

Lists all previously set default values.

```sh
$ mylt list
```

### run

Executes `lt` with the set default options. To override defaults, just specify them,
e.g. `mylt run --port 8080`. This will use port `8080` even if `5000` is set as default,
as shown in the example below.

```sh
$ mylt run --port 8080 --open
```

## Options

### --help

Shows a help message, listing all commands and options.

```sh
$ mylt --help
```

### --version

Shows the `mylt` version.

```sh
$ mylt --version
```
