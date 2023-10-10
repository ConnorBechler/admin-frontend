import feathersClient, { makeServicePlugin, BaseModel } from '@/plugins/feathers-client';

class User extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'User'

  // Define default properties here
  static instanceDefaults() {
    return {
      last: '',
      first: '',
      email: '',
      roles: [],
      active: 1,
      hidden: 0,
      isVerified: 0,
      createdAt: null,
      updatedAt: null,
      deletedAt: null,
    };
  }

  get lastfirst() {
    return `${this.last}, ${this.first}`;
  }

  get initials() {
    try {
      return `${this.first.substr(0, 1)}${this.last.substr(0, 1)}`;
    } catch {
      return '';
    }
  }
}
const servicePath = 'users';
const servicePlugin = makeServicePlugin({
  Model: User,
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
