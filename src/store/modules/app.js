/* eslint-disable */
import merge from 'lodash/merge';
import feathersClient, { makeAuthPlugin } from '@/plugins/feathers-client';
import { getSavedState, removeSavedState } from '../helpers';

const initialState = () => {
  return {
    initDone: false,
    isInitPending: false,
    participantRegistrationOpen: 0,
    registrationOpen: 0,
    systemEnabled: 1,
  };
};

export const state = initialState;

export const mutations = {
  SET(state, configs) {
    Object.keys(configs).forEach((key) => {
      state[key] = configs[key];
    });
  },
  PATCH(state, configs) {
    Object.keys(configs).forEach((key) => {
      state[key] = merge(state[key], configs[key]);
    });
  },
};

export const actions = {
  // This is automatically run in `src/state/store.js` when the app
  // starts, along with any other actions named `init` in other modules.
  init({ state, commit, dispatch, rootGetters }) {
    if (!state.initDone && !state.isInitPending) {
      commit('SET', { isInitPending: true });
      dispatch('fetch')
        .then(() => {
          commit('SET', { initDone: true, isInitPending: false });
        })
        .catch(() => {
          commit('SET', { isInitPending: false });
        });
    }
  },

  set({ state, commit }, configs) {
    commit('SET', configs);
  },

  patch({ state, commit }, configs) {
    commit('PATCH', configs);
  },

  async fetch({ state, commit, dispatch, getters }) {
    const resp = await feathersClient.service('configs').find();
    const configs = Object.assign({}, ...resp.data.map(config => ({[config.name]: config[config.field]})));
    dispatch('set', configs);
  },
};
