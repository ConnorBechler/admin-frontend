<template>
  <v-container fluid>
    <FeathersVuexFind service="processingJobs" :params="processingJobsLocalParams" :fetchParams="processingJobsFetchParams" :watch="['params.query']" :edit-scope="getPaginationInfo">
      <v-row justify="center" align="center" class="available-processingJobs" slot-scope="{ items: processingJobs, isFindPending: isFindprocessingJobsPending }">
        <v-col cols="12" sm="10">
          <v-data-table
            :headers="[
              {text: 'Transcript', value: 'transcript'},
              {text: 'Created', value: 'createdAt'},
              {text: 'Stage', value: 'metadata.stage', width: '55px', sortable: false},
              {text: 'Stage Progress', value: 'status', width: '25%', sortable: false},
              {text: '', value: 'actions', align: 'end', sortable: false},
            ]"
            :items="processingJobs"
            :options.sync="tableOptions"
            :footer-props="{
              itemsPerPageOptions: [5,10,25,50,100],
              showFirstLastPage: true,
              disablePagination: processingJobsFetchParams.query.$limit === 0
            }"
            :loading="isFindprocessingJobsPending"
            :server-items-length="total"
            :multi-sort="true"
            :hide-default-header="processingJobs.length === 0"
            :fixed-header="true"
            height="70vh"
            class="elevation-1">
            <template v-slot:progress>
              <v-progress-linear indeterminate color="msu"></v-progress-linear>
            </template>
            <template v-slot:top>
              <v-toolbar flat class="msu dark-grey text-center white--text">
                <v-toolbar-title>
                  <h3>Processing Jobs</h3>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-icon class="white--text">
                  {{ showHiddenProcessingJobsIcon }}
                </v-icon>
                <v-switch
                  v-model="showHiddenProcessingJobs"
                  color="msu hover-1"
                  class="pt-5 mx-5">
                </v-switch>
              </v-toolbar>
            </template>
            <template v-slot:item.transcript="{ item }">
              {{ `${item.shortcode} - ${item.diaryData.diaryDate} #${item.diaryData.sequence}`}}
            </template>
            <template v-slot:item.status="{ item }">
              <v-progress-linear v-if="item.status == -1" value="100" color="red" height="10"></v-progress-linear>
              <v-progress-linear v-else-if="item.status == 999" value="100" color="msu success-1" height="10"></v-progress-linear>
              <v-progress-linear v-else :value="item.status" striped color="msu" height="10"></v-progress-linear>
            </template>
            <template v-slot:item.createdAt="{ item }">
              {{ item.createdAt | moment('YYYY-MM-DD @ h:mm a')}}
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn
                v-if="item.status == -1 && !item.metadata.fixed"
                x-small
                color="msu light-grey"
                @click="markFixed(item)">
                Fixed It!
              </v-btn>
            </template>
            <template v-slot:no-data>
               No Jobs to show!
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
    // makeFindMixin({ service: 'processingJobs', watch: true }),
  ],
  page() {
    return {
      title: `Processing Jobs | Admin | ${this.$appStrings('appName')}`,
      meta: [
        {
          name: 'description',
          content: 'Admin - Research - Processing Jobs',
        },
      ],
    };
  },
  data() {
    return {
      showHiddenProcessingJobs: false,
      total: 0,
      showingIds: [],
      tableOptions: {
        sortBy: ['createdAt',],
        sortDesc: [ false ],
        itemsPerPage: 25,
      },
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
    processingJobsLocalParams() {
      const { idField } = this.$store.state.processingJobs;
      return { query: { [idField]: { $in: this.showingIds }, $sort: this.sort } };
    },
    processingJobsFetchParams() {
      const itemsPerPage = this.tableOptions.itemsPerPage || 25;
      let splitSearch = [];
      const query = {
        $and: [
          { status: { $ne: 999 } },
          { $or: [
              { status: { $ne: -1 } },
              { $and: [{ status: -1, 'metadata.fixed': false }] },
            ]
          }
        ],
        $sort: this.sort,
        $limit: itemsPerPage,
        $skip: itemsPerPage * ((this.tableOptions.page || 1) - 1),
      };
      // if (this.showHiddenProcessingJobs) {
      //   delete query.hidden;
      //   delete query.active;
      // }
      return { query };
    },
    showHiddenProcessingJobsIcon() {
      return (this.showHiddenProcessingJobs) ? 'fa-eye' : 'fa-eye-slash';
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
    displayError(err) {
      console.log('err!', err);
    },
    markFixed(transcript) {
      const clone = transcript.clone();
      clone.metadata.fixed = true;
      clone.commit();
      clone.save();
    },
  },
  watch: {
    showHiddenProcessingJobs(val) {
      this.$store.dispatch('view/set', {
        showHiddenProcessingJobs: val
      }, { root: true });
    },
  },
  mounted() {
    this.showHiddenProcessingJobs = this.viewPreferences('showHiddenProcessingJobs');
  },
};
</script>
