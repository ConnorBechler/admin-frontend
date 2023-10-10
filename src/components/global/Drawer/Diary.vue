<template>
  <v-navigation-drawer
    app
    permanent
    clipped
    :mini-variant="mini"
    touchless
    mobile-breakpoint="sm">
    <v-list nav shaped>
      <v-list-item-group color="primary">
        <v-list-item exact>
          <v-list-item-icon>
            <v-icon color="msu">fa-home</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            Sections
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
    <v-divider></v-divider>
    <v-list
      nav
      shaped
      dense
      v-if="isAuthenticated"
    >
      <v-list-item-group v-model="item" color="primary">
        <v-list-item
          v-for="(item, i) in sidebarItems"
          :key="i" :to="{ name: item.route }"
        >
          <v-list-item-icon style="width: 1em;">
            <v-icon color="msu" v-text="item.icon"></v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>
              {{ item.text }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { appComputed, authComputed } from '@/store/helpers';

export default {
  data() {
    return {
      items: [],
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
