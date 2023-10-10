<template>
  <span>
    <ValidationObserver ref="editorObserver" v-slot="{ invalid }">
      <v-row>
        <v-col cols="12" md="6">
          <ValidationProvider
            ref="word"
            name="Word"
            rules="required"
            v-slot="{ errors }">
            <v-text-field
              :id="`${clone.id || clone.__id}-${prependField}word`"
              v-model="clone[prependField + 'word']"
              :disabled="parentDisabled"
              :error-messages="errors"
              name="word"
              label="Word"
              type="text"
              @keydown.space.prevent
              v-uppercase
              autocomplete="nah">
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
            ref="phonemes"
            name="Phonemes"
            :rules="clone.word ? 'required|unique|validPhoneme' : 'required|validPhoneme'"
            v-slot="{ errors }">
            <v-text-field
              :id="`${clone.id || clone.__id}-${prependField}phonemes`"
              v-model="clone[prependField + 'phonemes']"
              :disabled="parentDisabled"
              :error-messages="errors"
              name="phonemes"
              label="Phonemes"
              type="text"
              v-uppercase
              autocomplete="nah">
            </v-text-field>
          </ValidationProvider>
        </v-col>
      </v-row>
    </ValidationObserver>
  </span>
</template>

<script>
import { extend } from 'vee-validate';
import feathersVuexFormHelpers from '@/mixins/feathersVuexFormHelpers';
import feathersClient from '@/plugins/feathers-client';

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
      validating: false,
      valid: null,
      showValidIcon: false,
      validPhonemes: [
        'B', 'CH', 'D', 'DH', 'F', 'G', 'HH', 'JH', 'K', 'L', 'M', 'N', 'NG', 'O', 'P', 'Q', 'R', 'S', 'SH', 'T', 'TH', 'V', 'W', 'Y', 'Z', 'ZH',
        'AA0', 'AE0', 'AH0', 'AO0', 'AW0', 'AY0', 'EH0', 'ER0', 'EY0', 'IH0', 'IY0', 'OW0', 'OY0', 'UH0', 'UW0', 'AA1', 'AE1', 'AH1', 'AO1', 'AW1', 'AY1', 'EH1', 'ER1', 'EY1', 'IH1', 'IY1', 'OW1', 'OY1', 'UH1', 'UW1', 'AA2', 'AE2', 'AH2', 'AO2', 'AW2', 'AY2', 'EH2', 'ER2', 'EY2', 'IH2', 'IY2', 'OW2', 'OY2', 'UH2', 'UW2',
      ],
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
    isUnique() {
      this.validating = true;
      if (this.clone.word !== '') {
        return feathersClient.service('dictionaryWords').find({ query: { word: this.clone.word, phonemes: this.clone.phonemes } })
          .then((resp) => {
            this.validating = false;
            // this.showValidIcon = subjectId !== this.originalSubjectId;
            this.valid = resp.data.filter(w => w.id !== this.clone.id).length === 0;
            return this.valid;
          })
          .catch(() => {
            this.validating = false;
            this.showValidIcon = false;
          });
      }
    },
  },
  mounted() {
    extend('unique', {
      validate: this.isUnique,
      message: 'This dictionary entry already exists!',
    });
    extend('validPhoneme', (val) => {
      const badPhonemes = [];
      val.split(' ').forEach((phoneme) => {
        if (phoneme !== '') {
          if (!this.validPhonemes.includes(phoneme)) {
            badPhonemes.push(phoneme);
          }
        }
      });
      return badPhonemes.length === 0 ? true : `${badPhonemes.join(', ')} ${badPhonemes.length === 1 ? 'is not a proper entry' : 'are not proper entries'}`;
    });
  },
};
</script>
