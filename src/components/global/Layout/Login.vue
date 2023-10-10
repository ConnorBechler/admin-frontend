<template>
  <v-app>
    <app-header />

    <v-main>
      <router-view :key="$route.fullPath" />
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'LayoutLogin',
};
</script>
