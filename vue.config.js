const webpack = require('webpack');

const jQueryPath = 'jquery/dist/jquery.js';

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        prependData: '@import "~@/assets/sass/variables.scss"',
      },
      scss: {
        prependData: '@import "~@/assets/sass/variables.scss;"',
      },
    },
  },
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        jQuery: jQueryPath,
        $: jQueryPath,
        'window.jQuery': jQueryPath,
      }),
    ],
  },
  chainWebpack: (config) => {
    ['vue-modules', 'vue', 'normal-modules', 'normal'].forEach((match) => {
      config.module.rule('sass').oneOf(match).use('sass-loader')
        .tap(opt => Object.assign(opt, { prependData: '@import \'~@/assets/sass/variables.scss\'' }));
      config.module.rule('scss').oneOf(match).use('sass-loader')
        .tap(opt => Object.assign(opt, { prependData: '@import \'~@/assets/sass/variables.scss\';' }));
    });
  },
  devServer: {
    proxy: {
      '/api': {
        target: process.env.API_BASE_URL,
        pathRewrite: { '^/api': '' },
      },
      '/socket.io': {
        target: process.env.API_BASE_URL,
      },
    },
    disableHostCheck: true,
    contentBase: `${process.env.STORAGE_PATH}/stream`,
    contentBasePublicPath: '/audio',
  },
  productionSourceMap: false,
  transpileDependencies: [
    'feathers-vuex',
    'vuetify',
  ],
};
