import '@fortawesome/fontawesome-free/css/fontawesome.css';
import '@fortawesome/fontawesome-free/css/solid.css';
import '@fortawesome/fontawesome-free/css/regular.css';
// import 'vuetify/src/stylus/app.styl';
// import 'vuetify/src/styles/main.sass';
import '@/assets/fonts.css';
// import '@/assets/stylus/main.styl';
import '@/assets/sass/main.scss';

import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: 'fa',
  },
});
