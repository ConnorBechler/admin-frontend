<template>
  <v-row justify="center">
    <v-dialog v-model="show" :fullscreen="fullscreen" hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar dark :color="color">
          <v-btn icon dark @click="close">
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>Settings</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click.stop="save">
              Save
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <slot></slot>
        </v-card-text>
        <v-spacer></v-spacer>
        <v-card-actions>
          <slot name="actions"></slot>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  props: {
    fullscreen: {
      type: Boolean,
      default: false,
    },
    show: {
      type: Boolean,
      default: false,
    },
    showActions: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: 'msu',
    },
  },
  methods: {
    close() {
      this.$emit('close');
      this.show = false;
    },
    save() {
      this.$emit('save');
      this.show = false;
    },
  },
  mounted() {
    document.addEventListener('keydown', (e) => {
      if (this.show && e.keyCode === 27) {
        this.close();
      }
    });
  },
};
</script>
