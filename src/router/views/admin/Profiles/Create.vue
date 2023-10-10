<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" sm="8">
      </v-col>
    </v-row>
  </v-container>

</template>

<script>
/* eslint-disable */
import axios from 'axios';
import qs from 'qs';
import { mapGetters, mapActions } from 'vuex';
import Loading from '@/components/global/Loading.vue';
import { authComputed, appComputed } from '@/store/helpers';
import feathersClient from '@/plugins/feathers-client';
import formatters from '@/mixins/formatters';
import feathersVuexFormHelpers from '@/mixins/feathersVuexFormHelpers';


export default {
  page() {
    return {
      title: `Profiles | Manage | ${this.$appStrings('appName')}`,
      meta: [
        {
          name: 'description',
          content: `Profile Management - ${this.$appStrings('appName')}`,
        },
      ],
    };
  },
  mixins: [
    formatters,
  ],
  data() {
    return {
      pickerProfile: null,
      selectedProfile: null,
      editingProfile: null,
      showDiaryEditor: false,
      editorTitle: 'New Profile',
      selectedTitle: 'Using:',
    };
  },
  computed: {
    ...authComputed,
    ...appComputed,
  },
  methods: {
    addProfile() {
      this.editorTitle = 'New Profile';
      this.selectedProfile = null;
      const tempMetadata = { manual: true };
      const tempTags = ['box_upload'];
      this.editingProfile = new this.$FeathersVuex.api.Profile({ metadata: tempMetadata, tags: tempTags });
    },
    closeEditing() {
      this.$refs.editorObserver.reset();
      this.editingProfile = null;
    },
    closeProfile() {
      this.$refs.selectedObserver.reset();
      this.selectedProfile = null;
    },
    async saveEditing(profile) {
      this.changeSelectedProfile(await profile.save());
    },
    changeSelectedProfile(profile) {
      if (this.editingProfile) {
        this.closeEditing();
      }
      this.selectedProfile = profile;
      this.selectedTitle = 'Using: ' + (profile.subjectId || '(missing SID)');
      if (this.pickerProfile) {
        this.$nextTick(() => {
          this.pickerProfile = null;
          this.$refs.pickerProfile.blur();
        });
      }
    },
    editProfile() {
      this.editingProfile = this.selectedProfile;
      this.editorTitle = 'Editing ' + this.editingProfile.subjectId;
    },
  },
};
</script>

<style lang="css">
tbody tr :hover {
  cursor: pointer;
}
</style>
