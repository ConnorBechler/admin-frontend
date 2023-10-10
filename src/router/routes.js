import authRoutes from './auth';
import adminRoutes from './admin';

export default [
  {
    path: '/',
    alias: ['/home', '/dashboard'],
    name: 'home',
    component: () => import(/* webpackChunkName: "home" */ '@/router/views/Home.vue'),
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import(/* webpackChunkName: "signup" */ '@/router/views/Signup.vue'),
  },
  {
    path: '/faq',
    name: 'faq',
    component: () => import(/* webpackChunkName: "faq" */ '@/router/views/Faq.vue'),
  },
  ...authRoutes,
  ...adminRoutes,
];
