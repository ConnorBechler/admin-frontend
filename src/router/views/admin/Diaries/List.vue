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
            v-model="selected"
            :headers="[
            //{text: 'S', value: 'metadata.editingStatus', width: '10%', align: 'center', sortable: false},
            {text: 'SID', value: 'subjectId', width: '30%', sortable: false},
            /* {text: 'Pub', value: 'permissionShare', width: '10%', align: 'center', sortable: false},
            {text: 'Feat', value: 'metadata.interesting', width: '10%', align: 'center', sortable: false},
            {text: 'Category', value: 'participantCategory', width: '10%', sortable: false}, */
            {text: 'Diary #', value: 'dateCode', width: '30%', align: 'start', sortable: false},
            {text: 'Duration', value: 'metadata.duration', width: '20%', align: 'start', sortable: false},
            {text: '',value: 'audio', width: '20%',align:'end',sortable: false},
            {text: '', value: 'actions', width: '10%', sortable: false},
            //{text: '', value: 'hidden', width: '5%', align: ($vuetify.breakpoint.smAndDown || !showHiddenDiaries) ? ' d-none' : '', sortable: false},
            ]"
            :items="diaries"
            :server-items-length="serverItemsLength"
            :hide-default-header="diaries.length === 0"
            :options.sync="tableOptions"
            :footer-props="{
              itemsPerPageOptions: [5,10,15,25,50,100],
              showFirstLastPage: true,
              disablePagination: serverItemsLength <= tableOptions.itemsPerPage
            }"
            :fixed-header="true"
            :loading="isProcessing"
            loading-text="Loading Recordings..."
            height="70vh"
            class="elevation-1"
            item-selectable="selectable"
            show-select
            return-object>
            <template v-slot:progress>
              <v-progress-linear indeterminate color="msu"></v-progress-linear>
            </template>
            <template v-slot:top>
              <v-toolbar flat class="msu dark-grey text-center white--text">
                <v-toolbar-title>
                  <h3>Recent Recordings</h3>
                </v-toolbar-title>
                <v-text-field
                  v-model="searchString"
                  @change="getDiariesList()"
                  label="Search"
                  placeholder="SID, yyyy-mm-dd, kid, adult, etc"
                  solo
                  dense
                  class="mt-7 mx-4"
                ></v-text-field>
                <v-spacer></v-spacer>
                <!--<v-icon class="white--text">
                  {{ showHiddenDiariesIcon }}
                </v-icon>
                <v-switch
                  v-model="showHiddenDiaries"
                  color="msu hover-1"
                  class="pt-5 mx-5">
                </v-switch>-->
                <v-icon class="white--text">
                  {{ 'fa-bars' }}
                </v-icon>
                <v-switch
                  v-model="showDeleteButton"
                  color="red"
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
                <v-icon
                v-if="hasRole('admin, ra, ga')"
                small
                class="ml-3"
                color="msu dark-grey"
                @click="editObj(item)">
                fa-pencil-alt
              </v-icon>
              </span>
            </template>
            <template v-slot:item.dateCode="{ item }">
              <!--<FeathersVuexCount v-slot="{ total }" service="documents" :params="{ query: { parentId: item.id, $or: [ { fileext: 'jpg' }, { fileext: 'png' } ] } }">
                <v-icon left color="msu dark-grey" v-if="total">
                  {{ (total === 1) ? 'far fa-image' : 'far fa-images' }}
                </v-icon>
              </FeathersVuexCount>-->
              {{ item.dateCode }}
            </template>
            <!--<template v-slot:item.permissionShare="{ item }">
              {{ (item.permissionShare) ? 'Y' : 'N' }}
            </template>
            <template v-slot:item.participantCategory="{ item }">
              <span v-if="item.profile.subjectId">
                <! --- temporary workaround for list not updating after dialog editor adds sid --- >
                {{ item.participantCategory !== '' ? item.participantCategory : $FeathersVuex.api.Subject.getFromStore(item.profile.subjectId).metadata.participant_category }}
              </span>
            </template>-->
            <template v-slot:item.metadata.duration="{ item }">
              {{ toSexagesimal((item.metadata.duration) ? item.metadata.duration : 0, 'seconds') }}
            </template>
            <!--<template v-slot:item.metadata.interesting="{ item }">
              <v-icon class="black--text" color="msu">
                {{ (item.metadata.interesting) ? 'far fa-grin-stars' : '' }}
              </v-icon>
            </template>
            <template v-slot:item.metadata.editingStatus="{ item }">
              <span class="mr-1">
                <v-icon small color="msu" class="white--text" v-if="item.metadata.locked">
                  fa-lock
                </v-icon>
                <v-icon small color="msu" class="white--text" v-else-if="item.metadata.editingStatus === 'Completed'">
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
            </template>-->
            <template v-slot:item.audio="{ item }">
              <span v-if="hasRole('admin, ra, ga')">
                <FeathersVuexFind v-slot="{ items: audRec, isFindPending: recordingIsLoading }" service="documents" :params="{ query: {parentId : item.id, $or : [ { fileext: 'mp4' }, { fileext: 'm4a' }, { fileext: 'mp3' }, { fileext: 'wav' }, { fileext: 'webm' }, { fileext: 'ogg' }, { fileext: 'flac' }, ],} }">
                <span v-if="recordingIsLoading">Audio loading...</span>
                <span v-else>
                  <section v-if="audRec.length > 0">
                    <!--<div>
                    <audio
                      controls
                      ref="player"
                      :key="audRec[0].id"
                      preload="metadata"
                      @playing="updatePlayerStatus('playing')"
                      @pause="updatePlayerStatus('pause')"
                      @ended="updatePlayerStatus('ended')"
                      @timeupdate="updatePlayerTime"
                      style="width:100%;" >
                      <source
                        :src="`/audio/${audRec[0].id}.mp3`"
                        type="audio/mp3">
                    </audio>
                    </div>
                    <v-select
                      :id="`${item.id}-audioDownloadOptions`"
                      v-model="selectedAudioDownloadOption[item.id]"
                      name="selectedAudioDownloadOption"
                      label="Download audio as..."
                      :return-object="true"
                      :items="audioDownloadOptions(audRec[0])"
                      @click.native.stop
                      >
                      <template v-slot:append-outer>
                        <v-btn
                          :id="`${item.id}-audioDownloadBtn`"
                          small
                          class="controls-row mr-2"
                          style="width: 10em"
                          @click.native.stop="selectedAudioDownloadOption[item.id]?.type === 'original' ? downloader('/api/download/' + audRec[0].id, item.id) : convertAudio(audRec[0].id, selectedAudioDownloadOption[item.id])"
                          :loading="downloadBtnSettings[item.id]?.isDownloading || downloadBtnDefaults.disabled"
                          :disabled="!selectedAudioDownloadOption[item.id]?.type
                            || downloadBtnSettings[item.id]?.isDownloading
                            || downloadBtnSettings[item.id]?.disabled
                            || downloadBtnDefaults.disabled"
                          :color="downloadBtnSettings[item.id]?.color || downloadBtnDefaults.color">
                          <v-icon v-if="downloadBtnSettings[item.id]?.icon" small v-text="downloadBtnSettings[item.id]?.icon"></v-icon>
                            <span v-else>
                              {{ downloadBtnSettings[item.id]?.text || downloadBtnDefaults.text}}
                            </span>
                        </v-btn>
                      </template>
                    </v-select>-->
                  </section>
                  <section v-else>No audio found<v-icon class="ml-3" color="msu accent-orange">{{ 'fa-exclamation-circle' }}</v-icon></section>
                </span>
                </FeathersVuexFind>
              </span>
            </template>
            <!--<template v-slot:item.hidden="{ item }">
              <v-icon small class="black--text">
                {{ (item.hidden) ? 'fa-eye-slash' : '' }}
              </v-icon>
            </template>-->
            <template v-slot:item.actions="{ item }">
              <v-icon
                v-if="hasRole('admin, ra, ga') && (showDeleteButton)"
                small
                class="mr-3"
                color="red"
                @click="removeDiary(item)">
                fa-trash
              </v-icon>
            </template>
            <template v-slot:footer.prepend>
              <v-btn
                small
                @click.stop="getDiariesList()"
                :loading="isProcessing"
                :disabled="isProcessing"
                color="msu light-grey"
                class="ml-5">
                Refresh
                <v-icon small right>fa-refresh</v-icon>
              </v-btn>
              <div class="ml-5">
              <FeathersVuexFind v-if="selected"
              v-slot="{ items: audRecs, isFindPending: recordingIsLoading }" service="documents" :params="{ query: {parentId : {$in : selected.map(value => value.id)}, $or : [ { fileext: 'mp4' }, { fileext: 'm4a' }, { fileext: 'mp3' }, { fileext: 'wav' }, { fileext: 'webm' }, { fileext: 'ogg' }, { fileext: 'flac' }, ],} }">
                <span v-if="recordingIsLoading">Audio loading...</span>
                <span v-else>
                  <v-select
                    :id="`bulkAudioDownloadOptions`"
                    v-model="selectedBulkAudioDownloadOption"
                    name="selectedBulkAudioDownloadOption"
                    label="Download selected audio as..."
                    :return-object="true"
                    :items="bulkAudioDownloadOptions()"
                    @click.native.stop
                    >
                    <template v-slot:append-outer>
                      <v-btn
                        :id="`bulkAudioDownloadBtn`"
                        small
                        class="controls-row mr-2"
                        style="width: 10em"
                        @click.native.stop="selectedBulkAudioDownloadOption?.type === 'original' ? bulkDownloader(audRecs) : bulkConvertAudio(audRecs, selectedBulkAudioDownloadOption)"
                        :loading="bulkDownloadBtnSettings?.isDownloading || downloadBtnDefaults.disabled"
                        :disabled="!selectedBulkAudioDownloadOption?.type
                          || bulkDownloadBtnSettings?.isDownloading
                          || bulkDownloadBtnSettings?.disabled
                          || audRecs.length==0"
                        :color="bulkDownloadBtnSettings?.color || downloadBtnDefaults.color">
                        <v-icon v-if="bulkDownloadBtnSettings?.icon" small v-text="bulkDownloadBtnSettings?.icon"></v-icon>
                          <span v-else>
                            {{ bulkDownloadBtnSettings?.text || downloadBtnDefaults.text}}
                          </span>
                      </v-btn>
                    </template>
                  </v-select>
                </span>
                </FeathersVuexFind>
                </div>
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
import axios from 'axios';
import qs from 'qs';


export default {
  page() {
    return {
      title: `Admin | Recordings | ${this.$appStrings('appName')}`,
      meta: [
        {
          name: 'description',
          content: 'Admin - Recording List',
        },
      ],
    };
  },
  mixins: [
    formatters,
    // makeFindMixin({ service: 'diaries', watch: true }),
  ],
  data() {
    return {
      diaries: [],
      selected: [],
      showHiddenDiaries: false,
      showDeleteButton: false,
      searchString: null,
      showEditor: false,
      editedObj: new this.$FeathersVuex.api.Profile(),
      editorTitle: '',
      serverItemsLength: 0,
      tableOptions: {
        sortDesc: [false],
        itemsPerPage: 25,
        page: 1,
      },
      isProcessing: false,
      isCompleted: false,
      isDownloading: false,
      playerStatus: {
        currentTime: 0,
        playing: false,
        paused: false,
      },
      //selectedAudioDownloadOption: {},
      selectedBulkAudioDownloadOption: {},
      //selectedTranscriptDownloadOption: {},
      //downloadBtnSettings: {},
      bulkDownloadBtnSettings: {},
      downloadBtnDefaults: {
        text: 'Download',
        color: 'msu light-grey',
        icon: 'fa-cloud-download-alt',
        disabled: false,
      },
    };
  },
  computed: {
    ...authComputed,
    ...appComputed,
    showHiddenDiariesIcon() {
      return (this.showHiddenDiaries) ? 'fa-eye' : 'fa-eye-slash';
    },
    showDeleteDiariesIcon() {
      return (this.showDeleteButton) ? 'fa-trash' : 'fa-trash-slash';
    },
  },
  methods: {
    async getDiariesList() {
      this.isProcessing = true;
      const sorter = [];
      if (this.tableOptions.sortBy.length > 0) {
        for (const idx of this.tableOptions.sortBy) {
          sorter.push(`${this.tableOptions.sortBy[idx]} ${this.tableOptions.sortDesc[idx] ? 'ASC' : 'DESC'}`)
        }
      } else {
        sorter.push(`diaries.createdAt DESC`);
      }
      this.diaries = await feathersClient.service('adminMaintenance').create({
          action: "diary:getList",
          searchString: this.searchString,
          params: {
            showHiddenDiaries: this.showHiddenDiaries,
            sort: sorter,
            limit: this.tableOptions.itemsPerPage,
            skip: this.tableOptions.itemsPerPage * ((this.tableOptions.page || 1) - 1)
          },
        })
        .then((resp) => {
          this.serverItemsLength = resp.serverItemsLength;
          const ret = [];
          for (const d of resp.data) {
            ret.push(new this.$FeathersVuex.api.Diary(d));
          }
          return ret;
        })
        .catch((err) => {
          return [];
        })
        .finally(() => {
          this.isProcessing = false;
        })
    },
    audioDownloadOptions(recording) {
      const ret = [];
      ret.push({
        text: 'Original (' + recording.fileext.toUpperCase() + ')',
        type: 'original',
      });
      ret.push({
        id: recording.id,
        text: 'WAV',
        type: 'wav',
      });
      ret.push({
        id: recording.id,
        text: 'MP3',
        type: 'mp3',
      });
      return ret;
    },
    bulkAudioDownloadOptions() {
      const ret = [];
      ret.push({
        text: 'Original',
        type: 'original',
      });
      ret.push({
        //audRecs: audRecs,
        text: 'WAV',
        type: 'wav',
      });
      ret.push({
        //audRecs: audRecs,
        text: 'MP3',
        type: 'mp3',
      });
      return ret;
    },
    /* convertAudio(id, {type, raw = false, redact = false, transcriptionId = null}) {
      const options = {};
      options.to = type;
      options.channels = 1;
      options.redact = redact;
      options.raw = raw;

      if (options.redact && transcriptionId) {
        options.transcriptionId = transcriptionId;
      }

      this.downloader('/api/audio/' + id, this.id, options);
    }, */
    bulkConvertAudio(audRecs, {type, raw = false, redact = false, transcriptionId = null}) {
      const options = {};
      options.to = type;
      options.channels = 1;
      options.redact = redact;
      options.raw = raw;

      if (options.redact && transcriptionId) {
        options.transcriptionId = transcriptionId;
      }

      this.bulkDownloader(audRecs, options);
    },
    /* downloader(uri, sourceId, options) {
      console.log(uri)

      this.updateDownloadBtnSettings(sourceId, 'isCompleted', false);
      this.updateDownloadBtnSettings(sourceId, 'isDownloading', true);
      this.updateDownloadBtnSettings(sourceId, 'error', '');
      console.log(options)
      axios.get(uri, {
        params: options,
        paramsSerializer: params => {
          return qs.stringify(params)
        },
        headers: {
          Authorization: this.$store.state.auth.accessToken,
          // block cache as location doesn't change, but content can
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        responseType: 'arraybuffer',
      })
      .then((resp) => {
        this.updateDownloadBtnSettings(sourceId, 'isDownloading', false);
        this.updateDownloadBtnSettings(sourceId, 'disabled', true);
        this.updateDownloadBtnSettings(sourceId, 'text', '');
        this.updateDownloadBtnSettings(sourceId, 'icon', 'fa-check-circle');
        var blob = new Blob([resp.data],{type:resp.headers['content-type']});
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.target = "_blank"
        link.download = resp.headers['x-filename'];
        link.click();
        setTimeout(() => {
          this.updateDownloadBtnSettings(sourceId, 'text', 'Download');
          this.updateDownloadBtnSettings(sourceId, 'icon', '');
          this.updateDownloadBtnSettings(sourceId, 'disabled', false);
          this.updateDownloadBtnSettings(sourceId, 'isCompleted', true);
          Promise.resolve(true);
        }, 2000);
      })
      .catch((err) => {
        console.log(err)
        const errorData = err.response.data instanceof ArrayBuffer
          ? JSON.parse(new TextDecoder('utf-8').decode(err.response.data))
          : err.response.data
        this.updateDownloadBtnSettings(sourceId, 'error', { color: 'red', message: errorData.message });
        this.updateDownloadBtnSettings(sourceId, 'isDownloading', false);
        this.updateDownloadBtnSettings(sourceId, 'disabled', false);
        this.updateDownloadBtnSettings(sourceId, 'text', '');
        this.updateDownloadBtnSettings(sourceId, 'icon', 'fa-exclamation-circle');
        this.updateDownloadBtnSettings(sourceId, 'color', 'msu accent-orange');
        setTimeout(() => {
          this.updateDownloadBtnSettings(sourceId, 'text', 'Download');
          this.updateDownloadBtnSettings(sourceId, 'icon', '');
          this.updateDownloadBtnSettings(sourceId, 'color', '');
          Promise.resolve(true);
        }, 3000);
      })
    }, */
    bulkDownloader(audRecs, options) {
      
      this.bulkDownloadBtnSettings['isCompleted'] =  false;
      this.bulkDownloadBtnSettings['isDownloading'] = true;
      this.bulkDownloadBtnSettings['error'] = '';
      for (let i = 0; i < audRecs.length; i++) {
        // currently just brute force check if the diary has duration; if not, don't download.
        // this is crude, but should technically never be ebcountered(?)
        if (this.selected[i].metadata.duration > 0) {
          let uri = '/api/audio/' + audRecs[i].id
          if (options===undefined) {uri = '/api/download/' + audRecs[i].id}
          //console.log(uri)
          axios.get(uri, {
            params: options,
            paramsSerializer: params => {
              return qs.stringify(params)
            },
            headers: {
              Authorization: this.$store.state.auth.accessToken,
              // block cache as location doesn't change, but content can
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Expires': '0',
            },
            responseType: 'arraybuffer',
          })
          .then((resp) => {
            this.bulkDownloadBtnSettings['isDownloading'] =  false;
            this.bulkDownloadBtnSettings['disabled'] = true;
            this.bulkDownloadBtnSettings['text'] = '';
            this.bulkDownloadBtnSettings['icon'] = 'fa-check-circle';
            var blob = new Blob([resp.data],{type:resp.headers['content-type']});
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.target = "_blank"
            link.download = resp.headers['x-filename'];
            link.click();
            setTimeout(() => {
              this.bulkDownloadBtnSettings['text'] = 'Download';
              this.bulkDownloadBtnSettings['icon'] = '';
              this.bulkDownloadBtnSettings['disabled'] = false;
              this.bulkDownloadBtnSettings['isCompleted'] = true;
              Promise.resolve(true);
            }, 2000);
            
          })
          .catch((err) => {
            //console.log(err)
            const errorData = err.response.data instanceof ArrayBuffer
              ? JSON.parse(new TextDecoder('utf-8').decode(err.response.data))
              : err.response.data
            this.bulkDownloadBtnSettings['error'] = { color: 'red', message: errorData.message };
            this.bulkDownloadBtnSettings['isDownloading'] = false;
            this.bulkDownloadBtnSettings['disabled'] = false;
            this.bulkDownloadBtnSettings['text'] = '';
            this.bulkDownloadBtnSettings['icon'] = 'fa-exclamation-circle';
            this.bulkDownloadBtnSettings['color'] = 'msu accent-orange';
            setTimeout(() => {
              this.bulkDownloadBtnSettings['text'] = 'Download';
              this.bulkDownloadBtnSettings['icon'] = '';
              this.bulkDownloadBtnSettings['color'] = '';
              Promise.resolve(true);
            }, 3000);
          })
        }
      }      
    },
    /* updateDownloadBtnSettings(sourceId, key, value) {
      this.$set(this.downloadBtnSettings, sourceId, { ...this.downloadBtnSettings[sourceId], [key]: value });
    }, */
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
    removeDiary(obj) {
      if (obj.id) {
        feathersClient.service('adminMaintenance').create({
          action: 'diary:remove',
          id: obj.id,
          actuallyDelete: false,
        })
        .then((ret) => {
          this.$confirm(`Are you extra sure? This will delete the diary from the file system and database.`, 
            {
              title: 'Delete all diary data',
              icon: 'fas fa-question',
              color: 'msu',
              buttonTrueText: 'Yes',
              buttonFalseText: 'Whoops',
            })
            .then((conf) => {
              if (conf) {
                feathersClient.service('adminMaintenance').create({
                  action: 'diary:remove',
                  id: obj.id,
                  actuallyDelete: true,
                })
                .then((ret) => {
                  this.$store.dispatch('alert/display',
                    {
                      type: 'success',
                      message: 'Removed Diary and files!',
                      timeout: 1000,
                      icon: 'fa-thumbs-up',
                    },
                    { root: true });
                    this.getDiariesList();
                })
                .catch((err) => {
                  //this.removeDiaryError = true;
                  this.$store.dispatch('alert/display',
                    {
                      type: 'error',
                      message: err.message,
                      timeout: 2500,
                      icon: 'fa-exclamation',
                    },
                    { root: true });
                  setTimeout(() => {
                    //this.removeDiaryBtn.text = 'Delete Diary';
                    //this.removeDiaryBtn.disabled = false;
                    Promise.resolve(true);
                  }, 500);
                });
              } else {
                //this.removeDiaryBtn.text = 'Delete Diary';
                //this.removeDiaryBtn.disabled = false;
              }
            });
        })
        .catch((err) => {
          //this.removeDiaryError = true;
          this.$store.dispatch('alert/display',
            {
              type: 'error',
              message: err.message,
              timeout: 2500,
              icon: 'fa-exclamation',
            },
            { root: true });
          setTimeout(() => {
            //this.removeDiaryBtn.text = 'Delete Diary';
            //this.removeDiaryBtn.disabled = false;
            Promise.resolve(true);
          }, 500);
        });
      }
    },
  },
  watch: {
    showHiddenDiaries(val) {
      this.$store.dispatch('view/set', {
        showHiddenDiaries: val
      }, { root: true });
      this.$set(this.tableOptions, 'page', 1);
      this.getDiariesList();
    },
    tableOptions(val, oldVal) {
      if (val && val !== oldVal) {
        this.getDiariesList();
      }
    },
  },
  mounted() {
    this.showHiddenDiaries = this.viewPreferences('showHiddenDiaries');
  },
};
</script>
