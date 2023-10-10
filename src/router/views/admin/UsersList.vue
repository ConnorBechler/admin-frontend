<template>
  <v-container fluid>
    <v-row justify="center" align="center" class="available-users">
      <v-col cols="12" sm="10">
        <v-data-table
          :headers="[
            {text: 'Last', value: 'last', width: '25%'},
            {text: 'First', value: 'first', width: '20%'},
            {text: 'Email', value: 'email', width: '20%'},
            {text: 'Role', value: 'roles', width: '15%'},
            {text: '', value: 'actions', align: 'end'},
            {text: '', value: 'active', width: '5%', align: ($vuetify.breakpoint.smAndDown || !showHiddenUsers) ? ' d-none' : 'end'},
          ]"
          :items="users"
          :items-per-page="25"
          :footer-props="{
            itemsPerPageOptions: [5,10,25,50,-1],
          }"
          :loading="isFindUsersPending"
          :search="localSearch"
          :multi-sort="true"
          :hide-default-header="users.length === 0"
          :fixed-header="true"
          class="elevation-1">
          <template v-slot:progress>
            <v-progress-linear indeterminate color="msu"></v-progress-linear>
          </template>
          <template v-slot:top>
            <ValidationObserver ref="editorObserver" v-slot="{ invalid }">
              <v-toolbar flat class="msu dark-grey text-center white--text">
                <v-toolbar-title>
                  <h3>Users</h3>
                </v-toolbar-title>
                <v-text-field
                  v-model="localSearch"
                  label="Search"
                  solo
                  dense
                  class="mt-7 mx-4"
                ></v-text-field>
                <v-spacer></v-spacer>
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
                          <v-icon class="white--text">fa-user</v-icon>
                        </v-card-title>
                        <v-card-text>
                          <v-container>
                            <EditorUser
                              :clone="clone"
                              :isDirty="isDirty"
                              :allowDelete="false"
                              :showProfile="true"
                              :showControls="false"
                              :standalone="true"
                              :selfDisabled="clone.id === user.id || !isAdmin">
                            </EditorUser>
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
                <v-icon class="white--text ml-5">
                  {{ showHiddenUsersIcon }}
                </v-icon>
                <v-switch
                  v-model="showHiddenUsers"
                  color="msu accent-green"
                  class="pt-5 mx-5">
                </v-switch>
              </v-toolbar>
            </ValidationObserver>
          </template>
          <template v-slot:item.roles="{ item }">
            <span>
              {{ formatRoles(item.roles) }}
            </span>
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
                Add User
              </v-btn>
            </v-col>
          </template>
          <template v-slot:item.active="{ item }">
            <v-icon small class="black--text">
              {{ (item.hidden || !item.active) ? 'fa-eye-slash' : '' }}
            </v-icon>
          </template>
          <template v-slot:no-data>
             No users to show yet
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
    makeFindMixin({ service: 'users', watch: true }),
  ],
  page() {
    return {
      title: `Admin | Users | ${this.$appStrings('appName')}`,
      meta: [
        {
          name: 'description',
          content: 'Admin - User List',
        },
      ],
    };
  },
  data() {
    return {
      showEditor: false,
      showHiddenUsers: false,
      editedObj: new this.$FeathersVuex.api.User(),
      editorTitle: '',
      localSearch: '',
    };
  },
  computed: {
    ...authComputed,
    ...userComputed,
    ...appComputed,
    usersParams() {
      const query = { active: 1, hidden: 0, roles: { $nin: ['system'] }, $sort: { last: 1, first: 1 }, $limit: 99999 };
      if (this.showHiddenUsers) {
        delete query.hidden;
        delete query.active;
      }
      return { query };
    },
    showHiddenUsersIcon() {
      return (this.showHiddenUsers) ? 'fa-eye' : 'fa-eye-slash';
    },
  },
  methods: {
    formatRoles(roles) {
      let ret = [];
      if (roles.includes('admin')) {
        ret.push('Admin');
      }
      if (roles.includes('transcriptManager')) {
        ret.push('Transcript');
      }
      if (roles.includes('researchManager')) {
        ret.push('Research');
      }
      if (roles.includes('ra') || roles.includes('ga')) {
        ret.push('RA/GA');
      }
      if (roles.includes('user')) {
        ret.push('User');
      }
      return ret.join(', ');
    },
    addObj() {
      this.editorTitle = 'Add a User';
      this.editedObj = new this.$FeathersVuex.api.User();
      this.showEditor = true;
    },
    editObj(obj) {
      this.editorTitle = 'Edit User';
      this.editedObj = obj;
      this.showEditor = true;
    },
    clearObjDialog() {
      this.showEditor = false;
      this.editorTitle = 'Add a User';
      this.editedObj = new this.$FeathersVuex.api.User();
      this.$refs.editorObserver.reset();
    },
    removeObj(obj) {
      this.$confirm('Are you sure you want to delete this User?', 
        {
          title: 'Delete User',
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
    showHiddenUsers(val) {
      this.$store.dispatch('view/set', {
        showHiddenUsers: val
      }, { root: true });
    }
  },
  mounted() {
    this.showHiddenUsers = this.viewPreferences('showHiddenUsers');
  },
};
</script>
