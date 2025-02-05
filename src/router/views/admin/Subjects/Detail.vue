<template>
  <v-container fluid v-if="isAuthenticated && currentSubject">
    <v-row justify="center" >
      <v-col cols="12" sm="10">
        <!--- TODO: linked profiles, linked diaries --->
        <v-card>
          <v-card-title primary-title class="msu dark-grey text-center white--text">
            <h3>Subject Details</h3>
            <v-spacer></v-spacer>
            <ValidationObserver ref="editorObserver" v-slot="{ invalid, validate }"
                      :key="`${currentSubject.id || currentSubject.__id}-validation-${resetKey}`">
              <v-dialog
                v-model="showEditor"
                width="50%"
                :fullscreen="$vuetify.breakpoint.xs"
                persistent
                scrollable
                :transition="($vuetify.breakpoint.xs) ? 'dialog-bottom-transition' : 'fade-transition'">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    class="white black--text"
                    :small="$vuetify.breakpoint.smAndDown"
                    v-bind="attrs"
                    v-on="on">
                    <v-icon small class="mr-2">fa-pencil-alt</v-icon>Edit Details
                  </v-btn>
                </template>
                <FeathersVuexFormWrapper :item="currentSubject" ref="subjectForm" watch>
                  <template v-slot="{ clone, save, reset, isDirty }">
                    <EditorSubject
                      :key="`${currentSubject.id || currentSubject.__id}-${resetKey}`"
                      :originalSubjectId="currentSubject.shortcode ? currentSubject.shortcode : ''"
                      :clone="clone"
                      :isDirty="isDirty"
                      :isAdmin="hasRole('admin, ra, ga')">
                      <template #title>
                        <span class="text-h5">Edit Subject</span>
                        <v-spacer></v-spacer>
                        <v-icon class="white--text">fa-user</v-icon>
                      </template>
                      <template #actions-right>
                        <span :key="`${clone.id || clone.__id}-actions-${resetKey}`">
                          <v-btn class="mr-2" @click="reset(); clearObjDialog();">Close</v-btn>
                          <v-btn color="msu accent-green white--text" :disabled="!isDirty" @click="validate().then(valid => valid ? save().then(clearObjDialog) : null);">Save</v-btn>
                        </span>
                      </template>
                    </EditorSubject>
                  </template>
                </FeathersVuexFormWrapper>
              </v-dialog>
            </ValidationObserver>
          </v-card-title>
          <v-card-text class="text-subtitle-1">
            <v-row class="mt-1">
              <v-col cols="12" sm="6">
                SID: <span v-if="currentSubject.shortcode" class="font-weight-bold">{{ currentSubject.shortcode }}</span>
                <v-btn v-else small class="msu light-grey" @click="showEditor = true;">Edit to Add SID</v-btn>
                <br>
                Category: <span class="font-weight-bold">
                  {{ (currentSubject.metadata.participant_category)
                    ? typeof currentSubject.metadata.participant_category === 'object'
                      ? currentSubject.metadata.participant_category.join(', ')
                      : currentSubject.metadata.participant_category
                    : '' }}
                </span><br>
                Signed Up: {{ currentSubject.createdAt | moment('MMM D YYYY @ h:mm A')}}<br>
                <v-select
                  :id="`${currentSubject.id}-processingStatus`"
                  :value="currentSubject.metadata.processingStatus"
                  name="subjectProcessingStatus"
                  label="Confirmation Status?"
                  hint="New/Rejected/Dupe"
                  placeholder="No Status yet"
                  clearable
                  @clear:click="updatedProcessingStatus()"
                  :items="processingStatuses"
                  @change="updatedProcessingStatus"
                  :persistent-hint="true">
                </v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-row>
                  <v-col cols="12" class="d-flex justify-end">
                      <v-switch
                        label="Hidden?"
                        :input-value="currentSubject.hidden"
                        @change="toggle('hidden')"
                        :hide-details="true"
                        color="msu"
                        class="input-flip-flop flex-align-end"
                      />
                  </v-col>
                  <v-col cols="12" class="d-flex justify-end">
                      <v-switch
                        label="Not For Research?"
                        :input-value="currentSubject.metadata.notForResearch"
                        @change="toggle('notForResearch', 'metadata')"
                        :hide-details="true"
                        color="msu"
                        class="input-flip-flop flex-align-end"
                      />
                  </v-col>
                  <v-col cols="12" sm="6">
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row justify="center" >
      <v-col cols="12" sm="10">
        <v-card>
          <v-card-title primary-title class="msu dark-grey text-center white--text">
            <h4>Signup Data</h4>
            <v-spacer></v-spacer>
          </v-card-title>
          <v-card-text class="text-body-1">
            <v-row class="mt-1">
              <v-col cols="12" sm="6">
                <v-list dense>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon small right>fa-user</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title class="text-body-1">{{ currentSubject.first }} {{ currentSubject.last }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon small right>fa-at</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title class="text-body-1">{{ currentSubject.email }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item three-line>
                    <v-list-item-icon>
                      <v-icon small right>fa-info-circle</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-body-1">DoB: <span class="black--text">{{ currentSubject.metadata.dateOfBirth }} <span v-if="age">({{ age }} years)</span></span></v-list-item-subtitle>
                      <v-list-item-subtitle class="text-body-1">Gender: <span class="black--text">{{ currentSubject.metadata.gender }}</span></v-list-item-subtitle>
                      <v-list-item-subtitle class="text-body-1">Ethnicity: <span class="black--text">{{ currentSubject.metadata.ethnicity }}</span></v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <!---
                  <v-list-item two-line>
                    <v-list-item-icon>
                      <v-icon small right>fa-map-marker</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-body-1">Grew Up: <span class="black--text">{{ currentSubject.metadata.locationGrowingUp }}</span></v-list-item-subtitle>
                      <v-list-item-subtitle class="text-body-1">Current: <span class="black--text">{{ currentSubject.metadata.locationCurrent }}</span></v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  --->
                  <!---
                  <v-list-item three-line>
                    <v-list-item-icon>
                      <v-icon small right>fa-graduation-cap</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-body-1">Education: <span class="black--text">{{ currentSubject.metadata.educationLevel ? currentSubject.metadata.educationLevel.join(', ') : null }}</span></v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  --->
                </v-list>
              </v-col>
              <v-col cols="12" sm="6">
                <v-list dense>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon small right>fa-comments</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-body-1">Heard: <span class="black--text">{{ currentSubject.metadata.source }}</span></v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon small right>fa-check-circle</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-body-1">Consent: <span class="font-weight-bold" :class="currentSubject.metadata.consent ? 'msu--text' : 'red--text'">{{ (currentSubject.metadata.consent) ? 'Yes' : 'No' }}</span></v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <!---
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon small right>fa-clock</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-body-1">Prompts: <span class="black--text">{{ currentSubject.metadata.frequency }}</span></v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  --->
                  <!---
                  <v-list-item two-line>
                    <v-list-item-icon>
                      <v-icon small right>fa-exclamation-triangle</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-body-1">Share Permission: <span class="font-weight-bold" :class="currentSubject.metadata.permission_share ? 'msu--text' : 'red--text'">{{ (currentSubject.metadata.permission_share) ? 'Yes' : 'No' }}</span></v-list-item-subtitle>
                      <v-list-item-subtitle class="text-body-1">Archive Permission: <span class="font-weight-bold" :class="currentSubject.permission_share_research ? 'msu--text' : 'red--text'">{{ (currentSubject.permission_share_research) ? 'Yes' : 'No' }}</span></v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  --->
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon small right>fa-dollar-sign</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title class="text-body-1">
                        <span class="font-weight-bold" :class="currentSubject.metadata.payment_optout ? 'red--text' : 'msu--text'">
                          {{ (currentSubject.metadata.payment_optout) ? 'No' : 'Yes' }}
                        </span>
                        <span v-if="!currentSubject.metadata.payment_optout">
                          - {{ paymentGroup ? paymentGroup.shortName : 'Self' }}
                        </span>
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" class="text-body-1 px-10">
                  Open-response to 'Other info': <span class="black--text">{{ currentSubject.metadata.otherInfo }}</span>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
/* eslint-disable */
import { AgeFromDateString } from 'age-calculator';
import { mapGetters, mapActions } from 'vuex';
import { authComputed } from '@/store/helpers';
import feathersClient from '@/plugins/feathers-client';
import feathersVuexFormHelpers from '@/mixins/feathersVuexFormHelpers';
import formatters from '@/mixins/formatters';


export default {
  name: 'subject-detail',
  mixins: [
    feathersVuexFormHelpers,
    formatters,
  ],
  page() {
    return {
      title: `Subject Details | ${this.$appStrings('appName')}`,
      meta: [
        {
          name: 'description',
          content: 'Subject Detail page',
        },
      ],
    };
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      currentSubject: '',
      detailsAreLoading: true,
      resetKey: Date.now(),
      showEditor: false,
      processingStatuses: [
        {
          text: 'Confirmed',
          value: 'confirmed',
        },
        {
          text: 'Ignore/Discard',
          value: 'ignore',
        },
        {
          text: 'Duplicate',
          value: 'duplicate',
        },
      ],
    };
  },
  computed: {
    ...authComputed,
    age() {
      if (this.currentSubject.metadata.dateOfBirth) {
        return new AgeFromDateString(this.currentSubject.metadata.dateOfBirth).age;
      } else {
        return false;
      }
    },
  },
  asyncComputed: {
    paymentGroup: {
      get() {
        if (this.currentSubject.metadata && this.currentSubject.metadata.paymentGroup) {
          return this.$FeathersVuex.api.PaymentGroup.get(this.currentSubject.metadata.paymentGroup);
        }
      },
      default: null,
    },
  },
  methods: {
    fetchSubjectData() {
      const subject = this.currentSubject;
      if (subject.id) {
      };
    },
    editObj(obj) {
      this.showEditor = true;
    },
    clearObjDialog() {
      this.showEditor = false;
      this.$refs.editorObserver.reset();
      this.resetKey = Date.now();
    },
    requestAnimationFrame() {
      this.$refs.editorObserver.reset();
    },
    toggle(prop, sub) {
      const clone = this.currentSubject.clone();
      if (sub) {
        clone[sub][prop] = !clone[sub][prop];
      } else {
        clone[prop] = !clone[prop];
      }
      clone.commit();
      clone.save();
    },
    updatedProcessingStatus(status) {
      const clone = this.currentSubject.clone();
      clone.metadata.processingStatus = status || null;
      clone.commit();
      clone.save();
    },
  },
  watch: {
    id: {
      async handler(val) {
        if (!val) {
          this.$router.push({ name: 'adminSubjectsList' });
        }
        const { Subject } = this.$FeathersVuex.api;
        const subjectAlreadyLoaded = Subject.getFromStore(val);

        if (subjectAlreadyLoaded) {
          this.currentSubject = subjectAlreadyLoaded;
          this.fetchSubjectData();
        } else {
          await Subject.get(val)
            .then((resp) => {
              this.currentSubject = resp;
              this.fetchSubjectData();
            })
            .catch((err) => {
              let errMsg = '';
              // error: check FeathersError
              // if record not found, display error and route back
              if (err.name) {
                errMsg = (err.name === 'NotFound')
                  ? 'No Subject found for this ID!'
                  : 'There was a problem loading that Subject!';
              }
              this.$store.dispatch('alert/display',
                {
                  type: 'error',
                  message: errMsg,
                  timeout: 2500,
                  icon: 'fa-exclamation',
                },
                { root: true });
              this.$router.push({ name: 'adminSubjectsList' });
            });
        }
      },
      immediate: true,
    },
  },
  created() {
    // TODO: add checks for deleted, not this user, etc
    if (!this.id) {
      this.$router.push({ name: 'adminSubjectsList' });
    }
  },
};
</script>
