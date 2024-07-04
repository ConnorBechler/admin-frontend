<template>
  <v-container fluid>
    <v-row justify="center" align="center" class="available-remoteWorkers">
      <v-col cols="12" sm="10">
        <v-data-table
          :headers="[
            {text: 'Name', value: 'name', width: '40%'},
            {text: 'Max', value: 'maxConcurrent', width: '15%'},
            {text: 'Enabled?', value: 'enabled', width: '10%', align: 'left', sortable: false},
            {text: '', value: 'copyKey', width: '5%', align: 'end', sortable: false},
            {text: '', value: 'actions', width: '20%', align: 'end', sortable: false},
          ]"
          :items="remoteWorkers"
          :items-per-page="25"
          :footer-props="{
            itemsPerPageOptions: [5,10,25,50,-1],
          }"
          :loading="isFindRemoteWorkersPending"
          :search="localSearch"
          :multi-sort="true"
          :hide-default-header="remoteWorkers.length === 0"
          class="elevation-1">
          <template v-slot:progress>
            <v-progress-linear indeterminate color="msu"></v-progress-linear>
          </template>
          <template v-slot:top>
            <ValidationObserver ref="editorObserver" v-slot="{ invalid, validate }">
              <v-toolbar flat class="msu dark-grey text-center white--text">
                <v-toolbar-title>
                  <h3>Remote Workers</h3>
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
                            <EditorRemoteWorker
                              :clone="clone"
                              :isDirty="isDirty"
                              :allowDelete="false"
                              :showControls="false"
                              :standalone="true">
                            </EditorRemoteWorker>
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
                  {{ showDisabledRemoteWorkersIcon }}
                </v-icon>
                <v-switch
                  v-model="showDisabledRemoteWorkers"
                  color="msu hover-1"
                  class="pt-5 mx-5">
                </v-switch>
              </v-toolbar>
            </ValidationObserver>
          </template>
          <template v-slot:item.copyKey="{ item }">
            <v-btn type="button" small v-clipboard="item.secret" @click="$store.dispatch('alert/display', { message: 'Copied!', timeout: 1000, icon: 'fa-smile' });">
              Copy Key
            </v-btn>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon
              v-if="hasRole('admin, researchManager')"
              small
              class="mr-5"
              color="msu"
              @click="editObj(item)">
              fa-pencil-alt
            </v-icon>
            <v-icon
              v-if="hasRole('admin, researchManager')"
              small
              class="mr-5"
              color="red"
              @click="removeObj(item)">
              fa-trash
            </v-icon>
          </template>
          <template v-slot:footer v-if="hasRole('admin, researchManager')">
            <v-col cols="12" class="text-center">
              <v-btn type="button" small class="add-row" @click="addObj">
                Add Remote Worker
              </v-btn>
            </v-col>
          </template>
          <template v-slot:item.enabled="{ item }">
            <FeathersVuexFormWrapper :item="item" :key="`${item.id}-enabled`" watch>
              <template v-slot="{ clone, save }">
                <v-checkbox
                  v-model="clone.enabled"
                  name="enabled"
                  dense
                  :readonly="!hasRole('admin, researchManager')"
                  :disabled="!hasRole('admin, researchManager')"
                  :hide-details="true"
                  @change="clone.commit(); save();"
                  class="ma-0">
                </v-checkbox>
              </template>
            </FeathersVuexFormWrapper>
          </template>
          <template v-slot:no-data>
             No enabled Remote Workers to show yet
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>

</template>

<script>
/* eslint-disable */
import { makeFindMixin, makeGetMixin } from 'feathers-vuex';
import { appComputed, authComputed, userComputed } from '@/store/helpers';


export default {
  mixins: [
    makeFindMixin({ service: 'remoteWorkers', watch: true }),
  ],
  page() {
    return {
      title: `Remote Workers | Admin | ${this.$appStrings('appName')}`,
      meta: [
        {
          name: 'description',
          content: 'Admin - Research - Remote Worker List',
        },
      ],
    };
  },
  data() {
    return {
      showEditor: false,
      showDisabledRemoteWorkers: false,
      editedObj: new this.$FeathersVuex.api.RemoteWorker(),
      editorTitle: '',
      localSearch: '',
    };
  },
  computed: {
    ...authComputed,
    ...userComputed,
    ...appComputed,
    remoteWorkersParams() {
      const query = { enabled: 1, hidden: 0, $sort: { name: 1 }, $limit: 99999 };
      if (this.showDisabledRemoteWorkers) {
        delete query.enabled;
      }
      return { query };
    },
    showDisabledRemoteWorkersIcon() {
      return (this.showDisabledRemoteWorkers) ? 'fa-eye' : 'fa-eye-slash';
    },
  },
  methods: {
    addObj() {
      this.editorTitle = 'Add a Remote Worker';
      this.editedObj = new this.$FeathersVuex.api.RemoteWorker();
      this.showEditor = true;
    },
    editObj(obj) {
      this.editorTitle = 'Edit Remote Worker';
      this.editedObj = obj;
      this.showEditor = true;
    },
    clearObjDialog() {
      this.showEditor = false;
      this.editorTitle = 'Add a Remote Worker';
      this.editedObj = new this.$FeathersVuex.api.RemoteWorker();
      this.$refs.editorObserver.reset();
    },
    removeObj(obj) {
      this.$confirm('Are you sure you want to delete this Remote Worker?', 
        {
          title: 'Delete Remote Worker',
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
    showDisabledRemoteWorkers(val) {
      this.$store.dispatch('view/set', {
        showDisabledRemoteWorkers: val
      }, { root: true });
    }
  },
  mounted() {
    this.showDisabledRemoteWorkers = this.viewPreferences('showDisabledRemoteWorkers');
  },
};
</script>
