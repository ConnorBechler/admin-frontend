import Vue from 'vue';
// lazy way to have app-wide string constants accessible
const appStrings = {
  appName: 'Berkeley Language Diaries',
  appUrl: 'https://berkeley-language-diaries.berkeley.edu',
  // this must match FORM_SECRET in backend .env
  formSecret: 'GenerateARealFormSecretAfterInstall',
  // for your sanity, make this match SUBJECT_PREFIX in backend .env
  subjectPrefix: 'BLD',
};

appStrings.install = () => {
  Vue.prototype.$appStrings = (key) => {
    return appStrings[key];
  };
};

Vue.use(appStrings);
