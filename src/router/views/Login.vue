<template>
  <!---
    TODO: refactor forms to use is[xx]Pending from feathers-vuex api calls
    TODO: toggle type directly, don't use routes - add keys to input fields
    TODO: maybe implement signup like https://demos.creative-tim.com/vuetify-material-dashboard-pro/#/forms/wizard
  --->
  <v-container class="fill-height" fluid >
    <v-row align="center" justify="center">
      <v-col :cols="widths.cols" :sm="widths.sm" :md="widths.md">
        <v-card class="elevation-16 rounded-corners">
          <v-toolbar class="msu white--text">
            <v-toolbar-title>{{ this.headerTitle }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-icon large class="white--text">fas fa-user</v-icon>
          </v-toolbar>
          <!--- signin form --->
          <template v-if="type === 'signin'">
            <ValidationObserver ref="loginObserver" v-slot="{ invalid }">
              <v-form @submit.prevent="tryToLogIn">
                <v-row justify="center" class="pa-0 forgot" v-if="showWrongPasswordNotice">
                  <v-col cols='auto' class='pb-0'>
                    Incorrect username/password.
                  </v-col>
                  <v-col cols='auto' class='pt-0'>
                    Did you forget your password?
                    <router-link :to="{ name: 'login', params: { type: 'forgot', slug: user.email }}" class="forgotLink">Reset It</router-link>
                  </v-col>
                </v-row>
                <v-card-text>
                  <ValidationProvider
                    ref="email"
                    name="Email"
                    rules="required|email"
                    v-slot="{ errors }"
                  >
                    <v-text-field
                      v-model="user.email"
                      prepend-icon="fa-user"
                      name="email"
                      label="Email Address"
                      type="text">
                    </v-text-field>
                  </ValidationProvider>
                  <ValidationProvider
                    ref="password"
                    name="Password"
                    rules="required|min:6"
                    v-slot="{ errors }"
                  >
                    <v-text-field
                      v-model="user.password"
                      id="password"
                      prepend-icon="fa-lock"
                      name="password"
                      label="Password"
                      type="password">
                    </v-text-field>
                  </ValidationProvider>
                </v-card-text>
                <v-card-actions>
                  <v-container class="pa-0">
                    <v-row justify="center" no-gutters>
                      <v-col cols="auto">
                        <v-btn
                          :disabled="invalid"
                          :loading="isAuthenticatePending"
                          type="submit"
                          class="msu white--text">
                            Sign In
                        </v-btn>
                      </v-col>
                    </v-row>
                    <v-row justify="center" class="pt-2" v-if="Number(registrationOpen)">
                      <v-col cols="auto">
                        <router-link :to="{ name: 'login', params: {...$route.params, type: 'signup' } }" replace class="toggleLink">Don't have an Account? Sign Up instead</router-link>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-actions>
              </v-form>
            </ValidationObserver>
          </template>
          <!--- end signin form --->
          <!--- signup form --->
          <!---
            TODO: signup: change layout to be a 70/30 split with instructions on the side
          --->
          <template v-if="type === 'signup'">
            <ValidationObserver ref="signupObserver" v-slot="{ invalid }" v-if="Number(registrationOpen)">
              <v-form @submit.prevent="tryToSignup">
                <v-card-text>
                  To get started, please enter your name...
                  <ValidationProvider
                    ref="first"
                    name="First Name"
                    rules="required|min:2"
                    v-slot="{ errors }"
                  >
                    <v-text-field
                      v-model="user.first"
                      prepend-icon="fa-user"
                      :error-messages="errors"
                      name="first"
                      label="First (Given) Name"
                      type="text">
                    </v-text-field>
                  </ValidationProvider>
                  <ValidationProvider
                    ref="last"
                    name="Last Name"
                    rules="required|min:2"
                    v-slot="{ errors }"
                  >
                    <v-text-field
                      v-model="user.last"
                      prepend-icon="fa-user"
                      :error-messages="errors"
                      name="last"
                      label="Last (Family) Name"
                      type="text">
                    </v-text-field>
                  </ValidationProvider>
                  ... email address...
                  <ValidationProvider
                    ref="email"
                    name="Email"
                    rules="required|email|emailConfirm:email_confirmation"
                    v-slot="{ errors }"
                  >
                    <v-text-field
                      v-model="user.email"
                      prepend-icon="fa-at"
                      :error-messages="errors"
                      name="email"
                      label="Email Address"
                      type="text"
                      autocomplete="disabled">
                    </v-text-field>
                  </ValidationProvider>
                  <ValidationProvider
                    vid="email_confirmation"
                    ref="email_confirmation"
                    name="Email Confirmation"
                    rules="required"
                    v-slot="{ errors }"
                  >
                    <v-text-field
                      v-model="user.emailConfirm"
                      v-show="user.email !== ''"
                      prepend-icon="fa-user"
                      :error-messages="errors"
                      name="emailConfirm"
                      label="Confirm Email Address"
                      type="text"
                      autocomplete="disabled">
                    </v-text-field>
                    <br v-if="errors.length > 0">
                  </ValidationProvider>
                  ... and enter a password
                  <ValidationProvider
                    ref="password"
                    name="Password"
                    rules="required|min:6|password:password_confirmation"
                    v-slot="{ errors }"
                  >
                    <v-text-field
                      v-model="user.password"
                      id="password"
                      prepend-icon="fa-lock"
                      :error-messages="errors"
                      name="password"
                      label="Password"
                      type="password"
                      autocomplete="disabled">
                    </v-text-field>
                  </ValidationProvider>
                  <ValidationProvider
                    vid="password_confirmation"
                    ref="password_confirmation"
                    name="Password Confirmation"
                    rules="required"
                    v-slot="{ errors }"
                  >
                    <v-text-field
                      v-model="user.passwordConfirm"
                      v-show="user.password !== ''"
                      id="passwordConfirm"
                      prepend-icon="fa-lock"
                      :error-messages="errors"
                      name="passwordConfirm"
                      label="Confirm Password"
                      type="password"
                      autocomplete="disabled">
                    </v-text-field>
                  </ValidationProvider>
                  <v-row justify="center">
                    <v-col cols="auto">
                      <vue-recaptcha
                        ref="recaptcha"
                        @verify="onCaptchaVerified"
                        @expired="onCaptchaExpired"
                        sitekey="6Le5ULQaAAAAACoFAKoVFLEpF1LhZJ5A7sGMJ00C">
                      </vue-recaptcha>
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-actions>
                  <v-container class="pa-0">
                    <v-row justify="center" no-gutters>
                      <v-col cols="auto">
                        <v-btn
                          :disabled="tryingToSignup || invalid || waitingOnCaptcha"
                          :loading="tryingToSignup"
                          type="submit"
                          class="msu white--text">
                            <slot>
                              Sign Up
                            </slot>
                        </v-btn>
                      </v-col>
                    </v-row>
                    <v-row justify="center" class="pt-2 forgot" v-if="emailInUse">
                        This email is already registered -&nbsp;
                        <router-link to="/login/forgot" class="forgotLink"> Reset your password?</router-link>
                    </v-row>
                    <v-row justify="center" class="pt-2">
                      <v-col cols="auto">
                        <router-link :to="{ name: 'login', params: { ...$route.params, type: 'signin' } }" replace class="toggleLink">Already have an Account? Sign In instead</router-link>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-actions>
              </v-form>
            </ValidationObserver>
            <v-card-text class="text-subtitle-1" v-else>
              Signup is temporarily disabled; please check back later.
            </v-card-text>
          </template>
          <!--- end signup form --->
          <!--- forgot page --->
          <template v-if="type === 'forgot'">
            <ValidationObserver ref="forgotObserver" v-slot="{ invalid }">
              <v-form @submit.prevent="tryToSendReset">
                <v-card-text>
                  To reset your password, please enter your email address
                  <ValidationProvider
                    ref="email"
                    name="Email"
                    rules="required|email"
                    v-slot="{ errors }"
                  >
                    <v-text-field
                      v-model="user.email"
                      prepend-icon="fa-user"
                      :error-messages="errors"
                      name="email"
                      label="Email Address"
                      type="text">
                    </v-text-field>
                  </ValidationProvider>
                </v-card-text>
                <v-card-actions>
                  <v-container class="pa-0">
                    <v-row justify="center" no-gutters v-if="!tryingToSendResetDone">
                      <v-col cols="auto">
                        <v-btn
                          :disabled="tryingToSendReset || invalid"
                          :loading="tryingToSendReset"
                          type="submit"
                          class="msu white--text">
                            <slot>
                              Send Reset Link
                            </slot>
                        </v-btn>
                      </v-col>
                    </v-row>
                    <v-row justify="center" class="forgot text-center" v-if="tryingToSendResetDone">
                        If an account with this email exists, a password reset email will be sent shortly.
                    </v-row>
                  </v-container>
                </v-card-actions>
              </v-form>
            </ValidationObserver>
          </template>
          <!--- end forgot form --->
          <!--- reset form --->
          <template v-if="type === 'reset'">
            <ValidationObserver ref="resetObserver" v-slot="{ invalid }">
              <v-form @submit.prevent="tryToReset">
                <v-card-text>
                  Please enter your new password
                  <ValidationProvider
                    ref="newpassword"
                    name="New Password"
                    rules="required|min:6|password:newpassword_confirmation"
                    v-slot="{ errors }"
                  >
                    <v-text-field
                      v-model="user.newPassword"
                      id="password"
                      prepend-icon="fa-lock"
                      :error-messages="errors"
                      name="password"
                      label="Password"
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
                      v-model="user.newPasswordConfirm"
                      id="passwordConfirm"
                      prepend-icon="fa-lock"
                      :error-messages="errors"
                      name="passwordConfirm"
                      label="Confirm Password"
                      type="password">
                    </v-text-field>
                  </ValidationProvider>
                </v-card-text>
                <v-card-actions>
                  <v-container class="pa-0">
                    <v-row justify="center" no-gutters>
                      <v-col cols="auto">
                        <v-btn
                          :disabled="tryingToReset || invalid"
                          :loading="tryingToReset"
                          type="submit"
                          class="msu white--text">
                            Save Password
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-actions>
              </v-form>
            </ValidationObserver>
          </template>
          <!--- end reset form --->
          <!--- verify page --->
          <template v-if="type === 'verify'">
            <v-card-text class="verificationText">
              <span :class="(this.verifyError) ? 'error' : 'success'">
                {{ this.verifyMessage }}
              </span>
            </v-card-text>
            <v-card-actions>
              <v-container class="pa-0">
                <v-row justify="center">
                  <v-col cols="auto">
                    <router-link to="/login" replace class="toggleLink" v-if="verifySuccess">Sign in to continue</router-link>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-actions>
          </template>
          <!--- end verify form --->
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import NProgress from 'nprogress';
import { mapActions, mapState } from 'vuex';
import VueRecaptcha from 'vue-recaptcha';
// import LogRocket from 'logrocket';
import { authManagement } from '@/plugins/feathers-client';
import { authMethods, authComputed } from '@/store/helpers';

export default {
  name: 'auth',
  components: { VueRecaptcha },
  page() {
    return {
      title: `Login | ${this.$appStrings('appName')}`,
      meta: [
        {
          name: 'description',
          content: `Logging in to ${this.$appStrings('appName')}`,
        },
      ],
    };
  },
  props: {
    type: {
      type: String,
      default: 'signin',
    },
    slug: String,
    sessionId: {
      type: String,
      default: '',
    },
    routeAfter: {
      type: Object,
      default: () => {},
    },
    widths: {
      type: Object,
      default: () => {
        return {
          cols: 12,
          sm: 8,
          md: 4,
        };
      },
    },
  },
  data() {
    return {
      authError: null,
      forgotError: null,
      emailInUse: false,
      headerTitle: '',
      showWrongPasswordNotice: false,
      tryingToSendReset: false,
      tryingToSendResetDone: false,
      tryingToSendResetMessage: '',
      tryingToSignup: false,
      tryingToReset: false,
      verifySuccess: false,
      verifyError: false,
      verifyMessage: '',
      waitingOnCaptcha: true,
      recaptchaToken: null,
      user: {
        first: '',
        last: '',
        email: '',
        emailConfirm: '',
        name: '',
        password: '',
        passwordConfirm: '',
        newPassword: '',
        newPasswordConfirm: '',
        newEmail: '',
        type: 'local',
      },
    };
  },
  computed: {
    ...authComputed,
    ...mapState('app', ['registrationOpen']),
  },
  methods: {
    ...authMethods,
    ...mapActions('users', { createUser: 'create' }),
    onCaptchaExpired() {
      this.waitingOnCaptcha = true;
      this.recaptchaToken = null;
    },
    onCaptchaVerified(recaptchaToken) {
      this.waitingOnCaptcha = false;
      this.recaptchaToken = recaptchaToken;
    },
    // Try to log the user in with the email
    // and password they provided.
    tryToLogIn() {
      NProgress.start();
      this.showWrongPasswordNotice = false;
      // Reset the authError if it existed.
      this.authError = null;
      return this.authenticate({
        email: this.user.email,
        password: this.user.password,
        strategy: 'local',
      })
        .then(() => {
          /*
          LogRocket.identify(resp.id, {
            email: resp.email,
          });
          */
          NProgress.done();
          this.$store.dispatch('alert/display',
            {
              type: 'success',
              message: 'Logged In!',
              timeout: 1500,
              icon: 'fa-thumbs-up',
            },
            { root: true });
          // Redirect to the originally requested page, or to the home page
          this.$router.push(this.$route.query.redirectFrom || this.$route.params.redirectFrom || { name: (this.isElevated) ? 'adminHome' : 'home' });
        })
        .catch((error) => {
          NProgress.done();
          this.authError = error;
          if (this.authError.code === 401) {
            this.showWrongPasswordNotice = true;
          } else {
            this.$store.dispatch('alert/display',
              {
                type: 'error',
                message: this.authError.message,
                timeout: 2000,
                icon: 'fa-exclamation',
              },
              { root: true });
          }
        });
    },
    tryToSignup() {
      NProgress.start();
      this.emailInUse = false;
      this.tryingToSignup = true;
      this.authError = null;
      // signUp checks for available email, and then creates
      authManagement
        .checkUnique({
          email: this.user.email,
        })
        .then(() => {
          NProgress.inc();
          return this.createUser({
            first: this.user.first,
            last: this.user.last,
            email: this.user.email,
            password: this.user.password,
            recaptchaToken: this.recaptchaToken,
          })
            .then(() => {
              NProgress.inc();
              this.authError = null;
              return this.authenticate({
                email: this.user.email,
                password: this.user.password,
                strategy: 'local',
              })
                .then(() => {
                  NProgress.inc();
                  this.$router.push({ name: (this.isElevated) ? 'adminHome' : 'home' });
                });
            });
        })
        .catch((err) => {
          // assuming taken email
          this.tryingToSignup = false;
          if (err.code === 500) {
            this.authError = err;
          } else if (err.errors && err.errors.email) {
            this.emailInUse = true;
            this.$refs.password.reset();
            this.$refs.password_confirmation.reset();
            this.user.passwordConfirm = '';
            this.user.password = '';
          } else {
            this.authError = err.message;
          }
        })
        .finally(() => {
          NProgress.done();
          if (this.authError) {
            this.$store.dispatch('alert/display',
              {
                type: 'error',
                message: this.authError,
                timeout: 2500,
                icon: 'fa-exclamation',
              },
              { root: true });
          }
        });
    },
    tryToVerify() {
      this.verifyError = false;
      this.verifySuccess = false;
      this.verifyMessage = '';
      NProgress.start();
      if (this.slug) {
        authManagement.verifySignupLong(this.slug)
          .then(() => {
            this.verifySuccess = true;
            this.verifyMessage = 'Thanks! Your account is now confirmed, and you can continue using the application.';
          })
          .catch(() => {
            NProgress.done();
            this.verifyError = true;
            this.verifyMessage = 'There was a problem with your verification code. Please check your email again and click the link, or you may have already verified your account.';
          })
          .finally(() => {
            NProgress.done();
          });
      } else {
        NProgress.done();
        this.$router.replace({ name: 'login' });
      }
    },
    tryToSendReset() {
      this.tryingToSendReset = true;
      this.tryingToSendResetDone = false;
      this.tryToSendResetMessage = '';
      NProgress.start();
      authManagement.sendResetPwd({ email: this.user.email })
        .then(() => {})
        .catch(() => {})
        .finally(() => {
          NProgress.done();
          this.tryingToSendReset = false;
          this.tryingToSendResetDone = true;
        });
    },
    tryToReset() {
      this.tryingToReset = true;
      this.tryingToResetDone = false;
      this.tryToResetMessage = '';
      NProgress.start();
      authManagement.resetPwdLong(
        this.slug,
        this.user.newPassword,
      )
        .then(() => {
          NProgress.done();
          this.tryingToReset = false;
          this.tryingToResetDone = true;
          this.$store.dispatch('alert/display',
            {
              type: 'success',
              message: 'Password Reset! You can now login with the new password.',
              timeout: 2500,
              icon: 'fa-thumbs-up',
            },
            { root: true });
          this.$router.replace({ name: 'login' });
        })
        .catch((error) => {
          this.tryingToReset = false;
          NProgress.done();
          this.resetError = error;
          this.$store.dispatch('alert/display',
            {
              type: 'error',
              message: this.resetError.message,
              timeout: false,
              icon: 'fa-exclamation',
            },
            { root: true });
        });
    },
    userReset() {
      this.user = {
        email: '',
        emailConfirm: '',
        name: '',
        password: '',
        passwordConfirm: '',
        newPassword: '',
        newPasswordConfirm: '',
        newEmail: '',
        type: 'local',
      };
    },
  },
  mounted() {
    switch (this.type) {
    case 'verify':
      this.headerTitle = 'Account Verification';
      this.tryToVerify();
      // trigger action for verify with slug
      // if logged in -> profile; if not, login
      break;
    case 'reset':
      this.headerTitle = 'Reset Password';
      // show view for reset
      // submit triggers action for reset with slug + new password
      break;
    case 'forgot':
      this.headerTitle = 'Forgot Password?';
      if (this.slug) {
        this.user.email = this.slug;
      }
      // show view for forgot (enter email)
      // submit triggers action for sendReset
      break;
    case 'signup':
      this.headerTitle = 'Sign Up - Create Account';
      // show view for forgot (enter email)
      // submit triggers action, first checksUnique, then fires create
      break;
    default:
      this.headerTitle = 'Sign In';
      break;
    }
  },
  beforeResolve(to, from, next) {
    if (this.store.getters['auth/isAuthenticated']) {
      next(this.$route.query.redirectFrom || this.$route.params.redirectFrom || { name: (this.store.getters['auth/isElevated']) ? 'adminHome' : 'home' });
    } else {
      next();
    }
  },
};

// leave here so it forces the render even on page reload mid-step
const $script = document.createElement('script');
$script.async = true;
$script.src = 'https://www.google.com/recaptcha/api.js?onload=vueRecaptchaApiLoaded&render=explicit';
document.head.appendChild($script);
</script>

<style lang="scss">
  .toggleLink {
    font-size: .9em;
  }
  .toggleLink:visited {
    color: inherit;
  }
  .forgot, .forgotLink {
    color: red;
  }
  .verificationText {
    font-size: 1.1em;
  }
</style>
