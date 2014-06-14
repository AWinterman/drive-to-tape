var concat = require('concat')
  , convert = require('./')
  , fs = require('fs')


console.error(process.stdin.isTTY, process.stdout.isTTY)

return process.stdin.pipe(convert()).pipe(process.stdout)

if(process.argv.length <= 2) {
   return fs.createReadStream('cli-usage.txt').pipe(process.stderr)
}
