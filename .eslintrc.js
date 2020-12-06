/* eslint-env node */

module.exports = {
  plugins: [ 'metafizzy' ],
  extends: 'plugin:metafizzy/browser',
  env: {
    browser: true,
    commonjs: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  globals: {
    InfiniteScroll: 'readonly',
    QUnit: 'readonly',
    define: 'readonly',
  },
  rules: {
  },
};
