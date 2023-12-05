const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer : {
    port: '5001',
    proxy: {
      '/api': {
        target: 'http://localhost:7789',
        ws: true,
        changOrigin: true,
      }
    }
  }
})
