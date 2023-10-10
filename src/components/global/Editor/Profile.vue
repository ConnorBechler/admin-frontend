<template>
  <span>
    <ValidationObserver ref="profileObserver" v-slot="{ invalid }">
      <v-row v-if="showParticipantInfo">
        <v-col cols="12" md="6">
          <ValidationProvider
            ref="fname"
            name="First Name"
            rules="required"
            v-slot="{ errors }"
          >
            <v-text-field
              :id="`${clone.id || clone.__id}-${prependField}fname`"
              v-model="clone[prependField + 'fname']"
              :disabled="parentDisabled"
              :error-messages="errors"
              name="fname"
              label="First Name"
              type="text"
              :autocomplete="(autofill) ? '' : 'nope'">
            </v-text-field>
          </ValidationProvider>
        </v-col>
        <v-col cols="12" md="6">
          <ValidationProvider
            ref="lname"
            name="Last Name"
            rules="required"
            v-slot="{ errors }"
          >
            <v-text-field
              :id="`${clone.id || clone.__id}-${prependField}lname`"
              v-model="clone[prependField + 'lname']"
              :disabled="parentDisabled"
              :error-messages="errors"
              name="lname"
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
            v-slot="{ errors }"
          >
            <v-text-field
              :id="`${clone.id || clone.__id}-${prependField}email`"
              v-model="clone[prependField + 'email']"
              :disabled="parentDisabled || selfDisabled"
              :error-messages="errors"
              name="email"
              label="Email"
              type="text"
              :autocomplete="(autofill) ? '' : 'nope'">
            </v-text-field>
          </ValidationProvider>
        </v-col>
      </v-row>
      <v-row v-if="isAdmin">
        <!---
        <v-col cols="12" md="3">
          <ValidationProvider
            ref="sid"
            name="Subject ID"
            :rules="(clone.subjectId === originalSubjectId || !validateSubjectId) ? 'required' : 'unique|required'"
            v-slot="{ errors }">
            <v-text-field
              :id="`${clone.id || clone.__id}-${prependField}subjectId`"
              v-model="clone[prependField + 'subjectId']"
              :disabled="parentDisabled || selfDisabled"
              :error-messages="errors"
              :loading="validating"
              @keydown.space.prevent
              name="subjectId"
              label="Subject ID"
              type="text"
              autocomplete="nope">
              <template v-if="showValidIcon && clone.subjectId !== originalSubjectId" v-slot:append>
                <v-icon v-if="validSID || !validateSubjectId" small color="msu" class="pt-1">
                  fa-check-circle
                </v-icon>
                <v-icon v-else small color="red" class="pt-1">
                  fa-ban
                </v-icon>
              </template>
            </v-text-field>
          </ValidationProvider>
        </v-col>
        --->
        <v-col cols="12" md="10">
          <!---
          <ValidationProvider
            ref="sid"
            name="Subject ID"
            v-slot="{ errors }">
            <v-text-field
              :id="`${clone.id || clone.__id}-${prependField}subjectId`"
              v-model="clone[prependField + 'subjectId']"
              :disabled="parentDisabled || selfDisabled"
              :error-messages="errors"
              name="subjectId"
              label="Subject ID"
              type="text"
              :autocomplete="(autofill) ? '' : 'nope'">
            </v-text-field>
          --->
          <v-autocomplete
            :id="`${clone.id || clone.__id}-${prependField}subjectId`"
            v-model="clone[prependField + 'subjectId']"
            :disabled="isFindSubjectsPending || !subjects.length"
            name="subjects"
            ref="subjects"
            label="Select from Subjects"
            :items="subjects"
            item-value="id"
            item-text="shortcode"
            dense
            outlined
            :filter="filterAllSubjects"
            clearable
            @clear:click="clone[prependField + 'subjectId'] = null"
            :menu-props="{ auto: true }"
            :loading="isFindSubjectsPending"
            autocomplete="nope">
            <template v-slot:item = "{ item }">
              {{ `${item.shortcode} (${item.first}: ${item.email})` }}
            </template>
            <template v-slot:selection = "{ item }">
              {{ `${item.shortcode} (${item.first}: ${item.email})` }}
            </template>
          </v-autocomplete>
          <!---
          </ValidationProvider>
          ---->
          Don't see the SID you're looking for in the list above?
          <a @click.stop="addObj"
          class="text-body-2 black--text font-weight-bold text-decoration-underline">
            Maybe add one
          </a>
          <ValidationObserver ref="linkedSubjectObserver" v-slot="{ invalid: subjectInvalid }">
            <v-dialog
              v-model="showEditor"
              width="50%"
              :fullscreen="$vuetify.breakpoint.xs"
              persistent
              scrollable
              :transition="($vuetify.breakpoint.xs) ? 'dialog-bottom-transition' : 'fade-transition'">
              <FeathersVuexFormWrapper :item="editedObj" ref="subjectForm" watch>
                <template v-slot="{ clone, save, reset, isDirty: subjectDirty }">
                  <v-card>
                    <v-card-title class="msu dark-grey text-center white--text">
                      <span class="text-h5">{{ editorTitle }}</span>
                      <v-spacer></v-spacer>
                      <v-icon class="white--text">fa-user</v-icon>
                    </v-card-title>
                    <v-card-text>
                      <v-container>
                        <EditorSubject
                          :key="editedObj.id || editedObj.__id"
                          :originalSubjectId="editedObj.shortcode ? editedObj.shortcode : ''"
                          :clone="clone"
                          :isDirty="isDirty"
                          :isAdmin="true">
                        </EditorSubject>
                      </v-container>
                    </v-card-text>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn @click="reset(); clearObjDialog();">Close</v-btn>
                      <v-btn color="msu accent-green white--text" :disabled="subjectInvalid || !subjectDirty" @click="save().then(clearObjDialog);">Save</v-btn>
                    </v-card-actions>
                  </v-card>
                </template>
              </FeathersVuexFormWrapper>
            </v-dialog>
          </ValidationObserver>
        </v-col>
      </v-row>
    </ValidationObserver>
  </span>
</template>

<script>
import { extend } from 'vee-validate';
import { makeFindMixin } from 'feathers-vuex';
import feathersClient from '@/plugins/feathers-client';
import feathersVuexFormHelpers from '@/mixins/feathersVuexFormHelpers';

export default {
  mixins: [
    feathersVuexFormHelpers,
    makeFindMixin({ service: 'paymentGroups', watch: true }),
    makeFindMixin({ service: 'subjects', watch: true }),
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
    isAdmin: {
      type: Boolean,
      default: false,
    },
    standalone: {
      type: Boolean,
      default: false,
    },
    allowDelete: {
      type: Boolean,
      default: true,
    },
    originalSubjectId: {
      type: String,
      default: '',
    },
    validateSubjectId: {
      type: Boolean,
      default: true,
    },
    showParticipantInfo: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      validating: false,
      validSID: null,
      showValidIcon: false,
      showEditor: false,
      editedObj: new this.$FeathersVuex.api.Subject(),
      editorTitle: '',
    };
  },
  computed: {
    paymentGroupsParams() {
      return { query: { active: 1, hidden: 0, $sort: { name: 1 } } };
    },
    subjectsParams() {
      return {
        query: {
          shortcode: {
            $ne: null,
          },
          active: 1,
          hidden: 0,
          $sort: { shortcode: 1 },
          $limit: 99999,
        },
      };
    },
  },
  asyncComputed: {
    invalid() {
      let ret = true;
      if (this.$refs.profileObserver) {
        ret = this.$refs.profileObserver.flags.invalid;
      }
      return ret;
    },
  },
  methods: {
    addObj() {
      this.editorTitle = 'Add a Subject';
      this.editedObj = new this.$FeathersVuex.api.Subject();
      this.showEditor = true;
    },
    clearObjDialog() {
      this.showEditor = false;
      this.editorTitle = 'Add a Subject';
      this.editedObj = new this.$FeathersVuex.api.Subject();
      this.$refs.linkedSubjectObserver.reset();
    },
    requestAnimationFrame() {
      this.$refs.profileObserver.reset();
      this.$refs.linkedSubjectObserver.reset();
    },
    filterAllSubjects(item, queryText) {
      return (
        item.shortcode.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1
        || item.email.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1
        || item.first.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1
      );
    },
    filterAllPaymentGroups(item, queryText) {
      return (
        item.shortName.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1
        || item.name.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1
      );
    },
    isUnique(subjectId) {
      this.validating = true;
      return feathersClient.service('adminMaintenance').create({
        action: 'profile:checkUniqueSID',
        params: {
          subjectId,
        },
      })
        .then((data) => {
          this.validating = false;
          this.showValidIcon = true;
          this.validSID = data.valid;
          return data;
        })
        .catch(() => {
          this.validating = false;
          this.showValidIcon = false;
        });
    },
  },
  mounted() {
    if (this.isAdmin) {
      extend('unique', {
        validate: this.isUnique,
        message: 'SID already in use!',
      });
    }
  },
};
</script>
