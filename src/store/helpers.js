import moment from 'moment';
import { mapState, mapGetters, mapActions } from 'vuex';

export const stashOriginalRequest = async (hook) => {
  const originalRequest = await hook.service.get(hook.data.id);
  hook.params.originalRequest = originalRequest;
};

export const timestamp = (time) => {
  return time ? moment(time).format() : null;
};

export const authComputed = {
  ...mapState('auth', ['ttl', 'isAuthenticatePending']),
  ...mapGetters('auth', ['isAdmin', 'isAuthenticated', 'isElevated', 'isRA', 'hasRole', 'hasMatchingEmail']),
};

export const userComputed = {
  ...mapGetters('auth', ['user']),
};

export const appComputed = {
  ...mapState('layout', { layoutComponent: 'component' }),
  ...mapState('sidebar', { sidebarComponent: 'component' }),
  ...mapState('sidebar', { sidebarVisible: 'visible' }),
  ...mapState('sidebar', { sidebarCollapsed: 'collapsed' }),
  ...mapState('sidebar', { sidebarItems: 'items' }),
  ...mapGetters('view', ['viewPreferences']),
};

export const authMethods = mapActions('auth', ['sendReset', 'reset', 'sendVerify', 'verify', 'signup', 'authenticate']);

export function saveState(key, state) {
  window.localStorage.setItem(key, JSON.stringify(state));
}

export function getSavedState(key) {
  try {
    return JSON.parse(window.localStorage.getItem(key));
  } catch (error) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return false;
    }
  }
}
export function removeSavedState(key) {
  window.localStorage.removeItem(key);
}
