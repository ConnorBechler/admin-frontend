import isEqual from 'lodash/isEqual';
import feathersClient, { makeServicePlugin, BaseModel } from '@/plugins/feathers-client';
import { stashOriginalRequest, timestamp } from '@/store/helpers';

class Subject extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'Subject'

  // Define default properties here
  static instanceDefaults() {
    return {
      shortcode: '',
      last: '',
      first: '',
      email: '',
      tags: [],
      metadata: {
        processed: false,
        coded: {},
      },
      active: 1,
      hidden: 0,
      createdAt: null,
      updatedAt: null,
      deletedAt: null,
    };
  }
}
const servicePath = 'subjects';
const servicePlugin = makeServicePlugin({
  Model: Subject,
  service: feathersClient.service(servicePath),
  servicePath,
  actions: {
    async clear({ commit }) {
      commit('clearAll');
    },
  },
});

const checkCodedUpdated = async (hook) => {
  if (hook && hook.data && hook.params && hook.params.user) {
    if (hook.params.originalRequest && !isEqual(hook.params.originalRequest.metadata.coded, hook.data.metadata.coded)) {
      hook.data.metadata.coded.updatedAt = timestamp(Date.now());
      hook.data.metadata.coded.updatedBy = hook.params.user.id;
    }
  }
};

// Setup the client-side Feathers hooks.
feathersClient.service(servicePath).hooks({
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [
      stashOriginalRequest,
      checkCodedUpdated,
    ],
    patch: [
      stashOriginalRequest,
      checkCodedUpdated,
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
