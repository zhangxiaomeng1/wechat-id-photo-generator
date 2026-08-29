const assert = require('assert')

const pagePath = require.resolve('../pages/universe/index.js')
const originalPage = global.Page
const originalWx = global.wx
const originalSetTimeout = global.setTimeout
const tabEvents = []
let pageDefinition

global.Page = (definition) => {
  pageDefinition = definition
}

global.wx = {
  getWindowInfo() {
    return { windowWidth: 375, windowHeight: 700, pixelRatio: 3, statusBarHeight: 47 }
  },
  getMenuButtonBoundingClientRect() {
    return { top: 51, bottom: 83, left: 280, right: 367 }
  },
  hideTabBar(options) {
    tabEvents.push('hide')
    if (options && options.complete) options.complete()
  },
  showTabBar(options) {
    tabEvents.push('show')
    if (options && options.complete) options.complete()
  },
  nextTick(callback) {
    callback()
  }
}
global.setTimeout = (callback) => {
  callback()
  return 1
}

delete require.cache[pagePath]
require(pagePath)

function createPage(data) {
  const page = Object.assign({}, pageDefinition, {
    data: Object.assign({}, pageDefinition.data, data)
  })
  page.setData = function setData(update, callback) {
    Object.assign(this.data, update)
    if (callback) callback()
  }
  return page
}

const cameraPage = createPage({ cameraOpen: true, immersiveMode: true })
cameraPage.updateControlInsets()
assert.strictEqual(cameraPage.data.controlTop, 103)
assert.strictEqual(cameraPage.data.avatarChipTop, 157)
cameraPage.closeCamera()
assert.strictEqual(cameraPage.data.cameraOpen, false)
assert.strictEqual(cameraPage.data.immersiveMode, false)
assert.strictEqual(tabEvents.at(-1), 'show')
assert.strictEqual(cameraPage.data.sceneWidth, 343)
assert.strictEqual(cameraPage.data.sceneHeight, 300)

const immersivePage = createPage({ cameraOpen: false, immersiveMode: false })
immersivePage.enterImmersive({ cameraOpen: true })
assert.strictEqual(immersivePage.data.cameraOpen, true)
assert.strictEqual(immersivePage.data.immersiveMode, true)
assert.strictEqual(tabEvents.at(-1), 'hide')
assert.strictEqual(immersivePage.data.sceneWidth, 375)
assert.strictEqual(immersivePage.data.sceneHeight, 700)
assert.strictEqual(immersivePage.data.renderWidth, 1125)
assert.strictEqual(immersivePage.data.renderHeight, 2100)

global.Page = originalPage
global.wx = originalWx
global.setTimeout = originalSetTimeout

console.log('universe page behavior tests passed')
