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
        <div v-if="isAuthenticated">
          <br>
        </div>
      </v-col>
    </v-row>
  </v-container>

</template>

<script>
/* eslint-disable */
import { authComputed } from '@/store/helpers';
import feathersClient from '@/plugins/feathers-client';


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
