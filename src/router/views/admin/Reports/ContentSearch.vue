<template>
  <v-container fluid v-if="isAuthenticated && isElevated">
    <v-row justify="center">
      <v-col cols="12" sm="11">
        <v-data-table
          :headers="[
            {text: 'SID', value: 'subjectId', align: 'left'},
            {text: 'Category', value: 'subjectMetadata.age_category', align: 'left'},
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
                <v-toolbar flat class="msu dark-grey text-center white--text">
                  <v-toolbar-title>
                    <h3>Ye Olde Content Finder</h3>
                  </v-toolbar-title>
                  <v-text-field
                    v-model="searchString"
                    @change="(searchString && searchString.length >= 3) ? getReportData(searchString) : null"
                    label="Seach query (boolean mode +/-/*, 3+ chars)"
                    solo
                    dense
                    class="mt-7 mx-4"
                  ></v-text-field>
                  <v-spacer></v-spacer>
                  <v-icon class="white--text" large>
                    {{ searchIcon }}
                  </v-icon>
                </v-toolbar>
              </span>
            </template>
            <template v-slot:item.subjectMetadata.age_category="{ item }">
              {{ (item && item.subjectMetadata && item.subjectMetadata.age_category) ? item.subjectMetadata.age_category : '' }}
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
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
/* eslint-disable */
import { mapGetters, mapActions } from 'vuex';
import { makeFindMixin, makeGetMixin } from 'feathers-vuex';
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
          searchString: data
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
  },
};
</script>
