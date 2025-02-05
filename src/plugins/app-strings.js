import Vue from 'vue';
// lazy way to have app-wide string constants accessible
const appStrings = {
  appName: 'APP NAME',
  appUrl: 'https://your-actual-url-here',
  // this must match FORM_SECRET in backend .env
  formSecret: 'GenerateARealFormSecretAfterInstall',
  // for your sanity, make this match SUBJECT_PREFIX in backend .env
  subjectPrefix: 'VAN',
};

appStrings.install = () => {
  Vue.prototype.$appStrings = (key) => {
    return appStrings[key];
  };
};

Vue.use(appStrings);
