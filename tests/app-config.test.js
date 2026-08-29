const assert = require('assert')
const appConfig = require('../app.json')

assert.strictEqual(
  appConfig.lazyCodeLoading,
  'requiredComponents',
  'XR-Frame requires requiredComponents lazy loading'
)
assert.strictEqual(appConfig.pages[0], 'pages/universe/index')
assert.strictEqual(appConfig.tabBar.list[0].pagePath, 'pages/universe/index')

console.log('app config tests passed')
