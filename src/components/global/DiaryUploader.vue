<template>
  <span>
    <v-col cols="12">
      <v-menu
        ref="menu"
        v-model="menu"
        :close-on-content-click="false"
        :return-value.sync="selectedDate"
        transition="scale-transition"
        offset-y
        min-width="290px"
      >
        <template v-slot:activator="{ on }">
          <v-text-field
            v-model="selectedDate"
            label="Diary Date"
            readonly
            clearable
            prepend-icon="fa-calendar"
            v-on="on"
            hint="YYYY-MM-DD"
            :persistent-hint="true"
          ></v-text-field>
        </template>
        <v-date-picker
          ref="picker"
          v-model="selectedDate"
          color="msu"
        >
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="menu = false">Cancel</v-btn>
          <v-btn text color="primary" @click="updateDate(selectedDate)">OK</v-btn>
        </v-date-picker>
      </v-menu>
    </v-col>
    <v-col cols="12">
      <v-file-input :label="(multiple) ? 'Select file(s)' : 'Select a file'" v-model="fileList" :disabled="isUploading" ref="fileInput" name="file" :loading="isUploading" :multiple="multiple" chips></v-file-input>
    </v-col>
    <v-col cols="12" md="2" class="d-flex">
      <v-btn
        type="button"
        class="flex-grow-1"
        @click.stop="uploadFile"
        :disabled="!fileList || !selectedDate"
        :loading="isUploading"
        :color="fileUploadBtn.color">
        <v-icon v-if="fileUploadBtn.icon" color="white" v-text="fileUploadBtn.icon"></v-icon>
        {{ this.fileUploadBtn.text }}
        <span slot="loader">
          {{ uploadProgress }}%
        </span>
      </v-btn>
    </v-col>
  </span>
</template>

<script>
/* eslint-disable */
import axios from 'axios';
import { mapGetters, mapActions } from 'vuex';
import feathersVuexFormHelpers from '@/mixins/feathersVuexFormHelpers';

export default {
  mixins: [
    feathersVuexFormHelpers,
  ],
  props: {
    parentDisabled: {
      type: Boolean,
      default: false,
    },
    allowTypeChange: {
      type: Boolean,
      default: true,
    },
    profileId: {
      type: String,
      default: '',
    },
    documentTypeId: {
      type: String,
      default: '',
    },
    multiple: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isUploading: false,
      isCompleted: false,
      fileType: this.documentTypeId,
      uploadResponse: null,
      pendingUploadCount: 0,
      uploadProgress: 0,
      uploadProgressColor: 'msu accent-orange',
      fileList: null,
      fileUploadBtn: {
        text: 'Upload',
        color: 'msu lighten-1',
        icon: '',
      },
      selectedDate: null,
      menu: false,
    };
  },
  methods: {
    updateDate(date) {
      this.$refs.menu.save(date);
    },
    uploadFile() {
      if (this.fileList) {
        let formData = new FormData();
        this.fileList.forEach(file => {
          formData.append("files[]", file);
        })
        formData.append("secretKey", this.$appStrings('formSecret'));
        formData.append('profileId', this.profileId);
        formData.append('diaryDate', this.selectedDate);
        this.isUploading = true;
        axios.post('/api/documents', formData, {
          headers: {
            Authorization: this.$store.state.auth.accessToken,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: function(progressEvent) {
            this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          }.bind(this),
        })
        .then((resp) => {
          this.isCompleted = true;
          this.fileList = null;
          this.fileUploadBtn.text = '';
          this.fileUploadBtn.icon = 'fa-check-circle';
          this.uploadResponse = resp;
          this.uploadProgressColor = 'msu success-1';
        })
        .catch((err) => {
          this.uploadResponse = err;
          this.fileUploadBtn.text = '';
          this.fileUploadBtn.icon = 'fa-exclamation-circle';
        })
        .finally(() => {
          this.isUploading = false;
          setTimeout(() => {
            this.fileUploadBtn.text = 'Upload';
            this.fileUploadBtn.icon = '';
            this.uploadProgress = 0;
            this.uploadProgressColor = 'msu accent-orange';
            Promise.resolve(true);
          }, 1500);
        });
      }
    },
  },
};
</script>
