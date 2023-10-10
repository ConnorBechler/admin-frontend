<template>
  <span>
    <v-row>
      <v-col cols="12" class="d-flex justify-end">
          <v-switch
            v-model="clone.active"
            label="Visible?"
            :hide-details="true"
            color="msu"
            class="input-flip-flop flex-align-end">
          </v-switch>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6" md="4">
        <EditorDate
          :key="clone.id || clone.__id"
          :clone="clone"
          :maxDate="null"
          :required="true"
          field="startDate"
          label="Start Date"
          startAt="DATE"
          :parentDisabled="parentDisabled || selfDisabled"
          :isDirty="isDirty">
        </EditorDate>
      </v-col>
      <v-col cols="6" md="4">
        <EditorDate
          :key="clone.id || clone.__id"
          :clone="clone"
          :maxDate="null"
          :required="true"
          field="endDate"
          label="End Date"
          startAt="DATE"
          :parentDisabled="parentDisabled || selfDisabled"
          :isDirty="isDirty">
        </EditorDate>
      </v-col>
      <v-col cols="6" md="3">
        <ValidationProvider
          ref="goal"
          name="Goal"
          rules="required"
          v-slot="{ errors }">
          <v-text-field
            v-model="clone.goal"
            :id="(nested) ? `${index}-goal` : `${clone.id || clone.__id}-goal`"
            :name="(nested) ? `${index}-goal` : `${clone.id || clone.__id}-goal`"
            :readonly="parentDisabled || selfDisabled"
            :error-messages="errors"
            label="Goal"
            type="number"
            hint="minutes"
            :persistent-hint="true"
            autocomplete="nope">
          </v-text-field>
        </ValidationProvider>
      </v-col>
    </v-row>
  </span>
</template>

<script>

export default {
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
    };
  },
  methods: {
  },
};
</script>
