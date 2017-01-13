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

You can set any option via `mylt set`, to pass it on as default value when running `mylt run`.
To override defaults, just specify them, e.g. `mylt --port 8080`. This will use port `8080`
even if `5000` is set as default.
