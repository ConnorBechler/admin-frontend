import feathersClient, { makeServicePlugin, BaseModel } from '@/plugins/feathers-client';

class TranscriptSentence extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'TranscriptSentence'

  // Define default properties here
  static instanceDefaults() {
    return {
      transcriptionId: '',
      startTime: 0.0,
      endTime: 0.0,
      content: '',
      metadata: {},
      edited: 0,
      active: 1,
      hidden: 0,
      createdAt: null,
      updatedAt: null,
      deletedAt: null,
    };
  }
}
const servicePath = 'transcriptSentences';
const servicePlugin = makeServicePlugin({
  Model: TranscriptSentence,
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
    create: [],
    update: [],
    patch: [
      (hook) => {
        if (!Number(hook.data.metadata.speaker)) {
          hook.data.metadata.speaker = 1;
        }
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
