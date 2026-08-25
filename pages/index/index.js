const { PHOTO_SPECS, getPhotoSpec, getCropRect } = require('../../utils/id-photo')

Page({
  data: {
    photoPath: '',
    resultPath: '',
    sourceMeta: null,
    selectedSize: 'one',
    photoSpecs: [PHOTO_SPECS.one, PHOTO_SPECS.two],
    isGenerating: false
  },

  choosePhoto() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const path = res.tempFilePaths && res.tempFilePaths[0]
        if (!path) return

        wx.getImageInfo({
          src: path,
          success: (info) => {
            this.setData({
              photoPath: path,
              resultPath: '',
              sourceMeta: { width: info.width, height: info.height }
            })
          },
          fail: () => {
            wx.showToast({ title: '图片读取失败，请重试', icon: 'none' })
          }
        })
      }
    })
  },

  selectSize(e) {
    const key = e.currentTarget.dataset.key
    if (!getPhotoSpec(key)) return
    this.setData({ selectedSize: key, resultPath: '' })
  },

  generatePhoto() {
    if (!this.data.photoPath || !this.data.sourceMeta) {
      wx.showToast({ title: '请先上传一张照片', icon: 'none' })
      return
    }

    this.setData({ isGenerating: true })
    const spec = getPhotoSpec(this.data.selectedSize)
    const query = this.createSelectorQuery()

    query.select('#idPhotoCanvas').fields({ node: true, size: true }).exec((res) => {
      const canvasInfo = res && res[0]
      if (!canvasInfo || !canvasInfo.node) {
        this.finishGenerate('生成画布初始化失败，请重试')
        return
      }

      const canvas = canvasInfo.node
      const context = canvas.getContext('2d')
      canvas.width = spec.pixelWidth
      canvas.height = spec.pixelHeight
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, spec.pixelWidth, spec.pixelHeight)

      const image = canvas.createImage()
      image.onload = () => {
        const crop = getCropRect(
          this.data.sourceMeta.width,
          this.data.sourceMeta.height,
          spec.pixelWidth,
          spec.pixelHeight
        )

        context.drawImage(
          image,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          spec.pixelWidth,
          spec.pixelHeight
        )

        wx.canvasToTempFilePath({
          canvas,
          x: 0,
          y: 0,
          width: spec.pixelWidth,
          height: spec.pixelHeight,
          destWidth: spec.pixelWidth,
          destHeight: spec.pixelHeight,
          fileType: 'jpg',
          quality: 0.95,
          success: (file) => {
            this.setData({ resultPath: file.tempFilePath, isGenerating: false })
          },
          fail: () => this.finishGenerate('生成失败，请换一张图片重试')
        })
      }
      image.onerror = () => this.finishGenerate('图片加载失败，请重试')
      image.src = this.data.photoPath
    })
  },

  finishGenerate(message) {
    this.setData({ isGenerating: false })
    wx.showToast({ title: message, icon: 'none' })
  },

  savePhoto() {
    if (!this.data.resultPath) {
      wx.showToast({ title: '请先生成证件照', icon: 'none' })
      return
    }

    wx.saveImageToPhotosAlbum({
      filePath: this.data.resultPath,
      success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
      fail: (error) => {
        if (error && error.errMsg && error.errMsg.indexOf('auth deny') !== -1) {
          wx.showModal({
            title: '需要相册权限',
            content: '请在设置中允许保存图片到相册。',
            confirmText: '去设置',
            success: (modal) => {
              if (modal.confirm) wx.openSetting()
            }
          })
          return
        }
        wx.showToast({ title: '保存失败，请重试', icon: 'none' })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '证件照生成器｜一寸、二寸快速生成',
      path: '/pages/index/index'
    }
  }
})
