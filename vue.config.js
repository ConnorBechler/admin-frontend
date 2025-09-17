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
    config.plugin('banner')
      .use(webpack.BannerPlugin, [{
        banner: `/*!
 * © 2025, Michigan State University
 * MI Diaries Research Framework was developed by the Department of 
 * Linguistics, Languages, and Cultures at Michigan State University.
 * All rights reserved.
 *
 * Permission is granted to reproduce, distribute, and adapt this material for educational and 
 * non-commercial purposes, provided proper attribution is given to the Department of
 * Linguistics, Languages, and Cultures at Michigan State University. No part of this publication
 * may be sold, used for commercial gain, or incorporated into commercial products or services
 * without prior written permission.
 *
 * For inquiries regarding use or licensing, please contact:
 * Department of Linguistics, Languages, and Cultures at Michigan State University
 * Michigan State University
 * Dr. Betsy Sneller - Assistant Professor Linguistics
 * Email: sneller7@msu.edu
 */`,
        raw: true,
        entryOnly: false,
      }]);
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
