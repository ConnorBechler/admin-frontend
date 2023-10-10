<template>
  <v-container fluid >
    <v-row justify="center" v-if="!this.user.isVerified" class="userStatus mt-1 mb-3">
      <v-col cols=12 sm=10 class="msu hover-1" style="text-align: center;" v-if="this.verificationResent || (this.requestAgoTime >= 0 && this.requestAgoTime != null && this.requestAgoTime <= 30)">
        Your account has not yet been verified; please check your email for a link to confirm your account.<br>
      </v-col>
      <v-col cols=12 sm=10 class="msu accent-orange mt-1 mb-3" style="text-align: center;" v-else>
        Your account has not yet been verified; please check your email for a link to confirm your account.<br>
        If you did not receive the Verification Email, <span class="resendLink" @click="resendVerification">click here to request another</span>.
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols=12 sm="8">
        <v-card class="elevation-16 rounded-corners">
          <v-toolbar class="msu white--text">
            <v-toolbar-title>Profile: {{ this.user.email }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-icon large class="white--text">fas fa-user</v-icon>
          </v-toolbar>
          <v-card-text>
            <div class="spacer-text">
              User Info
            </div>
            <v-container>
              <FeathersVuexFormWrapper :item="this.user" watch>
                <template v-slot="{ clone, isDirty }">
                  <EditorUser
                    :clone="clone"
                    :isDirty="isDirty"
                    :allowDelete="false"
                    :showProfile="true"
                    :showControls="true"
                    :selfDisabled="true"
                    :standalone="true"
                    @stageClone="addCloneForSaving"
                    @unstageClone="removeCloneFromSaving">
                  </EditorUser>
                </template>
              </FeathersVuexFormWrapper>
            </v-container>
            <div class="spacer-text">
              Login Info
            </div>
            <v-container>
              <v-row justify="center" v-if="this.user.isVerified">
                <v-col cols="12" sm="8" md="6">
                  <v-card class="elevation-16 rounded-corners">
                    <v-toolbar class="msu white--text">
                      <v-toolbar-title>Change Password</v-toolbar-title>
                      <v-spacer></v-spacer>
                      <v-icon large class="white--text">fas fa-user</v-icon>
                    </v-toolbar>
                    <template v-if="!this.passwordChanged">
                      <ValidationObserver ref="changeObserver" v-slot="{ invalid }">
                        <v-form @submit.prevent="tryToChangePassword">
                          <v-card-text>
                            <ValidationProvider
                              vid="oldPassword"
                              ref="oldPassword"
                              name="Current Password"
                              rules="required|min:6"
                              v-slot="{ errors }"
                            >
                              <v-text-field
                                v-model="userChange.oldPassword"
                                id="oldPassword"
                                prepend-icon="fa-lock"
                                :error-messages="errors"
                                name="oldPassword"
                                label="Current Password"
                                type="password">
                              </v-text-field>
                            </ValidationProvider>
                            <ValidationProvider
                              vid="newpassword"
                              ref="newpassword"
                              name="New Password"
                              rules="required|min:6|password:newpassword_confirmation"
                              v-slot="{ errors }"
                            >
                              <v-text-field
                                v-model="userChange.newPassword"
                                id="newPassword"
                                prepend-icon="fa-lock"
                                :error-messages="errors"
                                name="newPassword"
                                label="New Password"
                                type="password">
                              </v-text-field>
                            </ValidationProvider>
                            <ValidationProvider
                              vid="newpassword_confirmation"
                              ref="newpassword_confirmation"
                              name="Password Confirmation"
                              rules="required"
                              v-slot="{ errors }"
                            >
                              <v-text-field
                                v-model="userChange.newPasswordConfirm"
                                id="newPasswordConfirm"
                                prepend-icon="fa-lock"
                                :error-messages="errors"
                                name="newPasswordConfirm"
                                label="Confirm New Password"
                                type="password">
                              </v-text-field>
                            </ValidationProvider>
                          </v-card-text>
                          <v-card-actions>
                            <v-container class="pa-0">
                              <v-row justify="center" no-gutters>
                                <v-col cols="auto">
                                  <v-btn
                                    :disabled="tryingToChangePassword || invalid"
                                    :loading="tryingToChangePassword"
                                    type="submit"
                                    class="msu lighten-1 white--text">
                                      Change Password
                                  </v-btn>
                                  <v-btn
                                    :disabled="tryingToChangePassword || invalid"
                                    @click="clearChangePassword"
                                    class="msu hover-1 white--text">
                                      cancel
                                  </v-btn>
                                </v-col>
                              </v-row>
                            </v-container>
                          </v-card-actions>
                        </v-form>
                      </ValidationObserver>
                    </template>
                    <template v-else>
                      <v-card-text>
                        <v-container class="pa-5 passwordChanged">
                          <v-row justify="center" no-gutters>
                            <v-col cols="auto">
                              Password changed successfully!
                            </v-col>
                          </v-row>
                        </v-container>
                      </v-card-text>
                    </template>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
/* eslint-disable */
import NProgress from 'nprogress';
import { mapState, mapGetters, mapActions } from 'vuex';
import { authComputed, userComputed, profileComputed } from '@/store/helpers';
import feathersClient, { authManagement } from '@/plugins/feathers-client';
import feathersVuexFormHelpers from '@/mixins/feathersVuexFormHelpers';

export default {
  mixins: [
    feathersVuexFormHelpers,
  ],
  page() {
    return {
      title: `Profile: ${this.user.email}`,
      meta: [
        {
          name: 'description',
          content: `The User Profile for ${this.user.email}`,
        },
      ],
    };
  },
  data() {
    return {
      verificationResent: false,
      tryingToChangePassword: false,
      passwordChanged: false,
      userChange: {
        password: '',
        newPassword: '',
        newPasswordConfirm: '',
      },
      username: '',
    };
  },
  computed: {
    ...authComputed,
    ...userComputed,
    requestAgoTime() {
      const verifiedExpires = new Date(this.user.verifyExpires);
      const todayDate = new Date();
      if (this.user.verifyExpires && verifiedExpires > todayDate) {
        const diffTime = Math.abs(Math.round(Math.abs(verifiedExpires.getTime() - todayDate.getTime()) / 1000 / 60 - 7200));
        return diffTime;
      } else {
        return null;
      }
    },
    ...mapGetters('countries', { findCountriesInStore: 'find' }),
    countries() {
      return this.findCountriesInStore({ query: { $sort: { countryName: 1 } } }).data;
    },
  },
  methods: {
    resendVerification() {
      NProgress.start();
      let verifyError = '';
      NProgress.inc();
      authManagement.resendVerifySignup({ email: this.user.email })
        .then(() => {
          this.verificationResent = true;
          this.$store.dispatch('alert/display',
            {
              type: 'success',
              message: 'Verification resent! Please check your email.',
              timeout: 1500,
              icon: 'fa-thumbs-up',
            },
            { root: true });
        })
        .catch((err) => {
          if (err.data.email) {
            verifyError = err.data.email;
          } else if (err.message) {
            verifyError = err.message;
          }
          this.$store.dispatch('alert/display',
            {
              type: 'error',
              message: verifyError,
              timeout: false,
              icon: 'fa-pause',
            },
            { root: true });
        })
        .finally(() => {
          NProgress.done();
        });
    },
    tryToChangePassword() {
      NProgress.start();
      this.tryingToChangePassword = true;
      authManagement.passwordChange(
        this.userChange.oldPassword,
        this.userChange.newPassword,
        { email: this.user.email },
      )
        .then(() => {
          this.passwordChanged = true;
        })
        .catch((err) => {
          this.$refs.changeObserver.setErrors(err.errors);
        })
        .finally(() => {
          this.tryingToChangePassword = false;
          NProgress.done();
        });
    },
    requestAnimationFrame() {
      this.$refs.changeObserver.reset();
    },
    clearChangePassword() {
      this.$refs.changeObserver.reset();
      this.userChange = {
        password: '',
        newPassword: '',
        newPasswordConfirm: '',
      };
    },
  },
};
</script>

<style lang="scss">
  .resendLink {
    text-decoration: underline;
    cursor: pointer;
  }
  .passwordChanged {
    font-size: 1.3em;
    font-weight: bolder;
  }
  .formBlock > .disabled > *:not(.controls),
  .formBlock > * > .disabled > *:not(.controls) {
    text-decoration: line-through;
    opacity: 0.5;
  }
</style>
