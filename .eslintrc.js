module.exports = {
  root: true,
  env: {
    node: true,
  },
  plugins: [
    'vuetify',
  ],
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'off' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'max-len': 'off',
    'prefer-template': 'off',
    'consistent-return': 'off',
    'vuetify/no-deprecated-classes': 'error',
    'vuetify/grid-unknown-attributes': 'error',
    'vuetify/no-legacy-grid': 'error',
    'arrow-body-style': 'off',
    'no-useless-constructor': 'off',
    'no-unused-expressions': 'off',
    'no-else-return': 'off',
    'no-return-assign': 'off',
    'no-param-reassign': 'off',
    indent: [
      'error', 2,
      { ignoredNodes: ['TemplateLiteral'] },
    ],
    'template-curly-spacing': 'off',
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
