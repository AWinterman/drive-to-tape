#!/usr/bin/env node

var minimist = require('minimist')
  , through = require('through')
  , fs = require('fs')
  , splitStream = require('split')
  , concat = require('concat-stream')

var convert = require('./')
  , Logger = require('./lib/logger')

var args = minimist(process.argv.slice(2), {'boolean': ['r', 'replace', 'h', 'help']})
  , output = process.stdout
  , input = process.stdin
  , logStream = process.stderr
  , level = 'ERROR'
  , namedLogStream = null

if(args.help || args.h) {
  fs.createReadStream('./cli-usage.txt').pipe(process.stderr)
  process.exit(1)
}

if(args.log || args.l) {
  logStream = fs.createWriteStream(args.log || args.l)
}

if(args.verbosity || args.v) {
  level = args.verbosity || args.v
}

if(args._.length > 0) {
  input = fs.createReadStream(args._[0], {encoding: 'utf8'})
}

if(args._.length > 1 && !(args.replace || args.r)) {
  output = fs.createWriteStream(args._[1])
}

if(args._[0]) {
  namedLogStream = splitStream()

  namedLogStream.pipe(through(function(chunk) {
    this.queue(args._[0] + ' ' + chunk + '\n')
  })).pipe(logStream)
}

var converter = convert(new Logger(level, namedLogStream || logStream))

if(args._[0] && (args.r || args.replace)) {
  // the we have to read it all into memory first,
  // and we can't write until we're done with everything.
  input.pipe(concat(function(data) {
    converter.pipe(concat(function(data) {
      fs.writeFileSync(args._[0], data)
    }))

    converter.end(data)
  }))
} else {
  input.pipe(converter).pipe(output)
}
