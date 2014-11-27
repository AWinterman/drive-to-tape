var convert = require('../')()
var fs = require('fs')
var spawn = require('child_process').spawn
var concat = require('concat-stream')
var assert = require('assert')

var input = fs.createReadStream(
    __dirname + '/fixtures/drive-test.test.js'
  , {encoding: 'utf8'}
)

var output = concat(onend)

input
  .pipe(convert)
  .pipe(output)

function onend(data) {
  var test = spawn('node', ['-e', data])

  test.stderr.on('data', log)
  test.stdout.on('data', log)

  test.on('exit', ran)
  test.on('close', ran)
  test.on('error', function(e) {
    throw e
  })

  function ran(code, sig) {
    process.exit(code)
  }
}

function log() {
  process.stderr.write(
    [].slice.call(arguments).map(function(d) { return d.toString() }).join('\n')
  )
}
