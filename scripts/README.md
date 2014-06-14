# drive-to-tape

A module to convert npm.im/drive.js to tape tests. You may or may not have a
lot of drive tests, but we do, so this module goes through, adds tape as a
dependency, and attempts to mop up any discrepancies. It does this by parsing
the AST, and then reformats the code with `jsfmt`

# CLI

%s

# require(drive-to-tape)

```javascript

var convert = require('drive-to-tape')
  , fs = require('fs')

convert('path/to/test').pipe(fs.createWriteStream('new/test/path'))

```

require it! It returns a stream with your new code in it.


