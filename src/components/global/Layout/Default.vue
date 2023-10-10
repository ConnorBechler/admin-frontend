<template>
  <v-app>

    <component :is="sidebarComponent" v-if="sidebarVisible" class="elevation-0" />

    <v-main>
      <router-view :key="$route.fullPath" />
    </v-main>
  </v-app>
</template>

<script>
import { appComputed } from '@/store/helpers';

export default {
  name: 'LayoutDefault',
  computed: {
    ...appComputed,
  },
};
</script>
