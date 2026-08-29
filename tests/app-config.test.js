const assert = require('assert')
const appConfig = require('../app.json')

assert.strictEqual(
  appConfig.lazyCodeLoading,
  'requiredComponents',
  'XR-Frame requires requiredComponents lazy loading'
)

console.log('app config tests passed')
