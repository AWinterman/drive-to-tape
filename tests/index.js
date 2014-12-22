var converter = require('../')
var Logger = require('../lib/logger')
var fs = require('fs')
var spawn = require('child_process').spawn
var concat = require('concat-stream')
var through = require('through')
var path = require('path')

var input = fs.createReadStream(
    path.join(__dirname, 'fixtures', 'drive-test.test.js')
  , {encoding: 'utf8'}
)

var logger = new Logger('INFO', through(function(data) {
  if(data) {
    console.log(data)
    // throw new Error(data)
  }
}))

var output = concat(onend)

output.write('function html(){}\n\n')
output.write('function endpoints(){}\n\n')

input
  .pipe(converter(logger))
  .pipe(output)

function onend(data) {
  var test = spawn('node', ['-e', data])

  // the test prints data
  test.stderr.on('data', log)
  test.stdout.on('data', log)

  test.on('exit', ran)
  test.on('close', ran)
  test.on('error', function(e) {
    throw e
  })

  function ran(code) {
    process.exit(code)
  }
}

function log() {
  process.stderr.write(
      [].slice.call(arguments).map(function(d) {
        return d.toString()
      }).join('\n')
  )
}
