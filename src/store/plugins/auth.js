/* eslint-disable */
import feathersClient, { makeAuthPlugin } from '@/plugins/feathers-client';
import { getSavedState, removeSavedState } from '../helpers';

export default makeAuthPlugin({
  userService: 'users',
  state: {
    accessToken: getSavedState('auth') || null,
    ttl: null,
    timeout: null,
    initDone: false,
    isInitPending: false,
  },
  mutations: {
    logout(state) {
      state.payload = null;
      state.accessToken = null;
      state.ttl = null;
      if (state.user) {
        state.user = null;
      }
    },
    setInitDone(state, initDone) {
      state.initDone = initDone;
    },
    setInitPending(state, initPending) {
      state.isInitPending = initPending;
    },
    SET_TIMEOUT(state, timeout) {
      clearTimeout(state.timeout);
      state.timeout = timeout;
    },
    CLEAR_TIMEOUT(state) {
      clearTimeout(state.timeout);
      state.timeout = null;
    },
    SET_TTL(state, ttl) {
      state.ttl = ttl;
    },
    TIMEOUT() {},
  },
  getters: {
    isAdmin: (state, getters) => getters.hasRole('admin,super'),
    hasRole: (state, getters) => rolesToCheck => getters.user ? rolesToCheck.split(',').map(role => role.trim().toLowerCase()).some(needs => getters.user.roles.some(role => role.toLowerCase() === needs)) : false,
    isRA: (state, getters) => getters.hasRole('ra,ga'),
    isElevated: (state, getters) => (getters.isRA || getters.hasRole('transcriptManager') || getters.hasRole('researchManager') || getters.isAdmin),
  },
  actions: {
    /* eslint-disable-next-line */
    async init({ commit, dispatch }) {
      /*
      commit('setInitPending', true);
      dispatch('validate')
        .then(() => {
          commit('setInitDone', true);
          commit('setInitPending', false);
        })
        .catch(() => {});
      */
    },
    authenticate(store, data) {
      const { commit, state, dispatch } = store;
      commit('setAuthenticatePending');
      if (state.errorOnAuthenticate) {
        commit('clearAuthenticateError');
      }
      return feathersClient
        .authenticate(data)
        .then((response) => {
          return dispatch('responseHandler', response)
            .then((resp) => {
              dispatch('initAll', {}, { root: true });
              if (resp.ttl) {
                commit('SET_TTL', resp.ttl);
                commit('SET_TIMEOUT', setTimeout(() => {
                  /*
                    TODO: timeout: replace with confirm/extend dialog
                    replace with confirm button
                    set timeout for now + 5min
                    yes -> validate + cancel new timeout
                    no/ignored -> just let expire
                  */
                  dispatch('validate')
                    .catch(() => {
                      commit('TIMEOUT');
                    });
                }, resp.ttl - (5 * 60 * 1000)));
              }
              return { id: resp.user.id, email: resp.user.email };
            });
        })
        .catch((error) => {
          commit('setAuthenticateError', error);
          commit('unsetAuthenticatePending');
          return Promise.reject(error);
        });
    },
    validate({ state, dispatch }) {
      if (!state.accessToken) return Promise.resolve(null);

      return dispatch('authenticate', {
        strategy: 'jwt',
        accessToken: state.accessToken,
      })
        .then(() => {
          return true;
        })
        .catch((err) => {
          dispatch('logout');
          if (err.message) {
            dispatch('alert/display',
              {
                type: 'error',
                message: err.message,
                timeout: false,
                icon: 'fa-exclamation',
              },
              { root: true });
            throw err;
          }
          return false;
        });
    },
    logout({ commit, dispatch }) {
      commit('setLogoutPending');
      commit('CLEAR_TIMEOUT');
      dispatch('clearAll', null, { root: true });
      return feathersClient
        .logout()
        .then((response) => {
          commit('logout');
          commit('unsetLogoutPending');
          return response;
        })
        .catch((error) => {
          commit('logout');
          removeSavedState('auth');
          return Promise.reject(error);
        });
    },
  },
});

feathersClient.service('auth').hooks({
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
