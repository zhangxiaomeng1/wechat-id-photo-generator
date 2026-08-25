const { COMPANIONS, getAvatarName, getCompanionGreeting } = require('../../utils/universe')

Page({
  data: {
    cameraOpen: false,
    isCapturing: false,
    avatarPath: '',
    avatarMeta: null,
    avatarCreated: false,
    avatarName: '光年旅人',
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
        avatarName: saved.name || '光年旅人'
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

  openCamera() {
    this.setData({ cameraOpen: true })
  },

  closeCamera() {
    this.setData({ cameraOpen: false, isCapturing: false })
  },

  handleCameraError() {
    this.setData({ cameraOpen: false, isCapturing: false })
    wx.showToast({ title: '相机暂时不可用，请从相册选择', icon: 'none' })
  },

  takePhoto() {
    if (this.data.isCapturing) return
    this.setData({ isCapturing: true })
    wx.createCameraContext().takePhoto({
      quality: 'high',
      success: (res) => this.acceptAvatarImage(res.tempImagePath),
      fail: () => {
        this.setData({ isCapturing: false })
        wx.showToast({ title: '拍摄失败，请重试', icon: 'none' })
      }
    })
  },

  chooseAvatar() {
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
    const avatar = { path, meta: { width: info.width, height: info.height }, name }
    this.setData({
      avatarPath: path,
      avatarMeta: avatar.meta,
      avatarCreated: true,
      avatarName: name,
      cameraOpen: false,
      isCapturing: false,
      companionMessage: '你的分身已经准备好了，欢迎来到自己的宇宙。'
    })
    wx.setStorageSync('metaverse.avatar', avatar)
  },

  resetAvatar() {
    wx.removeStorageSync('metaverse.avatar')
    this.setData({ avatarPath: '', avatarMeta: null, avatarCreated: false, cameraOpen: false })
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
