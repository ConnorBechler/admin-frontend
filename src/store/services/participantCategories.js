import feathersClient, { makeServicePlugin, BaseModel } from '@/plugins/feathers-client';

class ParticipantCategory extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'ParticipantCategory'

  // Define default properties here
  static instanceDefaults() {
    return {
      name: '',
      shortName: '',
      comment: '',
      sortOrder: 0,
      active: 1,
      hidden: 0,
      createdAt: null,
      updatedAt: null,
      deletedAt: null,
    };
  }
}
const servicePath = 'participantCategories';
const servicePlugin = makeServicePlugin({
  Model: ParticipantCategory,
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
        dispatch('find', { query: { active: 1, hidden: 0, $sort: { sortOrder: 1 } } })
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
    create: [],
    update: [],
    patch: [],
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
