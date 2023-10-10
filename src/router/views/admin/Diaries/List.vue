<template>
  <v-container fluid>
    <div v-if="isAuthenticated">
      <v-dialog
        v-model="showEditor"
        width="50%"
        :fullscreen="$vuetify.breakpoint.xs"
        persistent
        scrollable
        @keydown.esc="clearObjDialog"
        :transition="($vuetify.breakpoint.xs) ? 'dialog-bottom-transition' : 'fade-transition'">
        <FeathersVuexFormWrapper :item="editedObj" ref="profileForm" watch>
          <template v-slot="{ clone, save, reset, isDirty }">
            <v-card>
              <v-card-title class="msu dark-grey text-center white--text">
                <span class="text-h5">{{ editorTitle }}</span>
                <v-spacer></v-spacer>
                <v-icon class="white--text">fa-user</v-icon>
              </v-card-title>
              <v-card-text class="text-body-1 mt-5">
                <v-row>
                  <v-col cols="12">
                    Please add Details for:<br>
                    First Name: {{ clone.fname }}<br>
                    Email: {{ clone.email }}<br>
                  </v-col>
                </v-row>
                <v-container>
                  <EditorProfile
                    :clone="clone"
                    :isDirty="isDirty"
                    :isAdmin="true"
                    :showParticipantInfo="false"
                    :allowDelete="false"
                    :showControls="false"
                    :standalone="true">
                  </EditorProfile>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="reset(); clearObjDialog();">Cancel</v-btn>
                <v-btn color="msu white--text" :disabled="!isDirty" @click="save().then(clearObjDialog);">Save</v-btn>
              </v-card-actions>
            </v-card>
          </template>
        </FeathersVuexFormWrapper>
      </v-dialog>
      <v-row justify="center" align="center" class="available-diaries">
        <v-col cols="12" lg="10">
          <v-data-table
            :headers="[
              {text: 'S', value: 'metadata.editingStatus', width: '10%', align: 'center'},
              {text: 'SID', value: 'subjectId', width: '20%'},
              {text: 'Pub', value: 'permissionShare', width: '10%', align: 'center'},
              {text: 'Feat', value: 'metadata.interesting', width: '10%', align: 'center'},
              {text: 'Group', value: 'ageCategory', width: '10%'},
              {text: 'Diary #', value: 'dateCode', width: '25%', align: 'end'},
              {text: 'Duration', value: 'metadata.duration', width: '10%', align: 'start'},
              {text: '', value: 'actions', width: '10%'},
              {text: '', value: 'hidden', width: '5%', align: ($vuetify.breakpoint.smAndDown || !showHiddenDiaries) ? ' d-none' : ''},
            ]"
            :items="diaries"
            :options.sync="tableOptions"
            :footer-props="{
              itemsPerPageOptions: [5,10,15,25,50,100,-1],
              showFirstLastPage: true,
              disablePagination: diariesParams.query.$limit === 0
            }"
            :fixed-header="true"
            :hide-default-header="diaries.length === 0"
            :search="localSearch"
            multi-sort
            :loading="isFindDiariesPending"
            loading-text="Loading Diaries..."
            height="70vh"
            class="elevation-1">
            <template v-slot:progress>
              <v-progress-linear indeterminate color="msu"></v-progress-linear>
            </template>
            <template v-slot:top>
              <v-toolbar flat class="msu dark-grey text-center white--text">
                <v-toolbar-title>
                  <h3>Recent Diaries</h3>
                </v-toolbar-title>
                <v-text-field
                  v-model="localSearch"
                  label="Search"
                  placeholder="SID, yyyy-mm-dd, kid, adult, etc"
                  solo
                  dense
                  class="mt-7 mx-4"
                ></v-text-field>
                <v-spacer></v-spacer>
                <v-icon class="white--text">
                  {{ showHiddenDiariesIcon }}
                </v-icon>
                <v-switch
                  v-model="showHiddenDiaries"
                  color="msu hover-1"
                  class="pt-5 mx-5">
                </v-switch>
              </v-toolbar>
            </template>
            <template v-slot:item.subjectId="{ item }">
              <span v-if="!item.profile.subjectId">
                <v-btn small class=" msu light-grey" @click="editObj(item)">Add SID</v-btn>
              </span>
              <span v-else>
                <!--- temporary workaround for list not updating after dialog editor adds sid --->
                {{ item.subjectId !== '(no SID)' ? item.subjectId : $FeathersVuex.api.Subject.getFromStore(item.profile.subjectId).shortcode }}
              </span>
            </template>
            <template v-slot:item.dateCode="{ item }">
              <FeathersVuexCount v-slot="{ total }" service="documents" :params="{ query: { parentId: item.id, $or: [ { fileext: 'jpg' }, { fileext: 'png' } ] } }">
                <v-icon left color="msu dark-grey" v-if="total">
                  {{ (total === 1) ? 'far fa-image' : 'far fa-images' }}
                </v-icon>
              </FeathersVuexCount>
              {{ item.dateCode }}
            </template>
            <template v-slot:item.permissionShare="{ item }">
              {{ (item.permissionShare) ? 'Y' : 'N' }}
            </template>
            <template v-slot:item.ageCategory="{ item }">
              <span v-if="item.profile.subjectId">
                <!--- temporary workaround for list not updating after dialog editor adds sid --->
                {{ item.ageCategory !== '' ? item.ageCategory : $FeathersVuex.api.Subject.getFromStore(item.profile.subjectId).metadata.age_category }}
              </span>
            </template>
            <template v-slot:item.metadata.duration="{ item }">
              {{ toSexagesimal((item.metadata.duration) ? item.metadata.duration : 0, 'seconds') }}
            </template>
            <template v-slot:item.hidden="{ item }">
              <v-icon small class="black--text">
                {{ (item.hidden) ? 'fa-eye-slash' : '' }}
              </v-icon>
            </template>
            <template v-slot:item.metadata.interesting="{ item }">
              <v-icon class="black--text" color="msu">
                {{ (item.metadata.interesting) ? 'far fa-grin-stars' : '' }}
              </v-icon>
            </template>
            <template v-slot:item.metadata.editingStatus="{ item }">
              <span class="mr-1">
                <v-icon small color="msu" class="white--text" v-if="item.metadata.editingStatus === 'Completed'">
                  fa-check
                </v-icon>
                <v-icon small color="msu dark-grey" class="white--text" v-else-if="item.metadata.editingStatus === 'In Progress'">
                  fa-pencil-alt
                </v-icon>
                <v-icon small color="msu light-grey" class="white--text" v-else>
                  fa-check
                </v-icon>
              </span>
              <span class="ml-1">
                <v-icon small color="msu" class="white--text" v-if="item.metadata.lastCheckedAt && item.metadata.validated">
                  fa-check-double
                </v-icon>
                <v-icon small color="red" class="white--text ml-1" v-else-if="item.metadata.lastCheckedAt">
                  fa-times
                </v-icon>
                <v-icon small color="msu light-grey" class="white--text" v-else>
                  fa-check-double
                </v-icon>
              </span>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn
                v-if="hasRole('admin, ra, ga')"
                small
                color="msu white--text"
                @click="showDiaryDetail(item)">
                View
              </v-btn>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </div>
  </v-container>

</template>

<script>
/* eslint-disable */
import { makeFindMixin } from 'feathers-vuex';
import { authComputed, appComputed } from '@/store/helpers';
import feathersClient from '@/plugins/feathers-client';
import formatters from '@/mixins/formatters';


export default {
  page() {
    return {
      title: `Admin | Diaries | ${this.$appStrings('appName')}`,
      meta: [
        {
          name: 'description',
          content: 'Admin - Diary List',
        },
      ],
    };
  },
  mixins: [
    formatters,
    makeFindMixin({ service: 'diaries', watch: true }),
  ],
  data() {
    return {
      showHiddenDiaries: false,
      localSearch: null,
      showEditor: false,
      editedObj: new this.$FeathersVuex.api.Profile(),
      editorTitle: '',
      tableOptions: {
        sortBy: [],
        sortDesc: [],
        itemsPerPage: 25,
        page: 1,
      },
    };
  },
  computed: {
    ...authComputed,
    ...appComputed,
    diariesParams() {
      const query = { active: 1, hidden: 0, $sort: { createdAt: -1 }, $limit: 99999 };
      if (this.showHiddenDiaries) {
        delete query.hidden;
      }
      return { query };
    },
    showHiddenDiariesIcon() {
      return (this.showHiddenDiaries) ? 'fa-eye' : 'fa-eye-slash';
    },
  },
  methods: {
    showDiaryDetail(obj) {
      let routeData = this.$router.resolve({ name: 'adminDiaryDetails', params: { id: obj.id } });
      window.open(routeData.href, '_blank');
    },
    editObj(obj) {
      this.editorTitle = 'Edit Details';
      this.editedObj = obj.profile;
      this.showEditor = true;
    },
    clearObjDialog() {
      this.showEditor = false;
      this.editorTitle = 'Edit Details';
      this.editedObj = new this.$FeathersVuex.api.Profile();
    },
  },
  watch: {
    showHiddenDiaries(val) {
      this.$store.dispatch('view/set', {
        showHiddenDiaries: val
      }, { root: true });
      this.tableOptions.page = 1;
    }
  },
  mounted() {
    this.showHiddenDiaries = this.viewPreferences('showHiddenDiaries');
  },
};
</script>
