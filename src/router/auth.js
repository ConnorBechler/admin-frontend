import NProgress from 'nprogress';
import store from '../store';

export default [
  {
    path: '/login/:type?',
    name: 'login',
    component: () => import(/* webpackChunkName: "login" */ '@/router/views/Login.vue'),
    meta: {
      layout: {
        component: 'LayoutLogin',
      },
      beforeResolve(to, from, next) {
        if (store.getters['auth/isAuthenticated']) {
          next(to.query.redirectFrom || to.params.redirectFrom || { name: (store.getters['auth/isElevated']) ? 'adminHome' : 'home' });
        } else {
          next();
        }
      },
    },
    props: route => ({ slug: route.query.token, ...route.params }),
  },
  {
    path: '/logout',
    name: 'logout',
    component: () => import(/* webpackChunkName: "logout" */ '@/router/views/Logout.vue'),
    meta: {
      authRequired: true,
      layout: {
        component: 'LayoutLogin',
      },
    },
    beforeEnter(to, from, next) {
      return new Promise((resolve) => {
        next();
        NProgress.inc();
        setTimeout(() => { resolve(true); }, 100);
      })
        .then(() => {
          store.dispatch('auth/logout')
            .then(() => {
              NProgress.inc();
              store.commit('auth/CLEAR_TIMEOUT');
              store.dispatch('clearAll', null, { root: true });
              NProgress.done();
            })
            .catch((err) => {
              store.dispatch('alert/display',
                {
                  type: 'error',
                  message: err,
                  timeout: false,
                  icon: 'fa-exclamation',
                },
                { root: true });
              next(from);
            });
        });
    },
  },
  {
    path: '/timedout',
    alias: ['/timeout'],
    name: 'timeout',
    component: () => import(/* webpackChunkName: "timeout" */ '@/router/views/Timeout.vue'),
  },
];
