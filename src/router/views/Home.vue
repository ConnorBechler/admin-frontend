<template>
  <v-container fluid>
    <v-row  justify="center" >
      <v-col cols="12" sm="10">
        <v-card flat class="msu dark-grey text-center white--text">
          <v-card-title primary-title>
            <h3>Generic Human Greetings</h3>
          </v-card-title>
        </v-card>
      </v-col>
      <v-col cols="12" sm="8">
      </v-col>
      <div v-if="isAuthenticated">
          <v-btn v-if="!$route.path.includes('/my') && !isElevated" text to="/my">Back to Home</v-btn>
      </div>
    </v-row>
  </v-container>

</template>

<script>
/* eslint-disable */
import { authComputed } from '@/store/helpers';

export default {
  page() {
    return {
      title: this.$appStrings('appName'),
      meta: [
        {
          name: 'description',
          content: `Main page for ${this.$appStrings('appName')}`,
        },
      ],
    };
  },
  data() {
    return {
      currentDiary: '',
    };
  },
  computed: {
    ...authComputed,
  },
};
</script>