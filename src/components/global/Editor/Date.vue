<template>
    <v-menu
      ref="menu"
      v-model="menu"
      :close-on-content-click="false"
      :return-value.sync="clone[field]"
      :disabled="parentDisabled"
      transition="scale-transition"
      offset-y
      min-width="290px"
    >
      <template v-slot:activator="{ on }">
        <ValidationProvider
          :ref="field"
          :name="label"
          :rules="required ? 'required|date_format:YYYY-MM-DD' : 'date_format:YYYY-MM-DD'"
          v-slot="{ errors }">
          <v-text-field
            v-model="clone[field]"
            :label="label"
            :disabled="parentDisabled"
            :error-messages="errors"
            clearable
            :prepend-icon="(prependIcon) ? prependIcon : ''"
            @click:clear="clearCalled"
            v-on="on"
            hint="YYYY-MM-DD"
            :persistent-hint="true"
            @change="updateDate(clone[field])"
          ></v-text-field>
        </ValidationProvider>
      </template>
      <v-date-picker
        ref="picker"
        v-model="clone[field]"
        :disabled="parentDisabled"
        :max="maxDate"
        :min="minDate"
        color="msu"
        @change="updateDate(clone[field])"
      >
        <v-spacer></v-spacer>
        <v-btn text color="primary" @click="menu = false">Cancel</v-btn>
      </v-date-picker>
    </v-menu>
</template>

<script>
import feathersVuexFormHelpers from '@/mixins/feathersVuexFormHelpers';

export default {
  mixins: [
    feathersVuexFormHelpers,
  ],
  props: {
    clone: Object,
    field: String,
    readonly: {
      type: Boolean,
      default: false,
    },
    parentDisabled: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    maxDate: {
      type: String,
      default: new Date().toISOString().substr(0, 10),
    },
    minDate: {
      type: String,
      default: '1910-01-01',
    },
    label: {
      type: String,
      default: 'Date of Birth',
    },
    prependIcon: {
      type: String,
      default: '',
    },
    startAt: {
      type: String,
      default: 'YEAR',
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
      menu: false,
    };
  },
  watch: {
    menu(val) {
      val && setTimeout(() => {
        if (!this.clone[this.field]) {
          this.$refs.picker.activePicker = this.startAt;
          if (this.maxDate) {
            this.$refs.picker.inputYear = this.maxDate.substr(0, 4);
            this.$refs.picker.tableDate = this.maxDate.substr(0, 7);
          }
        }
      });
    },
  },
  methods: {
    updateDate(date) {
      this.$refs.menu.save(date);
      this.stageClone(this.clone);
    },
    clearCalled() {
      this.stageClone(this.clone);
    },
  },
};
</script>
