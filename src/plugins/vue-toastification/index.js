import Vue from 'vue';
import Toast from 'vue-toastification';
import './override.scss';

Vue.use(Toast, {
  transition: 'Vue-Toastification__bounce',
  maxToasts: 20,
  newestOnTop: true,
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
});
