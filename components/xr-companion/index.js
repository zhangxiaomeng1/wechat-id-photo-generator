Component({
  properties: {
    avatarPath: {
      type: String,
      value: '',
      observer: 'handleAvatarSourceChange'
    },
    avatarVersion: {
      type: Number,
      value: 0,
      observer: 'handleAvatarSourceChange'
    }
  },

  data: {
    avatarTextureReady: false
  },

  lifetimes: {
    detached() {
      this.avatarLoadToken = (this.avatarLoadToken || 0) + 1
    }
  },

  methods: {
    handleReady(event) {
      this.scene = event && event.detail && event.detail.value
      this.triggerEvent('ready', event)
      this.loadAvatarTexture(this.properties.avatarPath || this.data.avatarPath)
    },

    handleAvatarSourceChange() {
      const path = this.properties.avatarPath || this.data.avatarPath
      if (!path) {
        this.setData({ avatarTextureReady: false })
        return
      }
      this.loadAvatarTexture(path)
    },

    async loadAvatarTexture(path) {
      if (!path || !this.scene || typeof wx.getXrFrameSystem !== 'function') return
      const token = (this.avatarLoadToken || 0) + 1
      this.avatarLoadToken = token

      try {
        const xrSystem = wx.getXrFrameSystem()
        const textureAsset = await this.scene.assets.loadAsset({
          type: 'texture',
          assetId: `avatar-texture-${this.properties.avatarVersion || token}`,
          src: path
        })
        if (token !== this.avatarLoadToken || !textureAsset || !textureAsset.value) return

        const portraitElement = this.scene.getElementById('avatar-portrait')
        const headElement = this.scene.getElementById('avatar-head')
        const portraitMesh = portraitElement && portraitElement.getComponent(xrSystem.Mesh)
        const headMesh = headElement && headElement.getComponent(xrSystem.Mesh)
        if (portraitMesh && portraitMesh.material) portraitMesh.material.setTexture('u_baseColorMap', textureAsset.value)
        if (headMesh && headMesh.material) headMesh.material.setTexture('u_baseColorMap', textureAsset.value)

        this.setData({ avatarTextureReady: true })
        this.triggerEvent('avatarupdated', { path })
      } catch (error) {
        this.setData({ avatarTextureReady: false })
        this.triggerEvent('avatartextureerror', { error })
      }
    },

    handleTick(event) {
      if (!this.scene) return
      const deltaTime = Number(event && event.detail && event.detail.value) || 0
      const xrSystem = wx.getXrFrameSystem()
      const avatarElement = this.scene.getElementById('avatar-root')
      const transform = avatarElement && avatarElement.getComponent(xrSystem.Transform)
      if (!transform) return

      this.elapsed = (this.elapsed || 0) + deltaTime
      transform.rotation.y += deltaTime * 0.00045
      transform.position.y = 0.08 + Math.sin(this.elapsed * 0.0018) * 0.045
    },

    handleAssetsLoaded(event) {
      this.triggerEvent('assetsloaded', event)
      this.loadAvatarTexture(this.properties.avatarPath || this.data.avatarPath)
    },

    handleAssetsProgress(event) {
      this.triggerEvent('assetsprogress', event)
    },

    handleError(event) {
      this.triggerEvent('error', event)
    }
  }
})
