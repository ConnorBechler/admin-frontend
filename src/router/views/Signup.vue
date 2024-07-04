<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" sm="10" md="6">
        <ValidationObserver ref="signupObserver" v-slot="{ invalid, validate }" v-if="!signupSuccess">
          <v-card class="my-10">
            <v-card-title class="text-h5 font-weight-bold">
              <v-spacer></v-spacer>
              Participant Registration
              <v-spacer></v-spacer>
            </v-card-title>
            <v-card-text class="text-body-1" v-if="Number(participantRegistrationOpen)">
              <v-row justify="center">
                <v-col cols="12">
                  <!--- put important info up here if needed --->
                  <p class="elevation-3 pa-3 rounded msu light-grey">
                    <span class="font-weight-bold text-decoration-underline">IMPORTANT</span>: (extra info e.g. signing up children etc)
                  </p>
                  <p>
                    Thank you for your interest in participating in PROJECT NAME. Diarists periodically record themselves using our mobile app. You may submit as many recordings as you like, for the duration of the research project. Participation is completely voluntary. You have the right to say no at any point, and you may change your mind and withdraw your data at any time. You may choose not to answer specific questions.
                  </p>
                  <p>
                    To view the full Research Participant Information and download a copy of the Consent Form, please visit (CONSENT LINK).
                  </p>
                  <p class="mx-5">
                    <ValidationProvider
                      ref="consent"
                      name="Your consent"
                      :rules="{ required: { allowFalse: false } }"
                      v-slot="{ errors }"
                    >
                      <v-checkbox
                        v-model="user.metadata.consent"
                        :error-messages="errors"
                        label="I've read the Consent Form and agree to participate"
                        name="consent">
                      </v-checkbox>
                    </ValidationProvider>
                  </p>
                </v-col>
              </v-row>
              <v-row class="mt-5 elevation-1 rounded">
                <v-col cols="12" class="text-center text-h6 msu light-grey">
                  Required Information
                </v-col>
                <v-col class="py-1" cols="12" sm="6">
                  <ValidationProvider
                    ref="first"
                    name="First name"
                    rules="required|min:2"
                    v-slot="{ errors }"
                  >
                    <v-text-field
                      v-model="user.first"
                      :error-messages="errors"
                      name="first"
                      label="First name"
                      type="text">
                    </v-text-field>
                  </ValidationProvider>
                </v-col>
                <v-col class="py-1" cols="12" sm="6">
                  <ValidationProvider
                    ref="last"
                    name="Last name"
                    rules="required|min:2"
                    v-slot="{ errors }"
                  >
                    <v-text-field
                      v-model="user.last"
                      :error-messages="errors"
                      name="last"
                      label="Last name"
                      type="text">
                    </v-text-field>
                  </ValidationProvider>
                </v-col>
                <!---
                <v-col class="py-1" cols="12" sm="4">
                  <EditorDate
                    :clone="user.metadata"
                    field="dateOfBirth"
                    label="Date of Birth"
                    :maxDate="$moment().subtract(3, 'year').format('YYYY-MM-DD')"
                    :required="true">
                  </EditorDate>
                </v-col>
                --->
                <v-col class="py-1" cols="12">
                  <ValidationProvider
                    ref="email"
                    name="Email"
                    rules="required|email"
                    v-slot="{ errors }"
                  >
                    <v-text-field
                      v-model="user.email"
                      :error-messages="errors"
                      name="email"
                      label="Email Address"
                      type="text">
                    </v-text-field>
                  </ValidationProvider>
                </v-col>
                <v-col class="pt-10" cols="12">
                  <p>
                    When this project is done, we will anonymize audio recordings and transcriptions. We won't share your name, or any information that could identify you.  Let us know below if you would like us to include your data in the research archives.
                  </p>
                  <ValidationProvider
                    ref="permission_share_research"
                    name="Reseseach Share Permission choice"
                    rules="required"
                    v-slot="{ errors }"
                  >
                    <v-radio-group
                      v-model="user.metadata.permission_share_research"
                      :error-messages="errors"
                      class="pl-2">
                      <v-radio
                        label="Yes, I agree to my anonymized stories being archived."
                        :value="true">
                      </v-radio>
                      <v-radio
                        label="No, I would not like my anonymized stories to be archived."
                        :value="false">
                      </v-radio>
                    </v-radio-group>
                    <v-text-field v-model="user.metadata.permission_share_research" class="d-none"></v-text-field>
                  </ValidationProvider>
                </v-col>
                <v-col class="pt-5" cols="12">
                  <p>
                    Each week we select a few anonymized stories to feature online.
                  </p>
                  <ValidationProvider
                    ref="permission_share"
                    name="Featured Permission choice"
                    rules="required"
                    v-slot="{ errors }"
                  >
                    <v-radio-group
                      v-model="user.metadata.permission_share"
                      :error-messages="errors"
                      class="pl-2">
                      <v-radio
                        label="Yes, I am open to my anonymized stories being featured online"
                        :value="true">
                      </v-radio>
                      <v-radio
                        label="No, I would not like my stories to be featured online"
                        :value="false">
                      </v-radio>
                    </v-radio-group>
                    <v-text-field v-model="user.metadata.permission_share" class="d-none"></v-text-field>
                  </ValidationProvider>
                </v-col>
                <!--- Optional payment opt-in/out --->
                <!---
                <v-col class="pt-5" cols="12">
                  <p>
                    Participants who contribute at least 15 minutes of Audio Diary in a week are eligible to receive a $5 thank-you (as an Amazon gift card that will be emailed to you). If you would prefer to opt out of receiving a gift card, so that we can use it to thank another participant, you may choose to do that as well. Please let us know what you would prefer.
                  </p>
                  <ValidationProvider
                    ref="payment_optout"
                    name="Payment Opt-in/out"
                    rules="required"
                    v-slot="{ errors }"
                  >
                    <v-radio-group
                      v-model="user.metadata.payment_optout"
                      :error-messages="errors"
                      class="pl-2">
                      <v-radio
                        label="Please use my $5 to pay a future participant"
                        :value="true">
                      </v-radio>
                      <v-radio
                        label="Please pay the $5 to"
                        :value="false">
                      </v-radio>
                      <ValidationProvider
                        v-if="user.metadata.payment_optout === false"
                        ref="paymentGroup"
                        name="Payment choice"
                        :rules="user.metadata.payment_optout === false ? 'required' : ''"
                        v-slot="{ errors: groupErrors }"
                        class="pt-2 px-8"
                      >
                        <v-autocomplete
                          v-model="user.metadata.paymentGroup"
                          :readonly="isFindPaymentGroupsPending || !availablePaymentGroups.length"
                          :disabled="isFindPaymentGroupsPending || !availablePaymentGroups.length"
                          name="paymentGroups"
                          :error-messages="groupErrors"
                          ref="paymentGroups"
                          label="Payment To (select one)"
                          :items="availablePaymentGroups"
                          item-value="id"
                          item-text="name"
                          dense
                          outlined
                          :menu-props="{ auto: true }"
                          :loading="isFindPaymentGroupsPending"
                          autocomplete="nope">
                        </v-autocomplete>
                      </ValidationProvider>
                    </v-radio-group>
                    <v-text-field v-model="user.metadata.payment_optout" class="d-none"></v-text-field>
                    <v-text-field v-model="user.metadata.paymentGroup" class="d-none"></v-text-field>
                  </ValidationProvider>
                </v-col>
                --->
              </v-row>
              <!--- Optional extra info; left as examples for reuse/modification --->
              <v-row class="pb-5 mt-10 elevation-1 rounded">
                <v-col cols="12" class="text-center text-h6 msu light-grey">
                  Helpful Information
                </v-col>
                <v-col class="py-2" cols="12">
                  <span class="">
                    How did you hear about the project? If a friend referred you, make sure to write their name so we can send them a thank you!
                  </span>
                  <v-text-field
                    v-model="user.metadata.source"
                    name="source"
                    placeholder="e.g. News, friend"
                    :hide-details="true"
                    type="text"
                    autocomplete="nope">
                  </v-text-field>
                </v-col>
                <!--- Example questions from original project --->
                <v-col class="py-2" cols="12" sm="6">
                  <v-text-field
                    v-model="user.metadata.ethnicity"
                    name="ethnicity"
                    label="Ethnicity"
                    :hide-details="true"
                    type="text"
                    autocomplete="nope">
                  </v-text-field>
                </v-col>
                <v-col class="py-2" cols="12" sm="6">
                  <v-text-field
                    v-model="user.metadata.gender"
                    name="gender"
                    label="Gender"
                    :hide-details="true"
                    type="text"
                    autocomplete="nope">
                  </v-text-field>
                </v-col>
                <v-col class="py-2" cols="12">
                  <v-autocomplete
                    v-model="user.metadata.educationLevel"
                    name="educationLevel"
                    ref="educationLevel"
                    label="Education"
                    multiple
                    :items="educationLevels"
                    :menu-props="{ auto: true }"
                    autocomplete="nope">
                  </v-autocomplete>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="user.metadata.otherInfo"
                    rows="5"
                    outlined
                    dense
                    label="Anything else you'd like to tell us?"
                    type="text">
                  </v-textarea>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-text v-else>
              <v-row class="my-5">
                <v-col cols="12">
                  <p class="text-center">
                    Signing up is currently disabled; please check back later.
                  </p>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions v-if="Number(participantRegistrationOpen)">
              <v-container class="pa-0">
                <!---
                <hr>
                <hr>
                <v-row justify="center" class="mt-5">
                  <v-col cols="auto">
                    <vue-recaptcha
                      ref="recaptcha"
                      @verify="onCaptchaVerified"
                      @expired="onCaptchaExpired"
                      sitekey="6Le5ULQaAAAAACoFAKoVFLEpF1LhZJ5A7sGMJ00C">
                    </vue-recaptcha>
                  </v-col>
                </v-row>
                --->
                <v-row justify="center" class="py-2">
                  <v-col cols="12" class="text-center">
                    <span v-if="showErrors && invalid" class="red--text">There are errors with your form, please check the fields in red above</span>
                  </v-col>
                  <v-col cols="auto">
                    <v-btn
                      :disabled="tryingToSignup"
                      :loading="tryingToSignup"
                      type="button"
                      class="msu white--text"
                      @click="validate().then(valid => valid ? tryToSignup() : (showErrors = true));"
                      :class="(tryingToSignup) ? 'msu light-grey white--text' : ''">
                      Sign Up
                    </v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-actions>
          </v-card>
        </ValidationObserver>
        <v-card class="mt-10" v-else>
          <v-card-title class="text-h5 font-weight-bold">
            <v-spacer></v-spacer>
            Participant Registration
            <v-spacer></v-spacer>
          </v-card-title>
          <v-card-text class="text-body-1">
            <v-row justify="center">
              <v-col cols="12">
                <p class="pa-3">
                  Thank you very much for registering in this project. Our research team will be in contact with you soon via email with instructions for recording yourself, and with regular diary prompts. If you don't hear from us within 48 hours, please check your spam folder.
                </p>
              </v-col>
              <v-col cols="auto">
                <v-btn
                  :disabled="startingOver"
                  :loading="startingOver"
                  type="button"
                  class="msu white--text"
                  @click="startOver"
                  :class="(startingOver) ? 'msu light-grey white--text' : ''">
                  Register Another
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

</template>

<script>
/* eslint-disable */
import { makeFindMixin, makeGetMixin } from 'feathers-vuex';
import NProgress from 'nprogress';
import { mapActions, mapState } from 'vuex';
import VueRecaptcha from 'vue-recaptcha';
import cloneDeep from 'lodash/cloneDeep';
import { appComputed } from '@/store/helpers';
import feathersClient from '@/plugins/feathers-client';

export default {
  components: { VueRecaptcha },
  mixins: [
    makeFindMixin({ service: 'paymentGroups', watch: true }),
  ],
  page() {
    return {
      title: `Sign up - ${this.$appStrings('appName')}`,
      meta: [
        {
          name: 'description',
          content: `Sign up form for ${this.$appStrings('appName')}`,
        },
      ],
    };
  },
  data() {
    return {
      headerTitle: '',
      tryingToSignup: false,
      startingOver: false,
      signupSuccess: false,
      waitingOnCaptcha: true,
      recaptchaToken: null,
      user: {},
      defaultUser: {
        first: '',
        last: '',
        email: '',
        metadata: {
          consent: null,
          dateOfBirth: '',
          permission_share_research: null,
          permission_share: null,
          payment_optout: null,
          paymentGroup: null,
          participant_category: null,
          ethnicity: null,
          gender: null,
          locationGrowingUp: null,
          locationCurrent: null,
          educationLevel: null,
          otherInfo: null,
          frequency: 'weekly',
        }
      },
      showErrors: false,
      educationLevels: [
        "Elementary",
        "High school",
        "Some college",
        "Bachelor's degree",
        "Master's degree",
        "Professional degree or PhD",
      ],
    };
  },
  computed: {
    ...appComputed,
    ...mapState('app', ['participantRegistrationOpen']),
    paymentGroupsParams() {
      const query = { active: 1, hidden: 0, $sort: { name: 1 }, $limit: 99999 };
      return { query };
    },
    availablePaymentGroups: {
      get() {
        let ret = [
          {
            id: '99999999-9999-9999-9999-999999999999',
            name: 'Me',
            shortName: 'Self'
          },
        ];
        if (this.paymentGroups.length) {
          ret = [ ...ret, ...this.paymentGroups ];
        }
        return ret;
      },
      default: [],
    },
  },
  methods: {
    onCaptchaExpired() {
      this.waitingOnCaptcha = true;
      this.recaptchaToken = null;
    },
    onCaptchaVerified(recaptchaToken) {
      this.waitingOnCaptcha = false;
      this.recaptchaToken = recaptchaToken;
    },
    tryToSignup() {
      NProgress.start();
      this.tryingToSignup = true;
      feathersClient.service('subjectMaintenance')
        .create({
          action: 'signup',
          params: {
            ...this.user,
            // recaptchaToken: this.recaptchaToken,
          }
        })
        .then((resp) => {
          NProgress.inc();
          this.tryingToSignup = false;
          if (resp) {
            this.signupSuccess = true;
            this.user = cloneDeep(this.defaultUser);
          }
        })
        .catch((err) => {
          this.tryingToSignup = false;
          console.log(err);
        })
        .finally(() => {
          NProgress.done();
        });
    },
    startOver() {
      NProgress.start();
      this.user = cloneDeep(this.defaultUser);
      this.tryingToSignup = false;
      this.signupSuccess = false;
      NProgress.done();
    },
  },
  created() {
    // window.location.href = 'https://forms.gle/ygbhdYNyPbJaoBxJ6';
    this.user = cloneDeep(this.defaultUser);
  },
};

/* disabling 2021-04-22
// leave here so it forces the render even on page reload mid-step
const $script = document.createElement('script');
$script.async = true;
$script.src = 'https://www.google.com/recaptcha/api.js?onload=vueRecaptchaApiLoaded&render=explicit';
document.head.appendChild($script);
*/
</script>

<style lang="scss">
  .verificationText {
    font-size: 1.1em;
  }
</style>
