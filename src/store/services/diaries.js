import feathersClient, { makeServicePlugin, BaseModel } from '@/plugins/feathers-client';

class Diary extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'Diary'

  // Define default properties here
  static instanceDefaults() {
    return {
      tags: [],
      metadata: {},
      profileId: '',
      active: 1,
      hidden: 0,
      profile: {},
      createdAt: null,
      updatedAt: null,
      deletedAt: null,
    };
  }

  static setupInstance(data, { models }) {
    if (data.profile) {
      data.profile = new models.api.Profile(data.profile);
    }
    return data;
  }

  get diaryCode() {
    return `${this.subjectId}_${this.metadata.diaryDate || new Date(new Date(this.createdAt).getTime() - new Date(this.createdAt).getTimezoneOffset() * 60 * 1000).toISOString().substr(0, 10)}_${this.metadata.sequence.toString().padStart(2, 0) || '00'}`;
  }

  get dateCode() {
    return `${this.metadata.diaryDate || new Date(new Date(this.createdAt).getTime() - new Date(this.createdAt).getTimezoneOffset() * 60 * 1000).toISOString().substr(0, 10)} #${(this.metadata.sequence || 1).toString().padStart(2, 0)}`;
  }

  get subjectId() {
    if (this.profile.subjectId && this.profile.subject) {
      return this.profile.subject.shortcode;
    } else {
      return '(no SID)';
    }
  }

  get permissionShare() {
    if (this.profile.subjectId && this.profile.subject && this.profile.subject.metadata) {
      return this.profile.subject.metadata.permission_share;
    } else {
      return false;
    }
  }

  get permissionArchive() {
    if (this.profile.subjectId && this.profile.subject && this.profile.subject.metadata) {
      return this.profile.subject.metadata.permission_share_research;
    } else {
      return false;
    }
  }

  get participantCategory() {
    if (this.profile.subjectId && this.profile.subject && this.profile.subject.metadata) {
      return this.profile.subject.metadata.participant_category;
    } else {
      return '';
    }
  }
}
const servicePath = 'diaries';
const servicePlugin = makeServicePlugin({
  Model: Diary,
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
