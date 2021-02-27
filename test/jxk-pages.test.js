const test = require('ava')
const jxkPages = require('..')

// TODO: Implement module test
test('<test-title>', t => {
  const err = t.throws(() => jxkPages(100), TypeError)
  t.is(err.message, 'Expected a string, got number')

  t.is(jxkPages('w'), 'w@zce.me')
  t.is(jxkPages('w', { host: 'wedn.net' }), 'w@wedn.net')
})
