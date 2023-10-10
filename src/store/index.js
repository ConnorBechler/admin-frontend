/* eslint-disable no-underscore-dangle */
import Vue from 'vue';
import Vuex from 'vuex';
// import LogRocket from 'logrocket';
// import createPlugin from 'logrocket-vuex';
import { FeathersVuex } from '@/plugins/feathers-client';
import modules from './modules';
import auth from './plugins/auth';

Vue.use(Vuex);
Vue.use(FeathersVuex);

const requireService = require.context(
  // The path where the service modules live
  './services',
  // Whether to look in subfolders
  false,
  // Only include .js files (prevents duplicate imports)
  /.js$/,
);

const servicePlugins = requireService
  .keys()
  .map(modulePath => requireService(modulePath).default);

// const logrocketPlugin = createPlugin(LogRocket);

const store = new Vuex.Store({
  modules,
  // Enable strict mode in development to get a warning
  // when mutating state outside of a mutation.
  // https://vuex.vuejs.org/guide/strict.html
  // strict: process.env.NODE_ENV !== 'production',
  strict: false,
  state: {

  },
  mutations: {

  },
  actions: {
    clearAll() {
      Object.keys(store._modules.root._children).forEach((moduleName) => {
        const rawModule = store._modules.root._children[moduleName]._rawModule;
        if (rawModule.actions && rawModule.actions.clear && moduleName !== 'auth') {
          store.dispatch(`${moduleName}/clear`);
        }
      });
    },
    initAll() {
      Object.keys(store._modules.root._children).forEach((moduleName) => {
        const rawModule = store._modules.root._children[moduleName]._rawModule;
        if (rawModule.actions && rawModule.actions.init && moduleName !== 'auth') {
          store.dispatch(`${moduleName}/init`);
        }
      });
    },
  },
  plugins: [
    // logrocketPlugin,
    ...servicePlugins,
    auth,
  ],
});

// Automatically run the `init` action for every module,
// if one exists.
store.dispatch('auth/init');
store.dispatch('initAll');

export default store;
/* eslint-enable no-underscore-dangle */
