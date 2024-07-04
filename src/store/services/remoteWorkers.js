import feathersClient, { makeServicePlugin, BaseModel } from '@/plugins/feathers-client';

class RemoteWorker extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'RemoteWorker'

  // Define default properties here
  static instanceDefaults() {
    return {
      word: '',
      secret: '',
      maxConcurrent: 10,
      metadata: {},
      enabled: 1,
      hidden: 0,
      createdAt: null,
      updatedAt: null,
      deletedAt: null,
    };
  }
}
const servicePath = 'remoteWorkers';
const servicePlugin = makeServicePlugin({
  Model: RemoteWorker,
  service: feathersClient.service(servicePath),
  servicePath,
  actions: {
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
        hook.data.name = hook.data.name.trim();
        hook.data.secret = hook.data.secret.trim();
      },
    ],
    update: [
      (hook) => {
        hook.data.name = hook.data.name.trim();
        hook.data.secret = hook.data.secret.trim();
      },
    ],
    patch: [
      (hook) => {
        hook.data.name = hook.data.name.trim();
        hook.data.secret = hook.data.secret.trim();
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
