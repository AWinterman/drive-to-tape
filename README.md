# drive to tape

Turns drive tests into tape tests.

`cat "path/to/tape/test" | drive-to-tape > tape-test.js`

Or require it in a js module:

```

var convert = require('drive-to-tape')
  , fs = require('fs')

fs.createReadStream('./path/to/drive-test')
  .pipe(convert())
  .pipe(fs.createWriteStream('./path/to/tape-test'))
