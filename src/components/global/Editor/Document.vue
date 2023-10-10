<template>
  <v-row :class="{ disabled: clone.deletedAt }">
    <v-col cols="12" md="3" v-if="this.allowTypeChange">
      <v-autocomplete
        v-model="clone.documentTypeId"
        :id="`${clone.id || clone.__id}-documentTypeId`"
        :disabled="clone.deletedAt != null || parentDisabled"
        @change="(nested) ? stageClone(clone) : saveRow(clone)"
        :name="`document${index}-documentTypeId`"
        label="Change Document Type?"
        :items="documentTypes"
        item-value="id"
        item-text="name"
        dense
        outlined
        auto-select-first
        :menu-props="{ auto: true }"
        autocomplete="never">
      </v-autocomplete>
    </v-col>
    <v-col cols="12" :md="(this.allowTypeChange) ? 4 : 7">
      <v-text-field
        v-model="clone.description"
        :id="`${clone.id || clone.__id}-description`"
        :disabled="clone.deletedAt != null || parentDisabled"
        @change="(nested) ? stageClone(clone) : saveRow(clone)"
        :name="`document${index}-description`"
        :placeholder="(!clone.description) ? clone.originalname : ''"
        label="Add an easy File Description? (optional)"
        type="text">
      </v-text-field>
    </v-col>
    <v-col cols="3" md="2" v-if="clone.deletedAt === null">
      <v-btn
        class="controls-row"
        @click="downloadFile(clone.id)"
        :loading="isDownloading"
        :disabled="isDownloading || this.fileDownloadBtn.disabled || clone.deletedAt != null"
        :color="this.fileDownloadBtn.color">
        <v-icon v-if="this.fileDownloadBtn.icon" v-text="this.fileDownloadBtn.icon"></v-icon>
        <span v-else>{{ this.fileDownloadBtn.text }}</span>
      </v-btn>
    </v-col>
    <v-col :cols="(clone.deletedAt) ? 12 : 7" md="3" class="controls" v-if="showControls && !standalone">
      <v-btn type="button" class="remove-row warning red" @click="removeRow(clone)" v-if="!clone.deletedAt">
        <v-icon>fa-trash</v-icon>
      </v-btn>
      <span v-if="clone.deletedAt">
        <v-btn type="button" class="remove-row" @click="restoreRow(clone)">
          Restore
        </v-btn> |
        <v-btn type="button" class="remove-row" @click="deleteRow(clone)">
          Delete
        </v-btn>
      </span>
    </v-col>
    <v-col cols="6" md="3" class="controls" v-if="standalone">
      <v-btn type="button" class="controls-row" @click="saveRow(clone)" v-if="!clone.deletedAt">
        Save
      </v-btn>
      <v-btn type="button" class="controls-row" @click="cancelEdit(clone)" v-if="!clone.deletedAt">
        Cancel
      </v-btn>
      <v-btn type="button" class="controls-row" @click="removeRow(clone)" v-if="!clone.deletedAt && allowDelete">
        Remove
      </v-btn>
      <v-btn type="button" class="controls-row" @click="restoreRow(clone)" v-if="clone.deletedAt && allowDelete">
        Restore
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
/* eslint-disable */
import axios from 'axios';
import { mapGetters } from 'vuex';
import feathersVuexFormHelpers from '@/mixins/feathersVuexFormHelpers';

export default {
  mixins: [
    feathersVuexFormHelpers,
  ],
  props: {
    clone: Object,
    parentDisabled: {
      type: Boolean,
      default: false,
    },
    nested: {
      type: Boolean,
      default: false,
    },
    isDirty: Boolean,
    index: String,
    save: Function,
    reset: Function,
    remove: Function,
    showControls: {
      type: Boolean,
      default: true,
    },
    standalone: {
      type: Boolean,
      default: false,
    },
    allowDelete: {
      type: Boolean,
      default: true,
    },
    allowTypeChange: {
      type: Boolean,
      default: true,
    },
    parentType: {
      type: String,
      default: 'diary',
    },
  },
  data() {
    return {
      isDownloading: false,
      isCompleted: false,
      fileDownloadBtn: {
        text: 'Download',
        color: 'msu light-grey',
        icon: 'fa-cloud-download-alt',
        disabled: false,
      },
    };
  },
  computed: {
    ...mapGetters('documentTypes', { findDocumentTypesInStore: 'find' }),
    documentTypes() {
      return this.findDocumentTypesInStore({ query: { $sort: { name: 1 } } }).data;
    },
  },
  methods: {
    downloadFile(id) {
      this.isCompleted = false;
      this.isDownloading = true;
      let uri = '/api/download/' + id;
      axios.get(uri, {
        headers: {
          Authorization: this.$store.state.auth.accessToken
        },
        responseType: 'arraybuffer',
      })
      .then((resp) => {
        this.isDownloading = false;
        this.fileDownloadBtn.text = '';
        this.fileDownloadBtn.icon = 'fa-check-circle';
        this.fileDownloadBtn.disabled = true;
        var blob = new Blob([resp.data],{type:resp.headers['content-type']});
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.target = "_blank"
        link.download = resp.headers['x-filename'];
        link.click();
      })
      .catch((err) => {
        console.log('err', err);
        this.fileDownloadBtn.text = '';
        this.fileDownloadBtn.icon = 'fa-exclamation-circle';
      })
      .finally(() => {
        setTimeout(() => {
          this.fileDownloadBtn.text = 'Download';
          this.fileDownloadBtn.icon = 'fa-cloud-download-alt';
          this.fileDownloadBtn.disabled = false;
          this.isCompleted = true;
          Promise.resolve(true);
        }, 2000);
      });
    },
  },
};
</script>
