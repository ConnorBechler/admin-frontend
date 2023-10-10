<template>
  <v-container fluid v-if="isAuthenticated && currentProfile">
  </v-container>
</template>

<script>
/* eslint-disable */
import { mapGetters, mapActions } from 'vuex';
import { authComputed } from '@/store/helpers';
import feathersClient from '@/plugins/feathers-client';
import feathersVuexFormHelpers from '@/mixins/feathersVuexFormHelpers';
import formatters from '@/mixins/formatters';


export default {
  name: 'diary-detail',
  mixins: [
    feathersVuexFormHelpers,
    formatters,
  ],
  page() {
    return {
      title: `Profile Details | ${this.$appStrings('appName')}`,
      meta: [
        {
          name: 'description',
          content: 'Profile Detail page',
        },
      ],
    };
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      currentProfile: '',
      detailsAreLoading: true,
      editingDetails: false,
    };
  },
  computed: {
    ...authComputed,
  },
  methods: {
    fetchProfileData() {
      const profile = this.currentProfile;
      if (profile.id) {
      };
    },
    saveClone({ event, clone }) {
      clone.commit();
      clone.save();
    },
    resetClone({ event, clone }) {
      clone.reset();
      event.target.blur();
    },
  },
  watch: {
    id: {
      async handler(val) {
        if (!val) {
          this.$router.push({ name: 'adminProfilesList' });
        }
        const { Profile } = this.$FeathersVuex.api;
        const profileAlreadyLoaded = Profile.getFromStore(val);

        if (profileAlreadyLoaded) {
          this.currentProfile = profileAlreadyLoaded;
          this.fetchProfileData();
        } else {
          await Profile.get(val)
            .then((resp) => {
              this.currentProfile = resp;
              this.fetchProfileData();
            })
            .catch((err) => {
              let errMsg = '';
              // error: check FeathersError
              // if record not found, display error and route back
              if (err.name) {
                errMsg = (err.name === 'NotFound')
                  ? 'No Profile found for this ID!'
                  : 'There was a problem loading that Profile!';
              }
              this.$store.dispatch('alert/display',
                {
                  type: 'error',
                  message: errMsg,
                  timeout: 2500,
                  icon: 'fa-exclamation',
                },
                { root: true });
              this.$router.push({ name: 'adminProfilesList' });
            });
        }
      },
      immediate: true,
    },
  },
  created() {
    // TODO: add checks for deleted, not this user, etc
    if (!this.id) {
      this.$router.push({ name: 'adminProfilesList' });
    }
  },
};
</script>
