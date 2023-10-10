<template>
  <v-card>
    <v-card-title class="msu dark-grey text-center white--text">
      <slot name="title"></slot>
    </v-card-title>
    <v-card-text class="px-0">
      <v-container class="px-0 pt-0">
        <v-tabs v-model="selectedTab" show-arrows fixed-tabs>
          <v-tab
            :ripple="false"
            active-class="msu dark-grey white--text font-weight-bold">
            Info
          </v-tab>
          <v-tab
            :ripple="false"
            active-class="msu dark-grey white--text font-weight-bold">
            Bio/Demo
          </v-tab>
          <v-tab
            :ripple="false"
            active-class="msu dark-grey white--text font-weight-bold">
            Coding
          </v-tab>
          <v-tab
            :ripple="false"
            active-class="msu dark-grey white--text font-weight-bold">
            Comments
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="selectedTab" touchless>
          <v-tab-item
            class="px-5">
            <v-row>
              <v-col cols="12" md="6" class="d-flex justify-start py-1">
                <v-switch
                  :id="`${clone.id || clone.__id}-metadata.${prependField}addedMailchimp`"
                  v-model="clone.metadata[prependField + 'addedMailchimp']"
                  :disabled="parentDisabled || selfDisabled"
                  class="lex-align-start"
                  :hide-details="true"
                  name="addedMailchimp"
                  label="Added to mailchimp"
                  color="msu">
                </v-switch>
              </v-col>
              <v-col cols="12" md="6" class="d-flex justify-end py-1">
                <v-switch
                  :id="`${clone.id || clone.__id}-${prependField}hidden`"
                  v-model="clone[prependField + 'hidden']"
                  :disabled="parentDisabled || selfDisabled"
                  class="input-flip-flop flex-align-end"
                  :hide-details="true"
                  name="hidden"
                  label="Hide Subject?"
                  color="msu">
                </v-switch>
              </v-col>
              <v-col cols="12" md="6">
                <ValidationProvider
                  ref="sid"
                  name="Subject ID"
                  :rules="(clone.shortcode === originalSubjectId || !validateSubjectId) ? '' : 'unique'"
                  v-slot="{ errors }"
                >
                  <v-text-field
                    :id="`${clone.id || clone.__id}-${prependField}shortcode`"
                    v-model="clone[prependField + 'shortcode']"
                    :disabled="parentDisabled"
                    :error-messages="errors"
                    :loading="validating"
                    @keydown.space.prevent
                    placeholder="Manually enter SID or assign one below"
                    hint=" "
                    :persistent-hint="!clone.shortcode"
                    name="shortcode"
                    label="Subject ID"
                    type="text"
                    :autocomplete="(autofill) ? '' : 'nope'">
                    <template v-if="showValidIcon && (clone.shortcode !== originalSubjectId)" v-slot:append>
                      <v-icon v-if="validSID || !validateSubjectId" small color="msu" class="pt-1">
                        fa-check-circle
                      </v-icon>
                      <v-icon v-else small color="red" class="pt-1">
                        fa-ban
                      </v-icon>
                    </template>
                    <template v-slot:message v-if="!clone.shortcode">
                      <a @click.stop="assignNextSID"
                      class="text-body-2 black--text font-weight-bold text-decoration-underline">
                        Click to save and assign next SID
                      </a>
                    </template>
                  </v-text-field>
                </ValidationProvider>
              </v-col>
              <v-col cols="12" md="6">
                <v-autocomplete
                  :id="`${clone.id || clone.__id}-${prependField}processingStatus`"
                  v-model="clone.metadata[prependField + 'processingStatus']"
                  name="subjectProcessingStatus"
                  label="Confirmation Status?"
                  hint="New/Rejected/Dupe"
                  placeholder="No Status yet"
                  clearable
                  :items="processingStatuses"
                  :persistent-hint="true">
                </v-autocomplete>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="py-2" cols="12" md="6">
                <ValidationProvider
                  ref="first"
                  name="First Name"
                  rules="required"
                  v-slot="{ errors }"
                >
                  <v-text-field
                    :id="`${clone.id || clone.__id}-${prependField}first`"
                    v-model="clone[prependField + 'first']"
                    :disabled="parentDisabled"
                    :error-messages="errors"
                    :hide-details="!errors.length"
                    name="first"
                    label="First Name"
                    type="text"
                    :autocomplete="(autofill) ? '' : 'nope'">
                  </v-text-field>
                </ValidationProvider>
              </v-col>
              <v-col class="py-2" cols="12" md="6">
                <ValidationProvider
                  ref="last"
                  name="Last Name"
                  rules="required"
                  v-slot="{ errors }"
                >
                  <v-text-field
                    :id="`${clone.id || clone.__id}-${prependField}last`"
                    v-model="clone[prependField + 'last']"
                    :disabled="parentDisabled"
                    :error-messages="errors"
                    :hide-details="!errors.length"
                    name="last"
                    label="Last Name"
                    type="text"
                    :autocomplete="(autofill) ? '' : 'nope'">
                  </v-text-field>
                </ValidationProvider>
              </v-col>
              <v-col class="py-2" cols="12" md="6">
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
                    :hide-details="!errors.length"
                    name="email"
                    label="Email"
                    type="text"
                    :autocomplete="(autofill) ? '' : 'nope'">
                  </v-text-field>
                </ValidationProvider>
              </v-col>
              <FeathersVuexFind service="participantCategories" ref="age_categories" :query="{ active: 1, hidden: 0, $sort: { sortOrder: 1 } }">
                <v-col class="py-2" cols="12" md="4" slot-scope="{ items: participantCategories }">
                  <ValidationProvider
                    ref="age_category"
                    name="Age Category"
                    :rules="clone.metadata.processingStatus === 'confirmed' ? 'required' : ''"
                    v-slot="{ errors }"
                  >
                    <v-select
                      :id="`${clone.id || clone.__id}-${prependField}age_category`"
                      v-model="clone.metadata[prependField + 'age_category']"
                      :items="participantCategories"
                      item-text="name"
                      item-value="shortName"
                      :disabled="parentDisabled || selfDisabled"
                      :error-messages="errors"
                      name="age_category"
                      label="Age Category"
                      :hint="age ? `${age} years old` : ' '"
                      persistent-hint
                      :autocomplete="(autofill) ? '' : 'nope'">
                    </v-select>
                  </ValidationProvider>
                </v-col>
              </FeathersVuexFind>
            </v-row>
            <v-row>
              <v-col class="py-2" cols="12" md="5">
                <v-switch
                  :id="`${clone.id || clone.__id}-${prependField}consent`"
                  v-model="clone.metadata[prependField + 'consent']"
                  :class="($vuetify.breakpoint.mdAndUp) ? 'my-0' : ''"
                  :disabled="parentDisabled || selfDisabled"
                  name="consent"
                  label="Consented?"
                  hide-details
                  color="msu">
                </v-switch>
              </v-col>
              <v-col class="py-2" cols="12" md="5">
                <v-select
                  :id="`${clone.id || clone.__id}-${prependField}frequency`"
                  v-model="clone.metadata[prependField + 'frequency']"
                  :items="frequencies"
                  :disabled="parentDisabled || selfDisabled"
                  name="frequency"
                  label="Prompt frequency"
                  hide-details
                  :autocomplete="(autofill) ? '' : 'nope'">
                </v-select>
              </v-col>
              <v-col class="py-2" cols="12" md="5">
                <v-switch
                  :id="`${clone.id || clone.__id}-${prependField}permission_share`"
                  v-model="clone.metadata[prependField + 'permission_share']"
                  :class="($vuetify.breakpoint.mdAndUp) ? 'my-0' : ''"
                  :disabled="parentDisabled || selfDisabled"
                  name="permission_share"
                  label="Permission - Share on site?"
                  color="msu">
                </v-switch>
              </v-col>
              <v-col class="py-2" cols="12" md="5">
                <v-switch
                  :id="`${clone.id || clone.__id}-${prependField}permission_share_lom`"
                  v-model="clone.metadata[prependField + 'permission_share_lom']"
                  :class="($vuetify.breakpoint.mdAndUp) ? 'my-0' : ''"
                  :disabled="parentDisabled || selfDisabled"
                  name="permission_share_lom"
                  label="Permission - Share with Lib?"
                  color="msu">
                </v-switch>
              </v-col>
              <v-col class="py-2" cols="12" md="5">
                <v-switch
                  :id="`${clone.id || clone.__id}-${prependField}payment_optout`"
                  v-model="clone.metadata[prependField + 'payment_optout']"
                  :class="($vuetify.breakpoint.mdAndUp) ? 'my-0' : ''"
                  :disabled="parentDisabled || selfDisabled"
                  name="payment_optout"
                  label="Opted Out of Payment?"
                  color="msu">
                </v-switch>
              </v-col>
              <v-col class="py-2" cols="12" md="5">
                <v-autocomplete
                  :id="`${clone.id || clone.__id}-${prependField}paymentGroup`"
                  v-model="clone.metadata[prependField + 'paymentGroup']"
                  :readonly="isFindPaymentGroupsPending || clone.metadata[prependField + 'payment_optout'] || !paymentGroups.length"
                  :disabled="isFindPaymentGroupsPending || clone.metadata[prependField + 'payment_optout'] || !paymentGroups.length"
                  name="paymentGroups"
                  ref="paymentGroups"
                  label="Payment To"
                  :items="paymentGroups"
                  item-value="id"
                  item-text="shortName"
                  dense
                  outlined
                  :filter="filterAll"
                  clearable
                  @clear:click="clone.metadata[prependField + 'paymentGroup'] = null"
                  :menu-props="{ auto: true }"
                  :loading="isFindPaymentGroupsPending"
                  autocomplete="nope">
                  <template v-slot:item = "{ item }">
                    {{ `${item.name} (${item.shortName})` }}
                  </template>
                </v-autocomplete>
              </v-col>
            </v-row>
          </v-tab-item>
          <v-tab-item class="px-5">
            <v-row class="py-5">
              <v-col class="py-2" cols="12" sm="6">
                <EditorDate
                  :clone="clone.metadata"
                  field="dateOfBirth"
                  label="Date of Birth"
                  :hide-details="true"
                  :maxDate="$moment().subtract(3, 'year').format('YYYY-MM-DD')"
                  :required="false">
                </EditorDate>
              </v-col>
              <v-col class="py-2" cols="12" sm="6">
                <v-text-field
                  v-model="clone.metadata.gender"
                  name="gender"
                  label="Gender"
                  :hide-details="true"
                  type="text"
                  autocomplete="nope">
                </v-text-field>
              </v-col>
              <v-col class="py-2" cols="12" sm="6">
                <v-text-field
                  v-model="clone.metadata.ethnicity"
                  name="ethnicity"
                  label="Ethnicity"
                  :hide-details="true"
                  type="text"
                  autocomplete="nope">
                </v-text-field>
              </v-col>
              <v-col class="py-2" cols="12">
                <v-text-field
                  v-model="clone.metadata.locationGrowingUp"
                  name="locationGrowingUp"
                  label="Where did you grow up?"
                  :hide-details="true"
                  type="text"
                  autocomplete="nope">
                </v-text-field>
              </v-col>
              <v-col class="py-2" cols="12">
                <v-text-field
                  v-model="clone.metadata.locationCurrent"
                  name="locationCurrent"
                  label="Where do you live now?"
                  :hide-details="true"
                  type="text"
                  autocomplete="nope">
                </v-text-field>
              </v-col>
              <v-col class="py-2" cols="12">
                <v-autocomplete
                  v-model="clone.metadata.educationLevel"
                  name="educationLevel"
                  ref="educationLevel"
                  label="Education"
                  multiple
                  :items="educationLevels"
                  :menu-props="{ auto: true }"
                  :hide-details="true"
                  autocomplete="nope">
                </v-autocomplete>
              </v-col>
              <v-col class="py-2" cols="12">
                <v-text-field
                  v-model="clone.metadata.source"
                  name="source"
                  label="How did you hear about us?"
                  placeholder="e.g. News, friend"
                  :hide-details="true"
                  type="text"
                  autocomplete="nope">
                </v-text-field>
              </v-col>
              <v-col class="py-2" cols="12">
                <v-textarea
                  v-model="clone.metadata.otherInfo"
                  rows="5"
                  outlined
                  dense
                  label="Anything else you'd like to tell us?"
                  :hide-details="true"
                  type="text">
                </v-textarea>
              </v-col>
            </v-row>
          </v-tab-item>
          <!--- TODO: coded data section --->
          <v-tab-item class="px-5">
            <v-row class="py-5">
              <v-col class="py-2" cols="12" sm="6" md="4">
                <v-text-field
                  v-model="clone.metadata.coded.birthYear"
                  name="coded[birthYear]"
                  label="Birth Year"
                  type="text"
                  :hint="`Subj Entered: ${clone.metadata.dateOfBirth}`"
                  :persistent-hint="true"
                  autocomplete="nope">
                </v-text-field>
              </v-col>
              <v-col class="py-2" cols="12" sm="6" md="4">
                <v-autocomplete
                  v-model="clone.metadata.coded.gender"
                  :id="`${clone.id || clone.__id}-coded[gender]`"
                  :name="`${clone.id || clone.__id}-coded[gender]`"
                  label="Gender"
                  :items="genders"
                  :menu-props="{ auto: true }"
                  :hint="`Subj Entered: ${clone.metadata.gender}`"
                  :persistent-hint="true"
                  :search-input.sync="genderSearchInput"
                  @input="genderSearchInput = null"
                  clearable
                  autocomplete="nope">
                </v-autocomplete>
              </v-col>
              <v-col class="py-2" cols="12" sm="6" md="4">
                <v-autocomplete
                  v-model="clone.metadata.coded.pitchRange"
                  :id="`${clone.id || clone.__id}-coded[pitchRange]`"
                  :name="`${clone.id || clone.__id}-coded[pitchRange]`"
                  label="Pitch Range"
                  :items="pitchRanges"
                  :menu-props="{ auto: true }"
                  hint="Child + Male = low"
                  :persistent-hint="true"
                  :search-input.sync="pitchRangeSearchInput"
                  @input="pitchRangeSearchInput = null"
                  clearable
                  autocomplete="nope">
                </v-autocomplete>
              </v-col>
              <v-col class="py-2" cols="12" sm="6">
                <v-autocomplete
                  v-model="clone.metadata.coded.ethnicity"
                  :id="`${clone.id || clone.__id}-coded[ethnicity]`"
                  :name="`${clone.id || clone.__id}-coded[ethnicity]`"
                  label="Ethnicity (select multiple)"
                  :items="ethnicities"
                  :chips="false"
                  :multiple="true"
                  :deletable-chips="true"
                  :menu-props="{ auto: true }"
                  :hide-details="true"
                  :search-input.sync="ethnicitySearchInput"
                  @input="ethnicitySearchInput = null"
                  clearable
                  autocomplete="nope">
                  <template v-slot:selection="{ parent, item, index }">
                    <span v-if="index === 0">
                      <v-chip v-if="parent.chips">
                        <span>{{ item.text }}</span>
                      </v-chip>
                      <span v-else>
                        {{ item.text }}
                      </span>
                    </span>
                    <span v-if="index === 1" class="ml-1 grey--text text-caption">
                      (+{{ clone.metadata.coded.ethnicity.length - 1 }} others)
                    </span>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col class="py-2" cols="12" sm="6">
                <v-text-field
                  v-model="clone.metadata.coded.ethnicityNotes"
                  name="coded[ethnicityNotes]"
                  label="Ethnicity (notes)"
                  :hide-details="true"
                  type="text"
                  autocomplete="nope">
                </v-text-field>
              </v-col>
              <v-col class="py-2" cols="12" sm="6">
                <v-autocomplete
                  v-model="clone.metadata.coded.locationRaised"
                  :id="`${clone.id || clone.__id}-coded[locationRaised]`"
                  :name="`${clone.id || clone.__id}-coded[locationRaised]`"
                  label="Location - Raised"
                  :items="raisedLocations"
                  :menu-props="{ auto: true }"
                  :hide-details="true"
                  :search-input.sync="locationRaisedSearchInput"
                  @input="locationRaisedSearchInput = null"
                  clearable
                  autocomplete="nope">
                </v-autocomplete>
              </v-col>
              <v-col class="py-2" cols="12" sm="6">
                <v-text-field
                  v-model="clone.metadata.coded.locationRaisedNotes"
                  name="coded[locationRaisedNotes]"
                  label="Location - Raised (notes)"
                  :hide-details="true"
                  type="text"
                  autocomplete="nope">
                </v-text-field>
              </v-col>
              <v-col class="py-2" cols="12" sm="6">
                <v-autocomplete
                  v-model="clone.metadata.coded.locationParents"
                  :id="`${clone.id || clone.__id}-coded[locationParents]`"
                  :name="`${clone.id || clone.__id}-coded[locationParents]`"
                  label="Location - Parents"
                  :items="parentLocations"
                  :menu-props="{ auto: true }"
                  :hide-details="true"
                  :search-input.sync="locationParentsSearchInput"
                  @input="locationParentsSearchInput = null"
                  clearable
                  autocomplete="nope">
                </v-autocomplete>
              </v-col>
              <v-col class="py-2" cols="12">
                <v-textarea
                  v-model="clone.metadata.coded.occupation"
                  name="coded[occupation]"
                  rows="5"
                  outlined
                  dense
                  label="Occupation"
                  :hide-details="true"
                  type="text">
                </v-textarea>
              </v-col>
              <v-col class="py-2" cols="12">
                <v-textarea
                  v-model="clone.metadata.coded.residentialHistory"
                  name="coded[residentialHistory]"
                  rows="5"
                  outlined
                  dense
                  label="Residential History"
                  :hide-details="true"
                  type="text">
                </v-textarea>
              </v-col>
              <v-col class="py-2" cols="12">
                <v-textarea
                  v-model="clone.metadata.coded.otherInfo"
                  name="coded[otherInfo]"
                  rows="5"
                  outlined
                  dense
                  label="Other notes"
                  :hide-details="true"
                  type="text">
                </v-textarea>
              </v-col>
            </v-row>
          </v-tab-item>
          <v-tab-item class="px-5">
            <v-row class="py-5">
              <v-col class="py-2" cols="12">
                <keep-alive>
                  <rich-text-editor
                    :id="`${clone.id || clone.__id}-metdata.comment`"
                    :config="editorConfig"
                    v-model="clone.metadata.comment"
                    :disabled="parentDisabled"
                    name="commentContent"
                    label="Comments"
                    :autocomplete="(autofill) ? '' : 'nope'">
                  </rich-text-editor>
                </keep-alive>
              </v-col>
            </v-row>
          </v-tab-item>
        </v-tabs-items>
      </v-container>
    </v-card-text>

    <v-card-actions>
      <slot name="actions-left">
        <span class="text-caption font-italic dark-grey--text" v-if="showCodedUpdated">
          Last updated: {{ codedUpdatedAt | moment('YYYY-MM-DD @ h:mm a') }} by {{ `${codedUpdatedBy.last}` }}
        </span>
      </slot>
      <v-spacer></v-spacer>
      <slot name="actions-right"></slot>
    </v-card-actions>
  </v-card>
</template>

<script>
/* eslint-disable */
import { AgeFromDateString } from 'age-calculator';
import { extend } from 'vee-validate';
import { makeFindMixin } from 'feathers-vuex';
import RichTextEditor from 'vue-trumbowyg/src';
import 'trumbowyg/dist/ui/trumbowyg.css';
import 'trumbowyg/dist/plugins/fontsize/trumbowyg.fontsize.min.js';
import feathersClient from '@/plugins/feathers-client';
import feathersVuexFormHelpers from '@/mixins/feathersVuexFormHelpers';

export default {
  components: {
    RichTextEditor,
  },
  mixins: [
    feathersVuexFormHelpers,
    makeFindMixin({ service: 'paymentGroups', watch: true }),
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
    isDirty: {
      type: Boolean,
      default: false,
    },
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
      selectedTab: 0,
      educationLevels: [
        'Elementary',
        'High school',
        'Some college',
        'Bachelor\'s degree',
        'Master\'s degree',
        'Professional degree or PhD',
      ],
      genders: [
        {
          text: 'M',
          value: 'M'
        },
        {
          text: 'F',
          value: 'F'
        },
        {
          text: 'X',
          value: 'X'
        },
      ],
      ethnicities: [
        {
          text: 'Asian/Pacific Islander',
          value: 'Asian/Pacific Islander'
        },
        {
          text: 'Black or African American',
          value: 'Black or African American'
        },
        {
          text: 'Hispanic or Latino',
          value: 'Hispanic or Latino'
        },
        {
          text: 'Native American or American Indian',
          value: 'Native American or American Indian'
        },
        {
          text: 'White or Caucasian',
          value: 'White or Caucasian'
        },
        {
          text: 'Other',
          value: 'Other'
        }
      ],
      pitchRanges: [
        {
          text: 'High',
          value: 'High'
        },
        {
          text: 'Low',
          value: 'Low'
        }
      ],
      raisedLocations: [
        {
          text: 'Michigan',
          value: 'Michigan'
        },
        {
          text: 'Not Michigan',
          value: 'Not Michigan'
        },
        {
          text: 'Unknown',
          value: 'Unknown'
        }
      ],
      parentLocations: [
        {
          text: 'Michigan',
          value: 'Michigan'
        },
        {
          text: 'Not Michigan',
          value: 'Not Michigan'
        },
        {
          text: 'Michigan and not Michigan',
          value: 'MI and not-MI'
        },
        {
          text: 'Unknown',
          value: 'Unknown'
        }
      ],
      frequencies: [
        {
          text: 'Once a week',
          value: 'weekly',
        },
        {
          text: 'Every other week',
          value: 'biweekly',
        },
        {
          text: 'Once a month',
          value: 'monthly',
        },
        {
          text: 'Just once',
          value: 'once',
        },
      ],
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
      editorConfig: {
        btns: [
            ['removeformat'],
            ['undo', 'redo'], // Only supported in Blink browsers
            ['formatting'],
            ['strong', 'em', 'del'],
            ['fontsize'],
            ['superscript', 'subscript'],
            ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
            ['unorderedList', 'orderedList'],
            ['link'],
            ['horizontalRule'],
        ],
        plugins: {
          fontsize: {
            sizeList: [
            '16px',
            '18px',
            '22px',
            '26px',
            '30px',
            ],
            allowCustomSize: true,
          },
        },
        tagsToRemove: ['script', 'link'],
        tagsToKeep: ['i'],
        defaultLinkTarget: '_blank',
        // Get options from 
        // https://alex-d.github.io/Trumbowyg/documentation
      },
      ethnicitySearchInput: null,
      genderSearchInput: null,
      locationParentsSearchInput: null,
      locationRaisedSearchInput: null,
      pitchRangeSearchInput: null,
    };
  },
  computed: {
    paymentGroupsParams() {
      return { query: { $sort: { name: 1 } } };
    },
    age() {
      if (this.clone.metadata.dateOfBirth) {
        return new AgeFromDateString(this.clone.metadata.dateOfBirth).age;
      } else {
        return false;
      }
    },
    showCodedUpdated() {
      return this.codedUpdatedAt && this.codedUpdatedBy && this.selectedTab === 2;
    },
    codedUpdatedAt() {
      let ret = '';
      if (this.clone && this.clone.id && this.clone.metadata.coded && this.clone.metadata.coded.updatedAt) {
        return this.clone.metadata.coded.updatedAt;
      }
      return ret;
    },
  },
  asyncComputed: {
    codedUpdatedBy: {
      get() {
        if (this.clone && this.clone.id && this.clone.metadata.coded && this.clone.metadata.coded.updatedBy) {
          return this.$FeathersVuex.api.User.get(this.clone.metadata.coded.updatedBy);
        }
      },
      default: null,
    },
  },
  methods: {
    assignNextSID() {
      this.clone.assignSID = true;
      const obj = this.clone.commit();
      obj.save();
    },
    requestAnimationFrame() {
      this.$refs.subjectObserver.reset();
    },
    filterAll(item, queryText) {
      return (
        item.shortName.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1
        || item.name.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1
      );
    },
    isUnique(subjectId) {
      this.validating = true;
      return feathersClient.service('subjects').find({ query: { shortcode: subjectId } })
        .then((resp) => {
          this.validating = false;
          this.showValidIcon = subjectId !== this.originalSubjectId;
          this.validSID = resp.total === 0;
          return this.validSID;
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
