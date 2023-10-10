<template>
  <v-container fluid>
    <v-row justify="center" align="center" class="available-paymentGroups">
      <v-col cols="12" sm="10">
        <v-data-table
          :headers="[
            {text: 'Name', value: 'name'},
            {text: 'Short', value: 'shortName'},
            {text: 'Active?', value: 'active', width: '55px', align: 'left', sortable: false},
            {text: '', value: 'actions', align: 'end', sortable: false},
          ]"
          :items="paymentGroups"
          :items-per-page="25"
          :footer-props="{
            itemsPerPageOptions: [5,10,25,50,-1],
          }"
          :loading="isFindPaymentGroupsPending"
          :search="localSearch"
          :multi-sort="true"
          :hide-default-header="paymentGroups.length === 0"
          class="elevation-1">
          <template v-slot:progress>
            <v-progress-linear indeterminate color="msu"></v-progress-linear>
          </template>
          <template v-slot:top>
            <ValidationObserver ref="editorObserver" v-slot="{ invalid, validate }">
              <v-toolbar flat class="msu dark-grey text-center white--text">
                <v-toolbar-title>
                  <h3>Payment Groups</h3>
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
                            <EditorPaymentGroup
                              :clone="clone"
                              :isDirty="isDirty"
                              :allowDelete="false"
                              :showControls="false"
                              :standalone="true">
                            </EditorPaymentGroup>
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
                  {{ showHiddenPaymentGroupsIcon }}
                </v-icon>
                <v-switch
                  v-model="showHiddenPaymentGroups"
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
                Add Payment Group
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
          <template v-slot:no-data>
             No active Payment Groups to show yet
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
    makeFindMixin({ service: 'paymentGroups', watch: true }),
  ],
  page() {
    return {
      title: `Payment Groups | Admin | ${this.$appStrings('appName')}`,
      meta: [
        {
          name: 'description',
          content: 'Admin - Payment Group List',
        },
      ],
    };
  },
  data() {
    return {
      showEditor: false,
      showHiddenPaymentGroups: false,
      editedObj: new this.$FeathersVuex.api.PaymentGroup(),
      editorTitle: '',
      localSearch: '',
    };
  },
  computed: {
    ...authComputed,
    ...userComputed,
    ...appComputed,
    paymentGroupsParams() {
      const query = { active: 1, hidden: 0, $sort: { name: 1 }, $limit: 99999 };
      if (this.showHiddenPaymentGroups) {
        delete query.active;
      }
      return { query };
    },
    showHiddenPaymentGroupsIcon() {
      return (this.showHiddenPaymentGroups) ? 'fa-eye' : 'fa-eye-slash';
    },
  },
  methods: {
    addObj() {
      this.editorTitle = 'Add a Payment Group';
      this.editedObj = new this.$FeathersVuex.api.PaymentGroup();
      this.showEditor = true;
    },
    editObj(obj) {
      this.editorTitle = 'Edit Payment Group';
      this.editedObj = obj;
      this.showEditor = true;
    },
    clearObjDialog() {
      this.showEditor = false;
      this.editorTitle = 'Add a Payment Group';
      this.editedObj = new this.$FeathersVuex.api.PaymentGroup();
      this.$refs.editorObserver.reset();
    },
    removeObj(obj) {
      this.$confirm('Are you sure you want to delete this Payment Group?', 
        {
          title: 'Delete Payment Group',
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
    showHiddenPaymentGroups(val) {
      this.$store.dispatch('view/set', {
        showHiddenPaymentGroups: val
      }, { root: true });
    }
  },
  mounted() {
    this.showHiddenPaymentGroups = this.viewPreferences('showHiddenPaymentGroups');
  },
};
</script>
