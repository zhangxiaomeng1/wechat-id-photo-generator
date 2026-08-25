Component({
  methods: {
    handleReady(event) {
      this.triggerEvent('ready', event)
    },

    handleAssetsLoaded(event) {
      this.triggerEvent('assetsloaded', event)
    },

    handleAssetsProgress(event) {
      this.triggerEvent('assetsprogress', event)
    },

    handleError(event) {
      this.triggerEvent('error', event)
    }
  }
})
