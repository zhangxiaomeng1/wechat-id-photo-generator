const { COMPANIONS, getAvatarName, getCompanionGreeting } = require('../../utils/universe')

Page({
  data: {
    cameraOpen: false,
    immersiveMode: false,
    isCapturing: false,
    cameraReady: false,
    arReady: false,
    arFailed: false,
    avatarPath: '',
    avatarMeta: null,
    avatarCreated: false,
    avatarVersion: 0,
    avatarName: '光年旅人',
    xrReady: true,
    xrFailed: false,
    companions: COMPANIONS,
    selectedCompanion: 'nova',
    selectedMood: 'calm',
    companionMessage: getCompanionGreeting('calm'),
    pulseCount: 0
  },

  onLoad() {
    const saved = wx.getStorageSync('metaverse.avatar')
    const companion = wx.getStorageSync('metaverse.companion')
    if (saved && saved.path) {
      this.setData({
        avatarPath: saved.path,
        avatarMeta: saved.meta || null,
        avatarCreated: true,
        avatarName: saved.name || '光年旅人',
        avatarVersion: saved.version || Date.now(),
        immersiveMode: false
      })
    }
    if (companion) {
      this.setData({
        selectedCompanion: companion.key || 'nova',
        selectedMood: companion.mood || 'calm',
        companionMessage: companion.message || getCompanionGreeting('calm'),
        pulseCount: companion.pulseCount || 0
      })
    }
  },

  handleXRReady() {
    this.setData({ xrReady: true, xrFailed: false })
  },

  handleARReady() {
    this.setData({ arReady: true, arFailed: false, xrReady: true })
  },

  handleXRError() {
    this.setData({ xrReady: false, xrFailed: true })
    wx.showToast({ title: '3D 场景不可用，已切换基础模式', icon: 'none' })
  },

  openCamera() {
    const showCamera = () => this.setData({ cameraOpen: true, immersiveMode: true, cameraReady: false, arReady: false, arFailed: false, xrReady: true, xrFailed: false })
    if (typeof wx.getSetting !== 'function') {
      showCamera()
      return
    }

    wx.getSetting({
      success: (setting) => {
        const cameraAuth = setting.authSetting && setting.authSetting['scope.camera']
        if (cameraAuth === false) {
          wx.showModal({
            title: '需要相机权限',
            content: '请在设置中允许使用相机，才能打开实时画面。',
            confirmText: '去设置',
            success: (modal) => {
              if (modal.confirm) wx.openSetting()
            }
          })
          return
        }

        if (cameraAuth === true || typeof wx.authorize !== 'function') {
          showCamera()
          return
        }

        wx.authorize({
          scope: 'scope.camera',
          success: showCamera,
          fail: () => wx.showToast({ title: '未获得相机权限，请从设置中开启', icon: 'none' })
        })
      },
      fail: showCamera
    })
  },

  closeCamera() {
    this.setData({ cameraOpen: false, immersiveMode: this.data.avatarCreated, isCapturing: false, cameraReady: false, arReady: false, arFailed: false })
  },

  exitImmersive() {
    this.setData({ immersiveMode: false })
  },

  handleCameraReady() {
    this.setData({ cameraReady: true })
  },

  handleCameraError() {
    this.setData({ cameraOpen: false, immersiveMode: this.data.avatarCreated, isCapturing: false, cameraReady: false })
    wx.showToast({ title: '相机暂时不可用，请从相册选择', icon: 'none' })
  },

  handleARError() {
    this.setData({ arFailed: true, arReady: false })
    wx.showToast({ title: '实时 AR 不可用，已切换普通相机', icon: 'none' })
  },

  takePhoto() {
    if (this.data.isCapturing) return
    this.setData({ isCapturing: true })
    const finish = (path) => {
      if (path) {
        this.acceptAvatarImage(path)
      } else {
        this.setData({ isCapturing: false })
      }
    }

    if (typeof wx.chooseMedia === 'function') {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['camera'],
        success: (res) => finish(res.tempFiles && res.tempFiles[0] && res.tempFiles[0].tempFilePath),
        fail: () => finish('')
      })
      return
    }

    wx.chooseImage({
      count: 1,
      sourceType: ['camera'],
      success: (res) => finish(res.tempFilePaths && res.tempFilePaths[0]),
      fail: () => finish('')
    })
  },

  chooseAvatar() {
    if (typeof wx.chooseMedia === 'function') {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album'],
        success: (res) => {
          const path = res.tempFiles && res.tempFiles[0] && res.tempFiles[0].tempFilePath
          if (path) this.acceptAvatarImage(path)
        }
      })
      return
    }

    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success: (res) => {
        const path = res.tempFilePaths && res.tempFilePaths[0]
        if (path) this.acceptAvatarImage(path)
      }
    })
  },

  acceptAvatarImage(path) {
    wx.getImageInfo({
      src: path,
      success: (info) => {
        wx.saveFile({
          tempFilePath: path,
          success: (saved) => this.finishAvatar(saved.savedFilePath, info),
          fail: () => this.finishAvatar(path, info)
        })
      },
      fail: () => {
        this.setData({ isCapturing: false })
        wx.showToast({ title: '图片读取失败，请重试', icon: 'none' })
      }
    })
  },

  finishAvatar(path, info) {
    const name = getAvatarName((info.width || 0) + (info.height || 0))
    const version = (this.data.avatarVersion || 0) + 1
    const avatar = { path, meta: { width: info.width, height: info.height }, name, version }
    this.setData({
      avatarPath: path,
      avatarMeta: avatar.meta,
      avatarCreated: true,
      avatarName: name,
      avatarVersion: version,
      cameraOpen: false,
      immersiveMode: true,
      isCapturing: false,
      cameraReady: false,
      companionMessage: '你的分身已经准备好了，欢迎来到自己的宇宙。'
    })
    wx.setStorageSync('metaverse.avatar', avatar)
  },

  resetAvatar() {
    wx.removeStorageSync('metaverse.avatar')
    this.setData({ avatarPath: '', avatarMeta: null, avatarCreated: false, avatarVersion: 0, cameraOpen: false, immersiveMode: false, cameraReady: false, arReady: false, arFailed: false })
  },

  selectCompanion(e) {
    const key = e.currentTarget.dataset.key
    const companion = COMPANIONS.find((item) => item.key === key)
    if (!companion) return
    const message = getCompanionGreeting(this.data.selectedMood)
    this.setData({ selectedCompanion: key, companionMessage: message })
    this.persistCompanion({ key, mood: this.data.selectedMood, message, pulseCount: this.data.pulseCount })
  },

  selectMood(e) {
    const mood = e.currentTarget.dataset.mood
    const message = getCompanionGreeting(mood)
    this.setData({ selectedMood: mood, companionMessage: message })
    this.persistCompanion({ key: this.data.selectedCompanion, mood, message, pulseCount: this.data.pulseCount })
  },

  sendPulse(e) {
    const action = e.currentTarget.dataset.action
    const messages = {
      wave: '收到你的招呼了。今天的宇宙，亮了一点。',
      explore: '已记录：和你一起去看一颗新星。',
      breathe: '深呼吸，慢一点也没有关系。'
    }
    const pulseCount = this.data.pulseCount + 1
    const message = messages[action] || getCompanionGreeting(this.data.selectedMood)
    this.setData({ companionMessage: message, pulseCount })
    this.persistCompanion({ key: this.data.selectedCompanion, mood: this.data.selectedMood, message, pulseCount })
  },

  persistCompanion(data) {
    wx.setStorageSync('metaverse.companion', data)
  },

  onShareAppMessage() {
    return {
      title: '来我的陪伴宇宙看看',
      path: '/pages/universe/index'
    }
  }
})
