#!/usr/bin/env node

var minimist = require('minimist')
  , concat = require('concat')
  , convert = require('./')
  , fs = require('fs')

var args = minimist(process.argv.slice(2))
  , output = process.stdout
  , input = process.stdin

if(args.help) {
  fs.createReadStream('./cli-usage.txt').pipe(process.stderr)
  process.exit(1)
}


if(args._.length > 0) {
  input = fs.createReadStream(args._[0], {encoding: 'utf8'})
}

if(args._.length > 1) {
  output = fs.createWriteStream(args._[1])
}

input.pipe(convert()).pipe(output)
