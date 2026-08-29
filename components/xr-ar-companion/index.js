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
    arReady: false,
    modelReady: false,
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

    handleARReady(event) {
      this.setData({ arReady: true })
      this.triggerEvent('arready', event)
    },

    handleAssetsLoaded(event) {
      this.setData({ modelReady: true })
      this.triggerEvent('assetsloaded', event)
      this.loadAvatarTexture(this.properties.avatarPath || this.data.avatarPath)
    },

    handleAssetsProgress(event) {
      this.triggerEvent('assetsprogress', event)
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
          assetId: `ar-avatar-texture-${this.properties.avatarVersion || token}`,
          src: path
        })
        if (token !== this.avatarLoadToken || !textureAsset || !textureAsset.value) return

        let applied = false
        const portraitElement = this.scene.getElementById('ar-avatar-portrait')
        const portraitMesh = portraitElement && portraitElement.getComponent(xrSystem.Mesh)
        if (portraitMesh && portraitMesh.material) {
          portraitMesh.material.setTexture('u_baseColorMap', textureAsset.value)
          applied = true
        }

        const avatarElement = this.scene.getElementById('avatar-gltf')
        const avatarGltf = avatarElement && avatarElement.getComponent(xrSystem.GLTF)
        if (avatarGltf && avatarGltf.meshes) {
          avatarGltf.meshes.forEach((mesh) => {
            if (mesh.material) mesh.material.setTexture('u_baseColorMap', textureAsset.value)
          })
          applied = true
        }

        if (applied) {
          this.setData({ avatarTextureReady: true })
          this.triggerEvent('avatarupdated', { path })
        }
      } catch (error) {
        this.setData({ avatarTextureReady: false })
        this.triggerEvent('avatartextureerror', { error })
      }
    },

    handleError(event) {
      this.triggerEvent('error', event)
    }
  }
})
