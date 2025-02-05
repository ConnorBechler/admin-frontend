/* eslint-disable */
import Vue from 'vue';
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate';
import { required, email, min, min_value } from 'vee-validate/dist/rules';
import en from 'vee-validate/dist/locale/en';

extend('password', {
  validate: (value, { other }) => value === other,
  message: 'The entered passwords do not match.',
  params: [{ name: 'other', isTarget: true }],
});

extend('required', {
  ...required,
  message: '{_field_} is required.'
});

extend('date_format', {
  validate: (value) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(value)) {
      return false;
    }
    const date = new Date(value);
    const isValidDate = date instanceof Date && !isNaN(date);

    const [year, month, day] = value.split('-');
    const dateYear = date.getUTCFullYear().toString();
    const dateMonth = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const dateDay = date.getUTCDate().toString().padStart(2, '0');

    return isValidDate && year === dateYear && month === dateMonth && day === dateDay;
  },
  message: '{_field_} must be real and YYYY-MM-DD',
});

extend('requiredWhenNoSID', {
  ...required,
  message: '{_field_} is required without SID.'
});

extend('email', {
  ...email,
  message: 'Not a valid email address.'
});

extend('min', {
  ...min,
  message: en.messages['min']
});

extend('min_value', {
  ...min_value,
  message: en.messages['min_value']
});

extend('positive_value', {
  ...min_value,
  validate: (value ) => value >= 0,
  message: '{_field_} must be positive'
});

extend('emailConfirm', {
  validate: (value, { other }) => value === other,
  message: 'The email addresses do not match.',
  params: [{ name: 'other', isTarget: true }],
});

Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);
