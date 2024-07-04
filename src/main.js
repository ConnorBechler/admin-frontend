/* eslint-disable */
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './plugins/async-computed';
import vuetify from './plugins/vuetify';
import './plugins/app-strings';
import './plugins/vee-validate';
import './plugins/vue-toastification';
import './plugins/vuetify-confirm';
import './plugins/vue-moment';
import './plugins/vue-number-input';
import './plugins/vue-clipboards';
import './components';

Vue.config.productionTip = false;

Vue.directive('uppercase', {
  inserted: function(el, _, vnode) {
    el.addEventListener('input', async function(e) {
      e.target.value = e.target.value.toUpperCase()
      vnode.componentInstance.$emit('input', e.target.value.toUpperCase())
    })
  }
});

Vue.filter('capFirst', function(value) {
  if (!value) return ''
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
});

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App),
}).$mount('#app');
