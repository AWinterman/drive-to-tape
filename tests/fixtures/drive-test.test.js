suite('a test suite', function() {
  test('my totally cool unit test', function() {
    assert.strictEqual('yes', 'yes')
  })

  test('my asynch unit test', function(done) {
    setTimeout(guard(run_test, done), 0)

    function run_test() {
      assert.strictEqual('yes', 'yes')
      done()
    }

    function works_for_named_funcs() {
    }
  })

  test('ungaurded', function(done) {
    setTimeout(run_test, 0)

    function run_test() {
      assert.strictEqual('yes', 'yes')
      done()
    }
  })

  test('named and inline', function coolest_test() {
    assert.deepEqual([1,2,3], [1,2,3])
  })

  test('named functiona rguent', works_for_named_funcs)

  function works_for_named_funcs() {
    assert.strictEqual('yes', 'yes')
  }
})

function guard(fn, done) {
  return function() {
    try {
      fn.apply(this, arguments)
    } catch(e) {
      done(e)
    }
  }
}

html('./example.html')

endpoints({
    'api/v2/wutever': function(req, resp) {
      resp.writeHead(200, 'application/json')
      resp.end(JSON.stringify)
    }
})
