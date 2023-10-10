<template>
  <AppDrawer
    :items="this.items">
  </AppDrawer>
</template>

<script>
import { appComputed, authComputed } from '@/store/helpers';

export default {
  data() {
    return {
      items: [
        {
          route: 'adminUsersList',
          text: 'Users',
        },
      ],
      item: '',
    };
  },
  computed: {
    ...appComputed,
    ...authComputed,
    mini() {
      return (this.$vuetify.breakpoint.mdAndDown);
    },
  },
};
</script>

<style lang="scss">
</style>
