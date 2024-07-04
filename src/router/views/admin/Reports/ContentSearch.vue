<template>
  <v-container fluid v-if="isAuthenticated && isElevated">
    <v-row class="justify-center">
      <v-col cols="12" sm="11">
        <v-data-table
          :headers="[
            {text: 'SID', value: 'subjectId', align: 'left', width: '135px'},
            {text: 'Date', value: 'metadata.diaryDate', align: 'left', width: '125px'},
            {text: 'Category', value: 'subjectMetadata.participant_category', align: 'left'},
            {text: 'Start', value: 'startTime', align: 'right', sortable: false},
            {text: 'End', value: 'endTime', align: 'center', sortable: false},
            {text: 'Content', value: 'content', align: 'left', sortable: false},
            {text: '', value: 'actions'},
          ]"
          :items="reportData"
          :hide-default-header="reportData.length === 0"
          :options.sync="tableOptions"
          :footer-props="{
            itemsPerPageOptions: [5,10,15,25,50,100,-1],
            showFirstLastPage: true,
            disablePagination: reportData.length <= tableOptions.itemsPerPage,
          }"
          :fixed-header="true"
          :multi-sort="true"
          height="65vh"
          class="elevation-1">
            <template v-slot:top>
              <span>
                <v-toolbar flat class="msu dark-grey text-center white--text" height="80x">
                  <v-toolbar-title>
                    <h3>Ye Olde Content Finder</h3>
                  </v-toolbar-title>
                  <v-row class="justify-left">
                    <v-col cols="6" sm="8">
                      <v-text-field
                        v-model="searchString"
                        @change="(searchString && searchString.length >= 3) ? getReportData(searchString) : null"
                        label="Seach query"
                        :hint="regexSearch ? 'RegEx, don\'t need the `/ /g`' : 'Seach query (boolean mode +/-/*, 3+ chars)'"
                        :persistent-hint="true"
                        solo
                        dense
                        class="mt-7 mx-4"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="2" sm="1">
                        <v-checkbox
                          v-model="regexSearch"
                          @change="(searchString && searchString.length >= 3) ? getReportData(searchString) : null"
                          :hide-details="false"
                          :persistent-hint="true"
                          hint="RegEx"
                          color="white"
                          dense
                          base-color="white"
                          class="mt-9 white--text">
                        </v-checkbox>
                    </v-col>
                    <v-col cols="2" sm="1">
                        <v-checkbox
                          v-model="completedOnly"
                          @change="(searchString && searchString.length >= 3) ? getReportData(searchString) : null"
                          :hide-details="false"
                          :persistent-hint="true"
                          hint="Comp"
                          color="white"
                          dense
                          base-color="white"
                          class="mt-9 white--text">
                        </v-checkbox>
                    </v-col>
                    <v-col cols="2">
                      <v-icon class="mt-7 white--text font-weight-bold" large>
                        {{ searchIcon }}
                      </v-icon>
                    </v-col>
                    <!---
                    <v-col cols="3">
                      <v-text-field
                        v-model="maxResults"
                        @change="(searchString && searchString.length >= 3) ? getReportData(searchString) : null"
                        label="Results"
                        hint="Results"
                        :persistent-hint="true"
                        solo
                        dense
                        class="mt-7 mx-4"
                      ></v-text-field>
                    </v-col>
                    --->
                  </v-row>
                </v-toolbar>
              </span>
            </template>
            <template v-slot:item.subjectMetadata.participant_category="{ item }">
              {{ (item && item.subjectMetadata && item.subjectMetadata.participant_category) ? item.subjectMetadata.participant_category : '' }}
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn
                small
                color="msu white--text"
                @click="showDiaryDetail(item)">
                View
              </v-btn>
            </template>
            <template v-slot:no-data v-if="!searchString || searchString.length <= 3">
               Please enter search terms to get started
            </template>
            <template v-slot:no-data v-else>
               No Sentences matching this query
            </template>
            <template v-slot:footer>
              <v-col cols="12" class="text-center">
                <v-btn
                  small
                  @click.stop="generateDownload({ type: 'xls' })"
                  :loading="isDownloading"
                  :disabled="isDownloading || fileDownloadBtn.disabled || reportData.length === 0"
                  :color="fileDownloadBtn.color"
                  class="ml-5">
                  {{ fileDownloadBtn.text }}
                  <v-icon small right v-html="fileDownloadBtn.icon"></v-icon>
                </v-btn>
              </v-col>
            </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
/* eslint-disable */
import { mapGetters, mapActions } from 'vuex';
import { makeFindMixin, makeGetMixin } from 'feathers-vuex';
import * as excel from 'xlsx';
import { authComputed, appComputed, userComputed } from '@/store/helpers';
import feathersClient from '@/plugins/feathers-client';


export default {
  name: 'sentence-search',
  page() {
    return {
      title: `Sentence Search | Reports | ${this.$appStrings('appName')}`,
      meta: [
        {
          name: 'description',
          content: 'Reports - Sentence Search',
        },
      ],
    };
  },
  data() {
    return {
      isInitDone: false,
      searchString: '',
      isSearchRunning: false,
      searchIcon: '',
      localSearch: '',
      reportData: [],
      tableOptions: {
        sortBy: ['subjectId'],
        sortDesc: [false],
        itemsPerPage: 25,
        page: 1,
      },
      fileDownloadBtn: {
        text: 'Download',
        icon: 'fa-cloud-download-alt',
        disabled: false,
      },
      isDownloading: false,
      isCompleted: false,
      maxResults: 2500,
      completedOnly: false,
      regexSearch: false,
    };
  },
  computed: {
    ...authComputed,
    ...appComputed,
    ...userComputed,
  },
  methods: {
    async getReportData(data) {
      this.isSearchRunning = true;
      this.searchIcon = "fas fa-face-flushed fa-spin"
      this.reportData = await feathersClient.service('reporting').create({
          action: "reports:contentSearch",
          searchString: data,
          params: {
            completedOnly: this.completedOnly,
            regexSearch: this.regexSearch,
          },
        })
        .then((resp) => {
          this.isSearchRunning = false;
          this.searchIcon = resp.length ? "fas fa-face-surprise" : "fas fa-face-sad-cry"
          return resp;
        })
        .catch((err) => {
          this.isSearchRunning = false;
          this.searchIcon = "fas fa-face-dizzy"
          return [];
        })
    },
    showDiaryDetail(obj) {
      let routeData = this.$router.resolve({ name: 'adminDiaryDetails', params: { id: obj.diaryId } });
      window.open(routeData.href, '_blank');
    },
    generateDownload({
      type = 'csv',
      filename = `${this.$appStrings('subjectPrefix')} search - ${this.searchString.replace(/[^\w\s]/gi, '')}`
      }) {
      const ret = [];
      const headers = [
        'SID',
        'Diary',
        'Duration',
        'Status',
        'Category',
        'Start',
        'End',
        'Content',
        'link',
      ];
      ret.push(headers);
      const sortedReportData = this.reportData.sort((a,b) => a.subjectId.localeCompare(b.subjectId))
      for (const reportLine of sortedReportData) {
        const reportLineLink = this.$router.resolve({ name: 'adminDiaryDetails', params: { id: reportLine.diaryId } });
        ret.push([
          reportLine.subjectId,
          `${reportLine.metadata.diaryDate} #${reportLine.metadata.sequence.toString().padStart(2, 0)}`,
          reportLine.metadata.duration,
          reportLine.metadata.editingStatus,
          reportLine.subjectMetadata.participant_category,
          reportLine.startTime,
          reportLine.endTime,
          reportLine.content,
          `${this.$appStrings('appUrl')}${reportLineLink.href}`,
        ]);
      }
      const ws = excel.utils.aoa_to_sheet(ret);
      const wb = excel.utils.book_new();
      excel.utils.book_append_sheet(wb, ws, 'output');
      excel.writeFile(wb, `${filename}.${type}`);
    },
  },
};
</script>

<style lang="scss">
  .v-messages__message {
      color: white !important;
      font-weight: bold;
  }
</style>
