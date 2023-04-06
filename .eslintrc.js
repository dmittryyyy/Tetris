module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 11,
    sourceType: 'module',
  },
  rules: {
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: true,
    }],
    'no-param-reassign': ['error', {
      props: false,
    }],
    'import/extensions': [1, 'never'],
    'import/no-dynamic-require': 0,
    'no-console': 0,
    'no-nested-ternary': 0,
    'no-plusplus': 0,
    'class-methods-use-this': 0,
    'default-case': 0,
  },
};
