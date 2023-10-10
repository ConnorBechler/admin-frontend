/* eslint-disable */

const initialState = () => {
  return {
    component: '',
    visible: false,
    collapsed: false,
  };
};

export const state = initialState;

export const mutations = {
  SET(state, configs) {
    Object.keys(configs).forEach((key) => {
      state[key] = configs[key];
    });
  },
};

export const actions = {
  set({ state, commit }, configs) {
    commit('SET', configs);
  },
};
