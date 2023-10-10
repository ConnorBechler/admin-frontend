import feathersClient, { makeServicePlugin, BaseModel } from '@/plugins/feathers-client';

class DictionaryWord extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'DictionaryWord'

  // Define default properties here
  static instanceDefaults() {
    return {
      word: '',
      phonemes: '',
      metadata: {},
      active: 1,
      hidden: 0,
      createdAt: null,
      updatedAt: null,
      deletedAt: null,
    };
  }
}
const servicePath = 'dictionaryWords';
const servicePlugin = makeServicePlugin({
  Model: DictionaryWord,
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
        hook.data.word = hook.data.word.trim();
        hook.data.phonemes = hook.data.phonemes.trim();
      },
    ],
    update: [
      (hook) => {
        hook.data.word = hook.data.word.trim();
        hook.data.phonemes = hook.data.phonemes.trim();
      },
    ],
    patch: [
      (hook) => {
        hook.data.word = hook.data.word.trim();
        hook.data.phonemes = hook.data.phonemes.trim();
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
