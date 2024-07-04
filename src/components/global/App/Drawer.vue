<template>
  <v-navigation-drawer
    app
    permanent
    clipped
    :mini-variant="mini"
    touchless
    :expand-on-hover="mini"
    mobile-breakpoint="sm">
    <v-list
      nav
      shaped
      dense>
      <template v-for="(item, i) in this.items" >
        <v-list-item
          :key="i"
          v-if="!item.children && (item.roles ? (isAdmin || hasRole(item.roles)) : true)"
          :to="{ name: item.route }"
          exact>

          <v-list-item-icon style="width: 1em;">
            <v-icon color="msu" v-text="item.icon"></v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title v-text="item.text"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-group
          :key="i"
          v-else-if="item.children && (item.roles ? (isAdmin || hasRole(item.roles)) : true)"
          eager
          :value="$route.matched.some(m => m.path === item.path)">
          <template v-slot:prependIcon>
            <v-icon color="msu" v-text="item.icon"></v-icon>
          </template>
          <template v-slot:activator>
            <v-list-item-title v-text="item.text"></v-list-item-title>
          </template>
          <template v-for="(child, j) in item.children" >
            <v-list-item
              :key="`${i}-${j}`"
              v-if="!child.children && (child.roles ? (isAdmin || hasRole(child.roles)) : true)"
              :to="{ name: child.route }"
              exact>

              <v-list-item-icon style="width: 1em;">
                <v-icon color="black" v-text="child.icon" small right></v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title v-text="child.text"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-group
              :key="`${i}-${j}`"
              v-else-if="child.children && (child.roles ? (isAdmin || hasRole(child.roles)) : true)"
              eager
              sub-group
              :value="$route.matched.some(m => m.path === child.path)">
              <template v-slot:prependIcon>
                <v-icon color="msu" right>fa-caret-up</v-icon>
              </template>
              <template v-slot:activator>
                <v-list-item-title v-text="child.text"></v-list-item-title>
              </template>
              <template v-for="(sub, k) in child.children" >
                <v-list-item
                  v-if="sub.roles ? hasRole(sub.roles) : true"
                  :key="`${i}-${j}-${k}`"
                  :to="{ name: sub.route }"
                  exact>
                  <v-list-item-icon style="width: 1em;">
                    <v-icon color="black" v-text="sub.icon" small right></v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title v-text="sub.text"></v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
              <v-divider v-if="child.children && (child.roles ? (isAdmin || hasRole(child.roles)) : true)"
                :key="`divider-${i}-${j}`"
                class="mb-1"></v-divider>
            </v-list-group>
          </template>
        </v-list-group>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { appComputed, authComputed } from '@/store/helpers';

export default {
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    requiresAuth: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
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
