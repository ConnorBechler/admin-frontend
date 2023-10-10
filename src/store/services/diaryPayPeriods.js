import feathersClient, { makeServicePlugin, BaseModel } from '@/plugins/feathers-client';

class DiaryPayPeriod extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'DiaryPayPeriod'

  // Define default properties here
  static instanceDefaults() {
    return {
      startDate: null,
      endDate: null,
      goal: 15,
      active: 1,
      hidden: 0,
      createdAt: null,
      updatedAt: null,
      deletedAt: null,
    };
  }
}
const servicePath = 'diaryPayPeriods';
const servicePlugin = makeServicePlugin({
  Model: DiaryPayPeriod,
  service: feathersClient.service(servicePath),
  servicePath,
  state: {
    initDone: false,
    isInitPending: false,
  },
  mutations: {
    setInitDone(state, initDone) {
      state.initDone = initDone;
    },
  },
  actions: {
    async init({
      state,
      commit,
      dispatch,
      rootGetters,
    }) {
      if (rootGetters['auth/isAuthenticated'] && !state.initDone && !state.isInitPending) {
        commit('setPending', 'init');
        dispatch('find', { query: { $sort: { startDate: 1, endDate: 1 } } })
          .then(() => {
            commit('setInitDone', true);
            commit('unsetPending', 'init');
          })
          .catch(() => {});
      }
    },
    async clear({ commit }) {
      commit('clearAll');
    },
  },
});

// Setup the client-side Feathers hooks.
feathersClient.service(servicePath).hooks({
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      (hook) => {
        hook.data.goal = Number(hook.data.goal);
      },
    ],
    update: [
      (hook) => {
        hook.data.goal = Number(hook.data.goal);
      },
    ],
    patch: [
      (hook) => {
        hook.data.goal = Number(hook.data.goal);
      },
    ],
    remove: [],
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
});

export default servicePlugin;
