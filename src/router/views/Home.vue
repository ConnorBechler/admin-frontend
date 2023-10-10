
<template>
  <v-container fluid>
    <v-row  justify="center" >
      <v-col cols="12" sm="10">
        <v-card flat class="msu dark-grey text-center white--text">
          <v-card-title primary-title>
          </v-card-title>
        </v-card>
      </v-col>
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
  computed: {
    ...authComputed,
  },
};
</script>
