/* eslint-disable */
import Vue from 'vue';
import VueRouter from 'vue-router';
import VueMeta from 'vue-meta';
// Adds a loading bar at the top during page loads.
import NProgress from 'nprogress';
import store from '../store';
import routes from './routes';

NProgress.configure({
  showSpinner: false,
  parent: '#app'
});

Vue.use(VueRouter);
Vue.use(VueMeta, {
  keyName: 'page',
});

const router = new VueRouter({
  routes,
  mode: 'history',
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      const position = {}
      // scroll to anchor by returning the selector
      if (to.hash) {
        position.selector = to.hash;

      // bypass #1number check
      if (/^#\d/.test(to.hash) || document.querySelector(to.hash)) {
        return position;
      }

      // if the returned position is falsy or an empty object,
      // will retain current scroll position.
      return false;
      }
    }
    return { x: 0, y: 0 };
  },
});

router.beforeEach((to, from, next) => {

  function throwAdminError() {
    store.dispatch('alert/display',
      {
        type: 'error',
        message: "You must be an Administrator to access this",
        timeout: 2500,
        icon: 'fa-exclamation',
      });
    next({ name: (store.getters['auth/isElevated']) ? 'adminHome' : 'home'});
    NProgress.done();
  }

  function throwRoleError(role) {
    store.dispatch('alert/display',
      {
        type: 'error',
        message: `You must have the '${role}' role to access this`,
        timeout: 2500,
        icon: 'fa-exclamation',
      });
    next({ name: (store.getters['auth/isElevated']) ? 'adminHome' : 'home'});
    NProgress.done();
  }

  function redirectToLogin() {
    if (to.fullPath === '/logout' || to.fullPath === '') {
      next({ name: 'login' } );
    } else {
      next({ name: 'login', query: { redirectFrom: to.fullPath } });
    }
    NProgress.done();
  }

  const someLayout = to.matched.find(route => route.meta.layout);
  if (someLayout) {
    store.dispatch('layout/set', {
      component: (to.meta && to.meta.layout && to.meta.layout.component) ? to.meta.layout.component : someLayout.meta.layout.component,
    });
  } else {
    store.dispatch('layout/set', {
      component: 'LayoutDefault',
    });
  }

  if (from.name !== null && from.query && from.query.redirectFrom !== to.path) {
    if (to.name !== 'logout') {
      NProgress.start();
    }
  }

  let requiredRole = null;
  const authRequired = to.matched.some(route => route.meta.authRequired);
  const elevatedRequired = to.matched.some(route => route.meta.elevatedRequired);
  const adminRequired = to.matched.some(route => route.meta.adminRequired);
  const roleRequired = to.matched.some(route => {
    if (route.meta && route.meta.roleRequired) {
      requiredRole = route.meta.roleRequired;
      return route.meta.roleRequired;
    } else {
      return false;
    }
  });

  if (!authRequired) return next();
  if (store.getters['auth/isAuthenticated'] || store.state.auth.accessToken) {
    return store.dispatch('auth/validate')
      .then((validUser) => {
        if (validUser) {
          if (roleRequired) {
            (store.getters['auth/hasRole'](requiredRole) || store.getters['auth/isAdmin']) ? next() : throwRoleError(requiredRole);
          }
          else if (elevatedRequired) {
            if (store.getters['auth/isElevated']) {
              if (adminRequired) {
                (store.getters['auth/isAdmin']) ? next() : throwAdminError();
              } else {
                next();
              }
            } else {
              throwAdminError();
            }
          } else {
            next();
          }
        } else {
          redirectToLogin();
        }
      })
      .catch((err) => {
        redirectToLogin()
      });
  }
  
  redirectToLogin();
});

router.beforeResolve((to, from, next) => {
  if (to.meta && to.meta.beforeResolve) {
    to.meta.beforeResolve(to, from, (...args) => {
      if (args.length) {
        next(...args);
      }
    });
  }

  next();
});

router.afterEach((to) => {
  const someSidebar = to.matched.find(route => route.meta.sidebar);
  if (someSidebar) {
    store.dispatch('sidebar/set', {
      component: (to.meta && to.meta.sidebar && to.meta.sidebar.component) ? to.meta.sidebar.component : someSidebar.meta.sidebar.component,
      visible: (to.meta && to.meta.sidebar) ? to.meta.sidebar.visible : someSidebar.meta.sidebar.visible,
    });
  } else {
    store.dispatch('sidebar/set', {
      component: '',
      visible: false,
    });
  }
  
  if (to.name !== 'logout') {
    NProgress.done();
  }
});

export default router;
