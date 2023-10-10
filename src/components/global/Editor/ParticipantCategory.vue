<template>
  <span>
    <ValidationObserver ref="editorObserver" v-slot="{ invalid }">
      <v-row>
        <v-col cols="12" md="6">
          <ValidationProvider
            ref="shortName"
            name="Short/Menu Name"
            rules="required"
            v-slot="{ errors }">
            <v-text-field
              :id="`${clone.id || clone.__id}-${prependField}shortName`"
              v-model="clone[prependField + 'shortName']"
              :disabled="parentDisabled"
              :error-messages="errors"
              name="shortName"
              label="Short/Menu Name"
              type="text"
              :autocomplete="(autofill) ? '' : 'nope'">
            </v-text-field>
          </ValidationProvider>
        </v-col>
        <v-col cols="12" md="6">
          <v-switch
            :id="`${clone.id || clone.__id}-${prependField}active`"
            v-model="clone[prependField + 'active']"
            :disabled="parentDisabled || selfDisabled"
            name="Active"
            label="Enabled"
            color="msu">
          </v-switch>
        </v-col>
        <v-col cols="12">
          <ValidationProvider
            ref="name"
            name="Name"
            rules="required"
            v-slot="{ errors }">
            <v-text-field
              :id="`${clone.id || clone.__id}-${prependField}name`"
              v-model="clone[prependField + 'name']"
              :disabled="parentDisabled"
              :error-messages="errors"
              name="name"
              label="Group name"
              type="text"
              :autocomplete="(autofill) ? '' : 'nope'">
            </v-text-field>
          </ValidationProvider>
        </v-col>
      </v-row>
    </ValidationObserver>
  </span>
</template>

<script>
import feathersVuexFormHelpers from '@/mixins/feathersVuexFormHelpers';

export default {
  mixins: [
    feathersVuexFormHelpers,
  ],
  props: {
    autofill: {
      type: Boolean,
      default: true,
    },
    clone: Object,
    parentDisabled: {
      type: Boolean,
      default: false,
    },
    selfDisabled: {
      type: Boolean,
      default: false,
    },
    nested: {
      type: Boolean,
      default: false,
    },
    prependField: {
      type: String,
      default: '',
    },
    isDirty: Boolean,
    save: Function,
    reset: Function,
    remove: Function,
    showControls: {
      type: Boolean,
      default: true,
    },
    standalone: {
      type: Boolean,
      default: false,
    },
    allowDelete: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      isInvalid: this.invalid,
    };
  },
  asyncComputed: {
    invalid() {
      let ret = true;
      if (this.$refs.editorObserver) {
        ret = this.$refs.editorObserver.flags.invalid;
      }
      return ret;
    },
  },
  methods: {
    requestAnimationFrame() {
      this.$refs.editorObserver.reset();
    },
  },
};
</script>
