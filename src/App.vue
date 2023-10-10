<template>
  <component :is="layoutComponent"/>
</template>

<script>
import { appComputed } from '@/store/helpers';

export default {
  name: 'App',
  computed: {
    ...appComputed,
  },
  created() {
    this.$store.subscribe((mutation, state) => {
      switch (mutation.type) {
      case 'alert/SET_ALERT':
        this.$toast(state.alert.message, { ...state.alert });
        this.$store.commit('alert/CLEAR_ALERT');
        break;
      case 'auth/TIMEOUT':
        this.$router.push({ name: 'timeout' });
        break;
      default:
      }
    });
  },
};
</script>

<style lang="scss">
  @import '@/assets/sass/main.scss';
  #nprogress .bar {
    background: #f08521;

    position: fixed;
    z-index: 9999;
    top: 0;
    left: 0;

    width: 100%;
    height: 10px;
  }
</style>
