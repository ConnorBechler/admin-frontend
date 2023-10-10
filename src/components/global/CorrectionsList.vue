<template>
  <v-carousel hide-delimiters>
    <v-carousel-item
      v-for="(item,idx) in items"
      :key="idx"
    ></v-carousel-item>
  </v-carousel>
</template>

<script>
/* eslint-disable */

export default {
  name: 'CorrectionsList',
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
};
</script>
