/* eslint-disable */

// ===
// Private helpers
// ===
const initialState = () => {
  return {
    type: 'default',
    message: '',
    position: 'top-center',
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.5,
    hideCloseButton: false,
    hideProgressBar: false,
    icon: false,
  };
};

export const state = {
  type: 'default',
  message: '',
  position: 'top-center',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.5,
  hideCloseButton: false,
  hideProgressBar: false,
  icon: false,
};

export const mutations = {
  SET_ALERT(state, alert) {
    if (alert.icon) {
      alert.icon = 'fas ' + alert.icon;
    }
    Object.keys(alert).forEach((key) => {
      state[key] = alert[key];
    });
  },
  CLEAR_ALERT(state) {
    const s = initialState();
    Object.keys(s).forEach((key) => {
      state[key] = s[key];
    });
  }
};

export const getters = {

};

export const actions = {
  // This is automatically run in `src/state/store.js` when the app
  // starts, along with any other actions named `init` in other modules.
  init({ state, dispatch }) {
    const s = initialState();
    Object.keys(s).forEach((key) => {
      state[key] = s[key];
    });
  },

  display({ commit }, alert = {}) {
    commit('SET_ALERT', alert);
  },
};
