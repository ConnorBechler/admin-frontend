<template>
  <v-container class="fill-height" fluid >
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
          <v-card class="elevation-16 rounded-corners">
            <v-toolbar class="msu white--text">
              <v-toolbar-title v-if="isAuthenticated">Logging Out...</v-toolbar-title>
              <v-toolbar-title v-else>Session timed out</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-icon v-if="isAuthenticated" large class="white--text">fa-spinner fa-spin</v-icon>
              <v-icon v-else large class="white--text">fa-user</v-icon>
            </v-toolbar>
            <v-card-text v-if="isAuthenticated">
              <h3>
                Saving changes, please wait...
              </h3>
            </v-card-text>
            <v-card-text v-else>
              <h3>
                For the safety of your data, you have been logged out due to inactivity, and all changes have been saved.
              </h3>
              <p>
                If you would like to resume working, please log in again.
              </p>
            </v-card-text>
            <v-card-actions class="justify-center pb-5">
              <v-btn to="login" color="msu" class="white--text">
                Login
              </v-btn>
            </v-card-actions>
          </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { authComputed } from '@/store/helpers';

export default {
  page() {
    return {
      title: 'Session Timed Out',
      meta: [{ name: 'description', content: 'Timed Out page' }],
    };
  },
  computed: {
    ...authComputed,
  },
};
</script>

<style lang="scss" scoped>
  .v-card__text {
    p {
      padding-top: 15px;
      font-size: 1.1em;
    }
  }
</style>
