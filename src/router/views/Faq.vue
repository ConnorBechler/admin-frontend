<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" sm="10" md="6">
        <v-card class="mt-10">
          <v-card-title class="text-h5 font-weight-bold">
            <v-spacer></v-spacer>
            Application Info
            <v-spacer></v-spacer>
          </v-card-title>
          <v-card-text class="text-body-1">
            <v-row justify="center">
              <v-col cols="12">
                <p class="pa-3">
                  Your data will be stored on our secure server to which only team members have access. We give all participants a subject ID number, to keep personal identifying information separate from your audio files. Personal identifying information, such as your name and email address, will be kept in a distinct password-protected record separate from your data.
                </p>
                <p class="pa-3">
                  (( add any University-/Project-specific or required text in here as well to utilize for App Store submissions for privacy/contact page))
                </p>
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

export default {
  page() {
    return {
      title: `FAQ - ${this.$appStrings('appName')}`,
      meta: [
        {
          name: 'description',
          content: `FAQ for for ${this.$appStrings('appName')}`,
        },
      ],
    };
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
