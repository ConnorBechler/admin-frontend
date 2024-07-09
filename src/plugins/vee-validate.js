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
