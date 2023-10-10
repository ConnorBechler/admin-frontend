<template>
  <v-row justify="center">
    <v-dialog
      v-model="show"
      :fullscreen="fullscreen || this.$vuetify.breakpoint.xs"
      :persistent="persistent"
      width="50%"
      @keydown.esc="close"
      :transition="(fullscreen || this.$vuetify.breakpoint.xs) ? 'dialog-bottom-transition' : 'fade-transition'">
      <v-card>
        <v-toolbar dark :color="color">
          <v-btn icon dark @click.stop="close">
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title v-if="!(fullscreen || this.$vuetify.breakpoint.xs)">{{ title }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click.stop="save">
              Save
            </v-btn>
            <v-btn dark text @click.stop="close">
              Cancel
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-row>
            <v-col cols="12" v-if="fullscreen || this.$vuetify.breakpoint.xs">
              <span class="text-h5">
                {{ title }}
              </span>
            </v-col>
            <v-col cols="12">
              <span class="text-body-1">
                <slot name="instructions">
                  {{ instructions }}
                </slot>
              </span>
            </v-col>
          </v-row>
          <component v-if="editorType" :is="`Editor${editorType}`"
            :clone="clone"
            :isDirty="isDirty"
            :standalone="editorProps.standalone"
            :showControls="editorProps.showControls"
            :autofill="editorProps.autofill"
            :nested="editorProps.nested"
            :mergedProfileData="editorProps.mergedProfileData"
            :showProfile="editorProps.showProfile">
          </component>
          <slot v-else></slot>
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
import feathersVuexFormHelpers from '@/mixins/feathersVuexFormHelpers';

export default {
  mixins: [
    feathersVuexFormHelpers,
  ],
  props: {
    clone: Object,
    isDirty: Boolean,
    editorType: {
      type: String,
      default: '',
    },
    editorProps: {
      type: Object,
      default() {
        return {
          standalone: true,
          showControls: false,
          autofill: false,
          nested: true,
          mergedProfileData: false,
          showProfile: false,
        };
      },
    },
    fullscreen: {
      type: Boolean,
      default: false,
    },
    persistent: {
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
    autoSaving: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: 'msu',
    },
    title: {
      type: String,
      default: '',
    },
    instructions: {
      type: String,
      default: '',
    },
  },
  methods: {
    close() {
      this.resetRow(this.clone);
      this.$emit('close');
    },
    save() {
      this.saveRow(this.clone);
      this.$emit('close');
    },
  },
};
</script>
