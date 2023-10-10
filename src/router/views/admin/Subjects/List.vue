<template>
  <v-container fluid>
    <v-row justify="center" align="center" class="available-subjects">
      <v-col cols="12" sm="10">
        <v-data-table
          :headers="[
            {text: 'ID', value: 'shortcode', width: '130px', sortable: false},
            {text: 'First', value: 'first', width: '15%', sortable: false},
            {text: 'Email', value: 'email', sortable: false},
            {text: 'Status', value: 'metadata.processingStatus', width: '5%', align: 'center', sortable: false},
            {text: 'Group', value: 'metadata.age_category', width: '5%', sortable: false},
            {text: '', value: 'actions', width: '200px', align: 'end', sortable: false},
            {text: '', value: 'hidden', width: '5%', align: ($vuetify.breakpoint.smAndDown || !showHiddenSubjects) ? ' d-none' : '', sortable: false},
          ]"
          :items="subjects"
          :options.sync="tableOptions"
          :footer-props="{
            itemsPerPageOptions: [5,10,15,25,50,100,-1],
            showFirstLastPage: true,
            disablePagination: subjectsParams.query.$limit === 0
          }"
          :fixed-header="true"
          height="70vh"
          :search="localSearch"
          :hide-default-header="subjects.length === 0"
          multi-sort
          :loading="isFindSubjectsPending"
          class="elevation-1">
            <template v-slot:top>
              <v-toolbar flat class="msu dark-grey text-center white--text">
                <v-toolbar-title>
                  <h3>Subjects</h3>
                </v-toolbar-title>
                <v-text-field
                  v-model="localSearch"
                  label="Search"
                  placeholder="SD-xxx, email, name"
                  solo
                  dense
                  class="mt-7 mx-4"
                ></v-text-field>
                <v-spacer></v-spacer>
                <ValidationObserver ref="editorObserver" v-slot="{ invalid, validate }">
                  <v-dialog
                    v-model="showEditor"
                    width="50%"
                    :fullscreen="$vuetify.breakpoint.xs"
                    persistent
                    scrollable
                    :transition="($vuetify.breakpoint.xs) ? 'dialog-bottom-transition' : 'fade-transition'">
                    <FeathersVuexFormWrapper :item="editedObj" ref="subjectForm" watch>
                      <template v-slot="{ clone, save, reset, isDirty }">
                        <EditorSubject
                          :key="editedObj.id || editedObj.__id"
                          :originalSubjectId="editedObj.shortcode ? editedObj.shortcode : ''"
                          :clone="clone"
                          :isDirty="isDirty"
                          :isAdmin="hasRole('admin, ra, ga')">
                          <template #title>
                            <span class="text-h5">{{ editorTitle }}</span>
                            <v-spacer></v-spacer>
                            <v-icon class="white--text">fa-user</v-icon>
                          </template>
                          <template #actions-right>
                            <span>
                              <v-btn class="mr-2" @click="reset(); clearObjDialog();">Close</v-btn>
                              <v-btn color="msu accent-green white--text" :disabled="!isDirty" @click="validate().then(valid => valid ? save().then(clearObjDialog) : null);">Save</v-btn>
                            </span>
                          </template>
                        </EditorSubject>
                      </template>
                    </FeathersVuexFormWrapper>
                  </v-dialog>
                </ValidationObserver>
                <v-icon class="white--text">
                  {{ showHiddenSubjectsIcon }}
                </v-icon>
                <v-switch
                  v-model="showHiddenSubjects"
                  color="msu hover-1"
                  class="pt-5 mx-5">
                </v-switch>
              </v-toolbar>
            </template>
            <template v-slot:item.metadata.permission_share="{ item }">
              {{ (item.metadata.permission_share) ? 'Y' : 'N' }}
            </template>
            <template v-slot:item.metadata.age_category="{ item }">
              {{ (item.metadata.age_category) ? item.metadata.age_category : '' }}
            </template>
            <template v-slot:item.metadata.consent="{ item }">
              <v-icon small :color="(item.metadata.consent) ? 'green' : 'red'">
                {{ (item.metadata.consent) ? 'fa-check' : 'fa-ban' }}
              </v-icon>
            </template>
            <template v-slot:item.metadata.processingStatus="{ item }">
              <v-icon v-if="!item.metadata.processingStatus" small color="msu">
                far fa-clock
              </v-icon>
              <v-icon v-else-if="item.metadata.processingStatus === 'confirmed'" small color="green">
                fa-check
              </v-icon>
              <v-icon v-else-if="item.metadata.processingStatus === 'ignore'" small color="red">
                fa-ban
              </v-icon>
              <v-icon v-else-if="item.metadata.processingStatus === 'duplicate'" small color="msu light-grey">
                fa-redo
              </v-icon>
            </template>
            <template v-slot:item.createdAt="{ item }">
              {{ item.createdAt | moment('MM-DD-YY') }}
            </template>
            <template v-slot:footer v-if="hasRole('admin, ra, ga')">
              <v-col cols="12" class="text-center">
                <v-btn type="button" small class="add-row" @click="addObj">
                  Add Subject
                </v-btn>
              </v-col>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn type="button" small class="mr-4" @click="showSubjectDetail(item)">
                View
              </v-btn>
              <v-icon
                v-if="hasRole('admin, ra, ga')"
                small
                class="mr-3"
                color="msu dark-grey"
                @click="editObj(item)">
                fa-pencil-alt
              </v-icon>
              <v-icon
                v-if="hasRole('admin, ra, ga')"
                small
                class="mr-3"
                color="red"
                @click="removeObj(item)">
                fa-trash
              </v-icon>
            </template>
            <template v-slot:item.hidden="{ item }">
              <v-icon small class="black--text">
                {{ (item.hidden || !item.active) ? 'fa-eye-slash' : '' }}
              </v-icon>
            </template>
            <template v-slot:no-data>
               No Subjects to show yet
            </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>

</template>

<script>
/* eslint-disable */
import { makeFindMixin, makeGetMixin } from 'feathers-vuex';
import { authComputed, appComputed } from '@/store/helpers';
import feathersClient from '@/plugins/feathers-client';
import formatters from '@/mixins/formatters';


export default {
  page() {
    return {
      title: `Subjects | Admin | ${this.$appStrings('appName')}`,
      meta: [
        {
          name: 'description',
          content: 'Admin - Subject List',
        },
      ],
    };
  },
  mixins: [
    formatters,
    makeFindMixin({ service: 'subjects', watch: true }),
  ],
  data() {
    return {
      showEditor: false,
      showHiddenSubjects: false,
      editedObj: new this.$FeathersVuex.api.Subject(),
      editorTitle: '',
      localSearch: null,
      tableOptions: {
        sortBy: ['shortcode', 'createdAt'],
        sortDesc: [ false, false ],
        itemsPerPage: 15,
        page: 1,
      },
    };
  },
  computed: {
    ...authComputed,
    ...appComputed,
    subjectsParams() {
      const query = { active: 1, hidden: 0, $sort: { shortcode: 1 }, $limit: 99999 };
      if (this.showHiddenSubjects) {
        delete query.active;
        delete query.hidden;
      }
      return { query };
    },
    showHiddenSubjectsIcon() {
      return (this.showHiddenSubjects) ? 'fa-eye' : 'fa-eye-slash';
    },
  },
  methods: {
    showSubjectDetail(row) {
      this.$router.push({ name: 'adminSubjectDetails', params: { id: row.id } });
    },
    addObj() {
      this.editorTitle = 'Add a Subject';
      this.editedObj = new this.$FeathersVuex.api.Subject();
      this.showEditor = true;
    },
    editObj(obj) {
      this.editorTitle = 'Edit Subject';
      this.editedObj = obj;
      this.showEditor = true;
    },
    clearObjDialog() {
      this.showEditor = false;
      this.editorTitle = 'Add a Subject';
      this.editedObj = new this.$FeathersVuex.api.Subject();
      this.$refs.editorObserver.reset();
    },
    removeObj(obj) {
      this.$confirm('Are you sure you want to delete this Subject?', 
        {
          title: 'Delete Subject',
          icon: 'fas fa-question',
          color: 'msu',
          buttonTrueText: 'Yes',
          buttonFalseText: 'Whoops',
        })
        .then((conf) => {
          if (conf) {
            const clone = obj.clone();
            clone.remove();
          }
        });
    },
    requestAnimationFrame() {
      this.$refs.editorObserver.reset();
    },
  },
  watch: {
    showHiddenSubjects(val) {
      this.$store.dispatch('view/set', {
        showHiddenSubjects: val
      }, { root: true });
      this.tableOptions.page = 1;
    }
  },
  mounted() {
    this.showHiddenSubjects = this.viewPreferences('showHiddenSubjects');
  },
};
</script>

<style lang="css">
tbody tr :hover {
  cursor: pointer;
}
</style>
