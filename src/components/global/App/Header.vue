<template>
  <!---
    TOOD: move top nav buttons and user/login button to hambugerstack for mobile
  --->
  <v-app-bar app clipped-left class="msu">
    <v-btn v-if="isElevated" text to="/admin" :ripple="false" class="appname white--text">
        <v-icon>fa-home</v-icon>
        <v-toolbar-title class="text-h5 pl-5 hidden-sm-and-down">
          {{ $appStrings('appName') }}
        </v-toolbar-title>
    </v-btn>
    <v-btn v-else text to="/my" :ripple="false" class="appname white--text">
      <v-icon>fa-home</v-icon>
      <v-toolbar-title class="text-h5 pl-5 hidden-sm-and-down">
        {{ $appStrings('appName') }}
      </v-toolbar-title>
    </v-btn>
    <v-spacer></v-spacer>
    <span class="hidden-xs-only" style="margin-left: 25px;">
      <span v-if="isAuthenticated">
        <v-menu offset-y
        bottom>
          <template #activator="{ on }">
            <v-btn x-large text class="menu-toggle white--text" :ripple="false" v-on="on">
              <span v-if="user && user.last && user.first">
                <v-avatar size="48" class="white--text mr-2" color="msu darken-1">
                  {{ user.initials }}
                </v-avatar>
                Hi, {{ user.first }}
              </span>
              <span v-else>Hello</span>
              <v-icon class="white--text ml-2 pb-1" size="15">fa-chevron-down</v-icon>
            </v-btn>
          </template>

          <v-list nav class="msu light white--text">
            <v-list-item-group>
              <v-list-item v-if="isAuthenticated" :to="{name: (isAdmin || isRA) ? 'adminProfile' : 'basicProfile' }">
                <v-list-item-icon>
                  <v-icon class="white--text" size="18">fa-user</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title class="white--text">
                    Profile
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <!--<v-list-item v-if="$route.path.includes('/my') && isElevated" to="/admin">
                <v-list-item-icon>
                  <v-icon class="white--text" size="18">fa-solid fa-toggle-off</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title class="white--text">
                    Admin Off
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="$route.path.includes('/admin')" to="/my">
                <v-list-item-icon>
                  <v-icon class="white--text" size="18">fa-solid fa-toggle-on</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title class="white--text">
                    Admin On
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>-->
              <v-list-item v-if="isAuthenticated" to="/logout">
                <v-list-item-icon>
                  <v-icon class="white--text" size="18">fa-sign-out-alt</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title class="white--text">
                    Sign Out
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-menu>
      </span>
      <span v-else>
        <v-btn to="/login" class="msu white--text">
          Sign In
        </v-btn>
      </span>
    </span>
    <span class="hidden-sm-and-up">
      <span v-if="isAuthenticated">
        <v-menu offset-y
        bottom
        >
          <template #activator="{ on }">
            <v-btn x-large text class="menu-toggle white--text" :ripple="false" v-on="on">
              <span v-if="user && user.last && user.first">
                <!--- Hi, {{ user.first }} --->
                <v-avatar size="48" class="white--text" color="msu">
                  {{ user.initials }}
                </v-avatar>
              </span>
              <span v-else>Hi</span>
              <v-icon class="white--text ml-2 pb-1" size="15">fa-chevron-down</v-icon>
            </v-btn>
          </template>

          <v-list nav dense class="msu light white--text">
            <v-list-item-group>
              <v-list-item v-if="isAuthenticated" to="/logout">
                <v-list-item-icon>
                  <v-icon class="white--text" size="18">fa-sign-out-alt</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title class="white--text">
                    Save and Exit
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-menu>
      </span>
      <span v-else>
        <v-btn to="/login" class="msu white--text">
          Sign In
        </v-btn>
      </span>
    </span>
  </v-app-bar>
</template>

<script>
/* eslint-disable object-curly-newline */
import { authComputed, userComputed, appComputed } from '@/store/helpers';

export default {
  computed: {
    ...appComputed,
    ...authComputed,
    ...userComputed,
  },
};
</script>

<style lang="scss" scoped>
  .v-btn.appname {
    padding: 0 10px;
  }
  .v-btn--active.appname:hover:before,
  .v-btn--active.appname:before {
    opacity: 0;
  }
  .v-btn.menu-toggle {
    padding: 0 10px;
    cursor: pointer;
    text-transform: none !important;
  }
  .v-btn.headerbtn {
    font-size: 1em;
  }
  .v-btn.menu-toggle:hover:before,
  .v-btn.menu-toggle:focus:before {
    opacity: 0;
  }
  .v-list--nav .v-list-item__icon:first-child {
    margin-right: 10px;
  }
</style>
