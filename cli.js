#!/usr/bin/env node

var minimist = require('minimist')
  , concat = require('concat')
  , convert = require('./')
  , fs = require('fs')

var args = minimist(process.argv.slice(2))
  , output = process.stdout
  , input = process.stdin

if(args.help) {
  return fs.creatReadStream('./cli-usage.txt').pipe(process.stderr)
}

if(args._.length > 0) {
  input = fs.createReadStream(args._[0])
}

if(args._.length > 1) {
  input = fs.createWriteStream(args._[1])
}

input.pipe(convert()).pipe(output)


