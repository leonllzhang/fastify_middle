const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ],
  lintOnSave: false,
  devServer: {
    port: "5001",
    proxy: {
      "/api": {
        target: "http://localhost:7789",
        ws: true,
        changOrigin: true,
      },
    },
  },
  configureWebpack: {
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.esm.js'
      }
    },
    module: {
      rules: [
        {
          test: /\.ya?ml$/,
          use: ["js-yaml-loader"],
        },
      ],
    },
  },
});
