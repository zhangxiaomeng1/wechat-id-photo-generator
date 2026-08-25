const PHOTO_SPECS = Object.freeze({
  one: Object.freeze({
    key: 'one',
    label: '一寸',
    size: '25 × 35 mm',
    widthMm: 25,
    heightMm: 35,
    pixelWidth: 295,
    pixelHeight: 413
  }),
  two: Object.freeze({
    key: 'two',
    label: '二寸',
    size: '35 × 49 mm',
    widthMm: 35,
    heightMm: 49,
    pixelWidth: 413,
    pixelHeight: 579
  })
})

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getPhotoSpec(key) {
  return PHOTO_SPECS[key] || PHOTO_SPECS.one
}

function round(value) {
  return Number(value.toFixed(2))
}

function getCropRect(sourceWidth, sourceHeight, targetWidth, targetHeight) {
  if (!sourceWidth || !sourceHeight || !targetWidth || !targetHeight) {
    return { x: 0, y: 0, width: sourceWidth || 0, height: sourceHeight || 0 }
  }

  const sourceRatio = sourceWidth / sourceHeight
  const targetRatio = targetWidth / targetHeight
  let width = sourceWidth
  let height = sourceHeight

  if (sourceRatio > targetRatio) {
    width = sourceHeight * targetRatio
  } else {
    height = sourceWidth / targetRatio
  }

  return {
    x: round((sourceWidth - width) / 2),
    y: round((sourceHeight - height) / 2),
    width: round(width),
    height: round(height)
  }
}

module.exports = {
  PHOTO_SPECS,
  clamp,
  getPhotoSpec,
  getCropRect
}
