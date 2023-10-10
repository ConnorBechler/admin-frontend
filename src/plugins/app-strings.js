import Vue from 'vue';
// lazy way to have app-wide string constants accessible
const appStrings = {
  appName: 'APP NAME',
  // this must match FORM_SECRET in backend .env
  formSecret: 'GenerateARealFormSecretAfterInstall',
};

appStrings.install = () => {
  Vue.prototype.$appStrings = (key) => {
    return appStrings[key];
  };
};

Vue.use(appStrings);
