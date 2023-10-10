import Vue from 'vue';
import Notifications from 'vue-notification';

Vue.use(
  Notifications, {
    name: 'alert',
    componentName: 'alerts',
  },
);
