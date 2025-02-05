<template>
  <span>
    <ValidationObserver ref="userObserver" v-slot="{ invalid }">
      <v-row>
        <v-col cols="12" md="6">
          <!--- TODO: add validationobserver to avoid the empty-user hole --->
          <ValidationProvider
            ref="first"
            name="First Name"
            rules="required"
            v-slot="{ errors }">
            <v-text-field
              :id="`${clone.id || clone.__id}-${prependField}first`"
              v-model="clone[prependField + 'first']"
              :disabled="parentDisabled"
              :error-messages="errors"
              name="userFirst"
              label="First Name"
              type="text"
              :autocomplete="(autofill) ? '' : 'nope'">
            </v-text-field>
          </ValidationProvider>
        </v-col>
        <v-col cols="12" md="6">
          <ValidationProvider
            ref="last"
            name="Last Name"
            rules="required"
            v-slot="{ errors }">
            <v-text-field
              :id="`${clone.id || clone.__id}-${prependField}last`"
              v-model="clone[prependField + 'last']"
              :disabled="parentDisabled"
              :error-messages="errors"
              name="userLast"
              label="Last Name"
              type="text"
              :autocomplete="(autofill) ? '' : 'nope'">
            </v-text-field>
          </ValidationProvider>
        </v-col>
        <v-col cols="12" md="6">
          <ValidationProvider
            ref="email"
            name="Email"
            rules="required|email"
            v-slot="{ errors }">
            <v-text-field
              :id="`${clone.id || clone.__id}-${prependField}email`"
              v-model="clone[prependField + 'email']"
              :disabled="parentDisabled || selfDisabled"
              :error-messages="errors"
              name="userEmail"
              label="Email"
              type="text"
              :autocomplete="(autofill) ? '' : 'nope'">
            </v-text-field>
          </ValidationProvider>
        </v-col>
        <v-col cols="12" md="6">
          <form autocomplete="off" @submit.prevent>
            <v-autocomplete
              :id="`${clone.id || clone.__id}-${prependField}roles`"
              v-model="clone[prependField + 'roles']"
              :disabled="parentDisabled || selfDisabled"
              :items="availableUserRoles"
              name="userRoles"
              :multiple="true"
              item-value="value"
              item-text="name"
              label="Role"
              :autocomplete="(autofill) ? '' : 'nope'">
            </v-autocomplete>
          </form>
        </v-col>
        <v-col cols="12" md="6">
          <v-switch
            :id="`${clone.id || clone.__id}-${prependField}active`"
            v-model="clone[prependField + 'active']"
            :disabled="parentDisabled || selfDisabled"
            name="userActive"
            label="Enabled"
            color="msu">
          </v-switch>
        </v-col>
        <v-col cols="12" md="6">
          <v-switch
            :id="`${clone.id || clone.__id}-${prependField}hidden`"
            v-model="clone[prependField + 'hidden']"
            :disabled="parentDisabled || selfDisabled"
            name="userHidden"
            label="Hidden"
            color="msu">
          </v-switch>
        </v-col>
      </v-row>
      <span v-if="showControls">
        <v-row v-if="!standalone">
          <v-col cols="6" md="3" class="controls">
            <v-btn class="controls-row" :disabled="invalid" @click="saveRow(clone)">
              Save
            </v-btn>
            <v-btn type="button" class="remove-row" @click="removeRow(clone)" v-if="!clone.deletedAt">
              Remove
            </v-btn>
            <span v-if="clone.deletedAt">
              <v-btn type="button" class="remove-row" @click="restoreRow(clone)">
                Restore
              </v-btn> |
              <v-btn type="button" class="remove-row" @click="deleteRow(clone)">
                Delete
              </v-btn>
            </span>
          </v-col>
        </v-row>
        <v-row v-else>
          <v-col cols="12" class="controls">
            <v-btn class="controls-row" :disabled="invalid" @click="saveRow(clone)">
              Save
            </v-btn>
            <v-btn class="controls-row" @click="removeRow(clone)" v-if="!clone.deletedAt && allowDelete">
              Remove
            </v-btn>
            <span v-if="clone.deletedAt && allowDelete">
              <v-btn type="button" class="remove-row" @click="restoreRow(clone)">
                Restore
              </v-btn> |
              <v-btn type="button" class="remove-row" @click="deleteRow(clone)">
                Delete
              </v-btn>
            </span>
          </v-col>
        </v-row>
      </span>
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
      availableUserRoles: [
        {
          name: 'Admin',
          value: 'admin',
        },
        {
          name: 'Research Manager',
          value: 'researchManager',
        },
        {
          name: 'Transcript Manager',
          value: 'transcriptManager',
        },
        {
          name: 'RA/GA',
          value: 'ra',
        },
        {
          name: 'Basic User',
          value: 'user',
        },
      ],
    };
  },
  asyncComputed: {
    invalid() {
      let ret = true;
      if (this.$refs.userObserver) {
        ret = this.$refs.userObserver.flags.invalid;
      }
      return ret;
    },
  },
  methods: {
    requestAnimationFrame() {
      this.$refs.userObserver.reset();
    },
  },
};
</script>
