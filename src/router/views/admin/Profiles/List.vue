<template>
  <v-container fluid>
    <div v-if="isAuthenticated">
      <FeathersVuexFind service="profiles" :query="profileQuery" watch="query">
        <v-row justify="center" align="center" class="available-profiles" slot-scope="{ items: profiles, isFindPending: profilesAreLoading }">
          <v-col cols="12" sm="10">
            <v-data-table
              :headers="[
                {text: 'SID', value: 'subjectId', width: '12%'},
                {text: 'Group', value: 'age_category', width: '10%'},
                {text: 'Share', value: 'permission_share', width: '10%', align: 'center'},
                {text: '$$', value: 'payment_optout', width: '10%', align: 'center'},
                {text: '', value: 'hidden', width: '5%', align: ($vuetify.breakpoint.smAndDown || !showHiddenProfiles) ? ' d-none' : ''},
              ]"
              :items="profiles"
              :items-per-page="-1"
              :hide-default-header="profiles.length === 0"
              hide-default-footer
              multi-sort
              :loading="profilesAreLoading"
              @click:row="showProfileDetail"
              class="elevation-1">
                <template v-slot:top>
                  <v-toolbar flat class="msu dark-grey text-center white--text">
                    <v-toolbar-title>
                      <h3>Profiles</h3>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-icon class="white--text">
                      {{ showHiddenProfilesIcon }}
                    </v-icon>
                    <v-switch
                      v-model="showHiddenProfiles"
                      color="msu hover-1"
                      class="pt-5 mx-5">
                    </v-switch>
                  </v-toolbar>
                </template>
                <template v-slot:item.age_category="{ item }">
                  {{ (item.metadata.age_category) ? item.metadata.age_category : '' }}
                </template>
                <template v-slot:item.permission_share="{ item }">
                  {{ (item.metadata.permission_share) ? 'Y' : 'N' }}
                </template>
                <template v-slot:item.payment_optout="{ item }">
                  <v-icon small :color="(item.metadata.payment_optout) ? 'red' : 'msu'">
                    {{ (item.metadata.payment_optout) ? 'fa-ban' : 'fa-money-bill-wave' }}
                  </v-icon>
                </template>
                <template v-slot:item.hidden="{ item }">
                  <v-icon small class="black--text">
                    {{ (item.hidden) ? 'fa-eye-slash' : '' }}
                  </v-icon>
                </template>
                <template v-slot:no-data>
                   No Profiles to show yet
                </template>
            </v-data-table>
          </v-col>
        </v-row>
      </FeathersVuexFind>
    </div>
    <v-row justify="center">
      <v-col cols="12" sm="10" class="text-center">
        Click Profile to view details
      </v-col>
    </v-row>
  </v-container>

</template>

<script>
/* eslint-disable */
import { authComputed, appComputed } from '@/store/helpers';
import feathersClient from '@/plugins/feathers-client';
import formatters from '@/mixins/formatters';


export default {
  page() {
    return {
      title: `Profiles | Admin | ${this.$appStrings('appName')}`,
      meta: [
        {
          name: 'description',
          content: 'Admin - Profile List',
        },
      ],
    };
  },
  mixins: [
    formatters,
  ],
  data() {
    return {
      currentDiary: '',
      showHiddenProfiles: false,
    };
  },
  computed: {
    ...authComputed,
    ...appComputed,
    profileQuery() {
      const ret = { active: 1, hidden: 0, $sort: { subjectId: 1 }, $limit: 999 };
      if (this.showHiddenProfiles) {
        delete ret.hidden;
      }
      return ret;
    },
    showHiddenProfilesIcon() {
      return (this.showHiddenProfiles) ? 'fa-eye' : 'fa-eye-slash';
    },
  },
  methods: {
    showProfileDetail(row) {
      this.$router.push({ name: 'adminProfileDetails', params: { id: row.id } });
    },
  },
  watch: {
    showHiddenProfiles(val) {
      this.$store.dispatch('view/set', {
        showHiddenProfiles: val
      }, { root: true });
    }
  },
  mounted() {
    this.showHiddenProfiles = this.viewPreferences('showHiddenProfiles');
  },
};
</script>

<style lang="css">
tbody tr :hover {
  cursor: pointer;
}
</style>
