<template>
  <span class="available-sentences">
    <v-row v-if="isFindTranscriptSentencesPending">
      Loading Sentences...
    </v-row>
    <v-row v-else>
      Loaded {{ transcriptSentences.length }} Sentences...
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-pagination
          v-model="currentPage"
          color="msu"
          :length="totalPages"
          :page="currentPage"
          :total-visible="10"
          @input="paginateSentences"
        ></v-pagination>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="1">
        Start
      </v-col>
      <v-col cols="1">
        Stop
      </v-col>
      <v-col cols="10">
        Sentence
      </v-col>
    </v-row>
    <v-row v-for="(sentence, sidx) in paginatedTranscriptSentences" :key="`${transcriptId}-sentence-${sidx}`">
      <v-col cols="1">
        <v-textarea
          v-model="sentence.startTime"
          dense
          rows="1"
          auto-grow
          disabled/>
      </v-col>
      <v-col cols="1">
        <v-textarea
          v-model="sentence.endTime"
          dense
          rows="1"
          auto-grow
          disabled/>
      </v-col>
      <v-col cols="10">
        <FeathersVuexInputWrapper :item="sentence" prop="content" style="width: 100%;" watch>
          <template #default="{ current, prop, createClone, handler }">
            <v-textarea
              v-model="current[prop]"
              dense
              auto-grow
              @focus="createClone"
              @change="e => handler(e, saveClone)"
              @keypress.enter="e => e.target.blur()"
              @keydown.escape="e => handler(e, resetClone)"
              rows="1"
            />
          </template>
        </FeathersVuexInputWrapper>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-pagination
          v-model="currentPage"
          color="msu"
          :length="totalPages"
          :page="currentPage"
          :total-visible="10"
          @input="paginateSentences"
        ></v-pagination>
      </v-col>
    </v-row>
  </span>
</template>

<script>
import { makeFindMixin } from 'feathers-vuex';
import feathersVuexFormHelpers from '@/mixins/feathersVuexFormHelpers';

export default {
  mixins: [
    makeFindMixin({ service: 'transcriptSentences', watch: true }),
    feathersVuexFormHelpers,
  ],
  props: {
    transcriptId: {
      type: String,
      default: null,
    },
    parentDisabled: {
      type: Boolean,
      default: false,
    },
    prependField: {
      type: String,
      default: '',
    },
    showControls: {
      type: Boolean,
      default: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    standalone: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentPage: 1,
      pageToOpen: 1,
      perPage: 10,
      skip: 0,
      paginatedTranscriptSentences: [],
    };
  },
  computed: {
    transcriptSentencesParams() {
      return { query: { transcriptionId: this.transcriptId } };
    },
    totalPages() {
      return this.transcriptSentences.length
        && (this.transcriptSentences.length > this.perPage)
        ? Math.ceil(this.transcriptSentences.length / this.perPage)
        : 1;
    },
    totalRecords() {
      return this.transcriptSentences.length;
    },
    start() {
      return (this.pageToOpen - 1) * this.perPage;
    },
    stop() {
      if ((this.transcriptSentences.length - this.start) >= this.perPage) {
        return (this.pageToOpen * this.perPage) - 1;
      } else {
        return this.transcriptSentences.length - 1;
      }
    },
    showNext() {
      return this.currentPage < this.totalPages;
    },
    showPrev() {
      return this.currentPage > 1;
    },
  },
  methods: {
    paginateSentences(page = 1) {
      this.paginatedTranscriptSentences = [];
      return new Promise((resolve) => {
        this.pageToOpen = page;
        for (let i = this.start; i <= this.stop; i += 1) {
          this.paginatedTranscriptSentences.push(this.transcriptSentences.sort((a, b) => { return a.startTime - b.startTime; })[i]);
        }
        resolve();
      })
        .then(() => {
          this.currentPage = this.pageToOpen;
        })
        .catch(() => {
          console.log('render err');
        });
    },
    saveClone({ clone }) {
      clone.commit();
      clone.save();
    },
    resetClone({ event, clone }) {
      clone.reset();
      event.target.blur();
    },
  },
  watch: {
    perPage() {
      this.paginateSentences(1);
    },
    totalRecords() {
      this.paginateSentences(this.currentPage);
    },
  },
};
</script>
