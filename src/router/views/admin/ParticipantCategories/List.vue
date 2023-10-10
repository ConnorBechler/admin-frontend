<template>
  <v-container fluid>
    <v-row justify="center" align="center" class="available-participantCategories">
      <v-col cols="12" sm="10">
        <v-data-table
          :headers="[
            {text: 'Name', value: 'name'},
            {text: 'Short', value: 'shortName'},
            {text: 'Active?', value: 'active', width: '55px', align: 'left', sortable: false},
            {text: '', value: 'actions', align: 'end', sortable: false},
            {text: '', value: 'hidden', width: '5%', align: ($vuetify.breakpoint.smAndDown || !showHiddenParticipantCategories) ? ' d-none' : '', sortable: false},
          ]"
          :items="participantCategories"
          :items-per-page="25"
          :footer-props="{
            itemsPerPageOptions: [5,10,25,50,-1],
          }"
          :loading="isFindParticipantCategoriesPending"
          :search="localSearch"
          :multi-sort="true"
          :hide-default-header="participantCategories.length === 0"
          class="elevation-1">
          <template v-slot:progress>
            <v-progress-linear indeterminate color="msu"></v-progress-linear>
          </template>
          <template v-slot:top>
            <ValidationObserver ref="editorObserver" v-slot="{ invalid }">
              <v-toolbar flat class="msu dark-grey text-center white--text">
                <v-toolbar-title>
                  <h3>Participant Categories</h3>
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
                          <v-icon class="white--text">fa-users</v-icon>
                        </v-card-title>
                        <v-card-text>
                          <v-container>
                            <EditorParticipantCategory
                              :clone="clone"
                              :isDirty="isDirty"
                              :allowDelete="false"
                              :showControls="false"
                              :standalone="true">
                            </EditorParticipantCategory>
                          </v-container>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn @click="reset(); clearObjDialog();">Cancel</v-btn>
                          <v-btn color="msu accent-green white--text" :disabled="invalid" @click="save().then(clearObjDialog);">Save</v-btn>
                        </v-card-actions>
                      </v-card>
                    </template>
                  </FeathersVuexFormWrapper>
                </v-dialog>
                <v-spacer></v-spacer>
                <v-icon class="white--text">
                  {{ showHiddenParticipantCategoriesIcon }}
                </v-icon>
                <v-switch
                  v-model="showHiddenParticipantCategories"
                  color="msu hover-1"
                  class="pt-5 mx-5">
                </v-switch>
              </v-toolbar>
            </ValidationObserver>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon
              v-if="hasRole('admin')"
              small
              class="mr-5"
              color="msu"
              @click="editObj(item)">
              fa-pencil-alt
            </v-icon>
            <v-icon
              v-if="hasRole('admin')"
              small
              class="mr-5"
              color="red"
              @click="removeObj(item)">
              fa-trash
            </v-icon>
          </template>
          <template v-slot:footer v-if="hasRole('admin')">
            <v-col cols="12" class="text-center">
              <v-btn type="button" small class="add-row" @click="addObj">
                Add Participant Category
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
          <template v-slot:item.hidden="{ item }">
            <v-icon small class="black--text">
              {{ (item.hidden || !item.active) ? 'fa-eye-slash' : '' }}
            </v-icon>
          </template>
          <template v-slot:no-data>
             No Participant Categories to show yet
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
    makeFindMixin({ service: 'participantCategories', watch: true }),
  ],
  page() {
    return {
      title: `Participant Categories | Admin | ${this.$appStrings('appName')}`,
      meta: [
        {
          name: 'description',
          content: 'Admin - Participant Category List',
        },
      ],
    };
  },
  data() {
    return {
      showEditor: false,
      showHiddenParticipantCategories: false,
      editedObj: new this.$FeathersVuex.api.ParticipantCategory(),
      editorTitle: '',
      localSearch: '',
    };
  },
  computed: {
    ...authComputed,
    ...userComputed,
    ...appComputed,
    participantCategoriesParams() {
      const query = { active: 1, hidden: 0, $sort: { name: 1 }, $limit: 99999 };
      if (this.showHiddenParticipantCategories) {
        delete query.active;
      }
      return { query };
    },
    showHiddenParticipantCategoriesIcon() {
      return (this.showHiddenParticipantCategories) ? 'fa-eye' : 'fa-eye-slash';
    },
  },
  methods: {
    addObj() {
      this.editorTitle = 'Add a Participant Category';
      this.editedObj = new this.$FeathersVuex.api.ParticipantCategory();
      this.showEditor = true;
    },
    editObj(obj) {
      this.editorTitle = 'Edit Participant Category';
      this.editedObj = obj;
      this.showEditor = true;
    },
    clearObjDialog() {
      this.showEditor = false;
      this.editorTitle = 'Add a Participant Category';
      this.editedObj = new this.$FeathersVuex.api.ParticipantCategory();
      this.$refs.editorObserver.reset();
    },
    removeObj(obj) {
      this.$confirm('Are you sure you want to delete this Participant Category?', 
        {
          title: 'Delete Participant Category',
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
    showHiddenParticipantCategories(val) {
      this.$store.dispatch('view/set', {
        showHiddenParticipantCategories: val
      }, { root: true });
    }
  },
  mounted() {
    this.showHiddenParticipantCategories = this.viewPreferences('showHiddenParticipantCategories');
  },
};
</script>
