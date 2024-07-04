import feathersClient, { makeServicePlugin, BaseModel } from '@/plugins/feathers-client';

class ProcessingJob extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'ProcessingJob'

  // Define default properties here
  static instanceDefaults() {
    return {
      status: 0,
      metadata: {},
      diaryData: {},
      shortcode: null,
      transcription: {},
      createdAt: null,
      updatedAt: null,
      deletedAt: null,
    };
  }

  static setupInstance(data, { models }) {
    if (data.transcription) {
      data.transcription = new models.api.Transcription(data.transcription);
    }
    return data;
  }
}
const servicePath = 'processingJobs';
const servicePlugin = makeServicePlugin({
  Model: ProcessingJob,
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
