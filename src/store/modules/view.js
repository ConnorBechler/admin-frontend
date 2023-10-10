/* eslint-disable */
import feathersClient from '@/plugins/feathers-client';
import { getSavedState, saveState, removeSavedState } from '../helpers';
import merge from 'lodash/merge';

const initialState = () => {
  return {
    showHiddenDiaries: false,
    showInactiveDiaries: false,
    showHiddenProfiles: false,
    showInactiveProfiles: false,
    showHiddenUsers: false,
    showInactiveUsers: false,
    showHiddenDiaryPayPeriods: false,
  };
};

export const state = initialState();

export const mutations = {
  SET(state, configs) {
    Object.keys(configs).forEach((key) => {
      state[key] = configs[key];
    });
    saveState('view_preferences', state);
  },
  PATCH(state, configs) {
    Object.keys(configs).forEach((key) => {
      state[key] = merge(state[key], configs[key]);
    });
    saveState('view_preferences', state);
  },
};

export const getters = {
  viewPreferences: (state) => (key) => state[key],
};

export const actions = {
  // This is automatically run in `src/state/store.js` when the app
  // starts, along with any other actions named `init` in other modules.
  init({ state, commit, dispatch, rootGetters }) {
   const savedState = getSavedState('view_preferences');
   if (savedState) {
     dispatch('set', savedState);
   }
  },

  set({ state, commit }, configs) {
    commit('SET', configs);
  },

  patch({ state, commit }, configs) {
    commit('PATCH', configs);
  },
};
