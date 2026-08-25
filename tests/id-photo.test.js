const assert = require('assert')
const {
  PHOTO_SPECS,
  getPhotoSpec,
  getCropRect,
  clamp
} = require('../utils/id-photo')

function run() {
  assert.deepStrictEqual(getPhotoSpec('one'), PHOTO_SPECS.one)
  assert.strictEqual(getPhotoSpec('unknown').key, 'one')

  assert.strictEqual(clamp(-2, 0, 10), 0)
  assert.strictEqual(clamp(15, 0, 10), 10)
  assert.strictEqual(clamp(5, 0, 10), 5)

  const landscape = getCropRect(1200, 800, 295, 413)
  assert.strictEqual(landscape.width, 571.43)
  assert.strictEqual(landscape.height, 800)
  assert.strictEqual(landscape.x, 314.29)
  assert.strictEqual(landscape.y, 0)

  const portrait = getCropRect(800, 1200, 295, 413)
  assert.strictEqual(portrait.width, 800)
  assert.strictEqual(portrait.height, 1120)
  assert.strictEqual(portrait.x, 0)
  assert.strictEqual(portrait.y, 40)

  console.log('id-photo tests passed')
}

run()
