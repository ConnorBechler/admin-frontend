<template>
  <v-container fluid>
    <FeathersVuexFind service="dictionaryWords" :params="dictionaryWordsLocalParams" :fetchParams="dictionaryWordsFetchParams" :watch="['params.query']" :edit-scope="getPaginationInfo">
      <v-row justify="center" align="center" class="available-dictionaryWords" slot-scope="{ items: dictionaryWords, isFindPending: isFindDictionaryWordsPending }">
        <v-col cols="12" sm="10">
          <v-data-table
            :headers="[
              {text: 'Word', value: 'word'},
              {text: 'Phonemes', value: 'phonemes'},
              {text: 'Added', value: 'createdAt'},
              {text: 'Enabled?', value: 'active', width: '55px', align: 'left', sortable: false},
              {text: '', value: 'actions', align: 'end', sortable: false},
            ]"
            :items="dictionaryWords"
            :options.sync="tableOptions"
            :footer-props="{
              itemsPerPageOptions: [5,10,25,50,-1],
              showFirstLastPage: true,
              disablePagination: dictionaryWordsFetchParams.query.$limit === 0
            }"
            :loading="isFindDictionaryWordsPending"
            :server-items-length="total"
            :search="localSearch"
            :multi-sort="true"
            :hide-default-header="dictionaryWords.length === 0"
            :fixed-header="true"
            height="70vh"
            class="elevation-1">
            <template v-slot:progress>
              <v-progress-linear indeterminate color="msu"></v-progress-linear>
            </template>
            <template v-slot:top>
              <ValidationObserver ref="editorObserver" v-slot="{ invalid, validate }">
                <v-toolbar flat class="msu dark-grey text-center white--text">
                  <v-toolbar-title>
                    <h3>Dictionary of Life</h3>
                  </v-toolbar-title>
                  <v-text-field
                    v-model="localSearch"
                    label="Search"
                    solo
                    dense
                    class="mt-7 mx-4"
                  ></v-text-field>
                  <v-dialog
                    v-model="showEditor"
                    width="50%"
                    :fullscreen="$vuetify.breakpoint.xs"
                    persistent
                    scrollable
                    :transition="($vuetify.breakpoint.xs) ? 'dialog-bottom-transition' : 'fade-transition'">
                    <FeathersVuexFormWrapper :item="editedObj" ref="userForm" watch>
                      <template v-slot="{ clone, save, reset, isDirty }">
                        <v-card>
                          <v-card-title class="msu dark-grey text-center white--text">
                            <span class="text-h5">{{ editorTitle }}</span>
                            <v-spacer></v-spacer>
                            <v-icon class="white--text">fa-dollar-sign</v-icon>
                          </v-card-title>
                          <v-card-text>
                            <v-container>
                              <EditorDictionaryWord
                                :clone="clone"
                                :isDirty="isDirty"
                                :allowDelete="false"
                                :showControls="false"
                                :standalone="true">
                              </EditorDictionaryWord>
                            </v-container>
                          </v-card-text>

                          <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn @click="reset(); clearObjDialog();">Cancel</v-btn>
                            <v-btn color="msu accent-green white--text" @click="validate().then(valid => valid ? save().then(obj => clearObjDialog(obj)) : null);">Save</v-btn>
                          </v-card-actions>
                        </v-card>
                      </template>
                    </FeathersVuexFormWrapper>
                  </v-dialog>
                  <v-spacer></v-spacer>
                  <v-icon class="white--text">
                    {{ showHiddenDictionaryWordsIcon }}
                  </v-icon>
                  <v-switch
                    v-model="showHiddenDictionaryWords"
                    color="msu hover-1"
                    class="pt-5 mx-5">
                  </v-switch>
                </v-toolbar>
              </ValidationObserver>
            </template>
            <template v-slot:item.createdAt="{ item }">
              {{ item.createdAt | moment('YYYY-MM-DD @ h:mm a')}}
            </template>
            <template v-slot:item.actions="{ item }">
              <v-icon
                v-if="hasRole('admin, ra, ga')"
                small
                class="mr-5"
                color="msu"
                @click="editObj(item)">
                fa-pencil-alt
              </v-icon>
              <v-icon
                v-if="hasRole('admin, ra, ga')"
                small
                class="mr-5"
                color="red"
                @click="removeObj(item)">
                fa-trash
              </v-icon>
            </template>
            <!--- TODO: add download flat txt file button --->
            <template v-slot:footer v-if="hasRole('admin, ra, ga')">
              <v-col cols="12" class="text-center">
                <v-btn type="button" small @click="addObj">
                  <v-icon small left>fa-plus-circle</v-icon>
                  Add Word
                </v-btn>
                <v-btn
                  small
                  @click.stop="downloader"
                  :loading="isDownloading"
                  :disabled="isDownloading || fileDownloadBtn.disabled"
                  :color="fileDownloadBtn.color"
                  class="ml-5">
                  {{ fileDownloadBtn.text }}
                  <v-icon small right v-html="fileDownloadBtn.icon"></v-icon>
                </v-btn>
              </v-col>
            </template>
            <template v-slot:item.active="{ item }">
              <FeathersVuexFormWrapper :item="item" :key="`${item.id}-active`" watch>
                <template v-slot="{ clone, save }">
                  <v-checkbox
                    v-model="clone.active"
                    name="active"
                    dense
                    :readonly="!hasRole('admin, ra, ga')"
                    :disabled="!hasRole('admin, ra, ga')"
                    :hide-details="true"
                    @change="clone.commit(); save();"
                    class="ma-0">
                  </v-checkbox>
                </template>
              </FeathersVuexFormWrapper>
            </template>
            <template v-slot:no-data>
               No Words matching search!
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </FeathersVuexFind>
  </v-container>

</template>

<script>
/* eslint-disable */
import { makeFindMixin, makeGetMixin } from 'feathers-vuex';
import { appComputed, authComputed, userComputed } from '@/store/helpers';
import axios from 'axios';


export default {
  mixins: [
    // makeFindMixin({ service: 'dictionaryWords', watch: true }),
  ],
  page() {
    return {
      title: `Dictionary | Admin | ${this.$appStrings('appName')}`,
      meta: [
        {
          name: 'description',
          content: 'Admin - Dictionary',
        },
      ],
    };
  },
  data() {
    return {
      showEditor: false,
      showHiddenDictionaryWords: false,
      editedObj: new this.$FeathersVuex.api.DictionaryWord(),
      editorTitle: '',
      localSearch: '',
      total: 0,
      showingIds: [],
      tableOptions: {
        sortBy: ['word',],
        sortDesc: [ false ],
        itemsPerPage: 25,
      },
      fileDownloadBtn: {
        text: 'Download',
        icon: 'fa-cloud-download-alt',
        disabled: false,
      },
      isDownloading: false,
      isCompleted: false,
    };
  },
  computed: {
    ...authComputed,
    ...userComputed,
    ...appComputed,
    sort() {
      const sort = {};
      for (const idx in (this.tableOptions.sortBy || [])) {
        sort[this.tableOptions.sortBy[idx]] = this.tableOptions.sortDesc[idx] ? -1 : 1;
      }
      return Object.keys(sort).length ? sort : { word: 1 };
    },
    dictionaryWordsLocalParams() {
      const { idField } = this.$store.state.dictionaryWords;
      return { query: { [idField]: { $in: this.showingIds }, $sort: this.sort } };
    },
    dictionaryWordsFetchParams() {
      const itemsPerPage = this.tableOptions.itemsPerPage || 25;
      let splitSearch = [];
      const query = {
        active: 1,
        hidden: 0,
        $sort: this.sort,
        $limit: itemsPerPage,
        $skip: itemsPerPage * ((this.tableOptions.page || 1) - 1),
      };
      if (this.localSearch) {
          query.word = { $like: `${this.localSearch}%` };
      } else {
        query['$limit'] = itemsPerPage;
      }
      if (this.showHiddenDictionaryWords) {
        delete query.hidden;
        delete query.active;
      }
      return { query };
    },
    showHiddenDictionaryWordsIcon() {
      return (this.showHiddenDictionaryWords) ? 'fa-eye' : 'fa-eye-slash';
    },
  },
  methods: {
    getPaginationInfo (scope) {
      const { queryInfo, pageInfo } = scope;
      if (this.total !== queryInfo.total) {
        this.total = queryInfo.total;
      }
      if (pageInfo && pageInfo.ids) {
        this.showingIds = pageInfo.ids;
      }
    },
    addObj() {
      this.editorTitle = 'Add a Word';
      this.editedObj = new this.$FeathersVuex.api.DictionaryWord();
      this.showEditor = true;
    },
    editObj(obj) {
      this.editorTitle = 'Edit Word';
      this.editedObj = obj;
      this.showEditor = true;
    },
    clearObjDialog() {
      this.showEditor = false;
      this.editorTitle = 'Add a Word';
      this.editedObj = new this.$FeathersVuex.api.DictionaryWord();
      this.$refs.editorObserver.reset();
    },
    removeObj(obj) {
      this.$confirm('Are you sure you want to delete this Word?', 
        {
          title: 'Delete Word',
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
    downloader() {
      const uri = `/api/dictionary/download`;
      this.isCompleted = false;
      this.isDownloading = true;

      axios.get(uri, {
        headers: {
          Authorization: this.$store.state.auth.accessToken,
          // block cache as location doesn't change, but content can
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        params: {
          fromApp: true,
        },
        responseType: 'arraybuffer',
      })
      .then((resp) => {
        this.isDownloading = false;
        this.fileDownloadBtn.text = 'Downloading';
        this.fileDownloadBtn.icon = 'fa-check-circle';
        this.fileDownloadBtn.disabled = true;
        var blob = new Blob([resp.data],{type:resp.headers['content-type']});
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.target = "_blank"
        link.download = resp.headers['x-filename'];
        link.click();
      })
      .catch((err) => {
        console.log('err', err);
        this.isDownloading = false;
        this.fileDownloadBtn.text = 'Error';
        this.fileDownloadBtn.icon = 'fa-exclamation-circle';
      })
      .finally(() => {
        setTimeout(() => {
          this.fileDownloadBtn.text = 'Download';
          this.fileDownloadBtn.icon = 'fa-cloud-download-alt';
          this.fileDownloadBtn.disabled = false;
          this.isCompleted = true;
          Promise.resolve(true);
        }, 2000);
      });
    },
    displayError(err) {
      console.log('err!', err);
    },
    requestAnimationFrame() {
      this.$refs.editorObserver.reset();
    },
  },
  watch: {
    showHiddenDictionaryWords(val) {
      this.$store.dispatch('view/set', {
        showHiddenDictionaryWords: val
      }, { root: true });
    },
    localSearch(val) {
      this.tableOptions.page = 1;
    },
  },
  mounted() {
    this.showHiddenDictionaryWords = this.viewPreferences('showHiddenDictionaryWords');
  },
};
</script>
