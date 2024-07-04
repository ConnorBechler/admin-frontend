<template>
  <AppDrawer
    :items="items">
  </AppDrawer>
</template>

<script>
import { appComputed, authComputed } from '@/store/helpers';

export default {
  data() {
    return {
      item: '',
    };
  },
  computed: {
    ...appComputed,
    ...authComputed,
    mini() {
      return (this.$vuetify.breakpoint.mdAndDown);
    },
    items() {
      return [
        {
          text: 'Quick Add: Diary',
          icon: 'fa-plus-circle',
          route: 'adminDiaryUpload',
        },
        {
          text: 'Diaries',
          icon: 'fa-book',
          route: 'adminDiariesList',
        },
        {
          text: 'Subjects',
          icon: 'fa-users',
          route: 'adminSubjectsList',
        },
        {
          text: 'Dictionary',
          icon: 'fa-quote-right',
          route: 'adminDictionaryWordsList',
        },
        {
          text: 'Reports',
          icon: 'fa-file-contract',
          route: 'adminReportsList',
        },
        {
          text: 'Transcriptions',
          icon: 'fa-list-check',
          roles: 'transcriptManager',
          route: 'adminTranscriptionManagerList',
        },
        {
          text: 'Research',
          icon: 'fa-clipboard-list',
          path: '/admin/research',
          roles: 'researchManager',
          children: [
            {
              text: 'Processing Jobs',
              icon: 'fa-bars-progress',
              route: 'adminResearchProcessingJobsList',
            },
            {
              text: 'Workers',
              icon: 'fa-microchip',
              route: 'adminResearchRemoteWorkersList',
            },
          ],
        },
        {
          text: 'Manage',
          icon: 'fa-cogs',
          path: '/admin/manage',
          children: [
            {
              text: 'Age Groups',
              icon: 'fa-birthday-cake',
              route: 'adminParticipantCategoriesList',
            },
            {
              text: 'Payment Groups',
              icon: 'fa-dollar-sign',
              route: 'adminPaymentGroupsList',
            },
            {
              text: 'Payment Periods',
              icon: 'far fa-calendar-alt',
              route: 'adminDiaryPayPeriodsList',
            },
            {
              text: 'Users',
              icon: 'fa-users',
              route: 'adminUsersList',
              roles: 'admin',
            },
          ],
        },
      ];
    },
  },
};
</script>

<style lang="scss">
</style>
