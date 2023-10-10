import feathersClient, { makeServicePlugin, BaseModel } from '@/plugins/feathers-client';

class Transcription extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'Transcription'

  // Define default properties here
  static instanceDefaults() {
    return {
      tags: [],
      metadata: {},
      profileId: '',
      active: 1,
      hidden: 0,
      createdAt: null,
      updatedAt: null,
      deletedAt: null,
    };
  }

  get analyzed() {
    return (this.metadata && this.metadata.lastCheckedAt && this.metadata.lastCheckedAt !== null);
  }

  get hasErrors() {
    return (this.metadata && this.analyzed)
      ? (this.metadata.errors && this.metadata.errors.length)
      : null;
  }

  get hasWarnings() {
    return (this.metadata && this.analyzed)
      ? (this.metadata.warnings && this.metadata.warnings.length)
      : null;
  }

  get passing() {
    return (this.analyzed && !this.hasErrors && !this.hasWarnings);
  }

  get analysisBtn() {
    const ret = {
      class: null,
      text: null,
    };

    if (!this.analyzed) {
      ret.class = 'msu accent-orange';
      ret.text = 'Needs Validation';
    } else {
      if (this.passing) {
        if (this.metadata.hasChanged) {
          ret.class = 'msu accent-purple';
          ret.text = 'Changed';
        } else {
          ret.class = 'msu';
          ret.text = 'Validated!';
        }
      }
      if (this.hasErrors) {
        ret.class = 'red';
        ret.text = `Errors: ${this.metadata.errors.length}`;
      }
      if (!this.hasErrors && this.hasWarnings) {
        ret.class = 'msu accent-orange';
        ret.text = `Warnings: ${this.metadata.warnings.length}`;
      }
      if (this.hasErrors && this.hasWarnings) {
        ret.class = 'red';
        ret.text = `Errors: ${this.metadata.errors.length}, Warnings: ${this.metadata.warnings.length}`;
      }
    }

    ret.class += ' white--text ml-2 font-weight-bold';

    return ret;
  }
}
const servicePath = 'transcriptions';
const servicePlugin = makeServicePlugin({
  Model: Transcription,
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
