const path = require('path');
const baseRules = require('eslint-config-airbnb-base/rules/style');
const [_, ...restricted] = baseRules.rules['no-restricted-syntax'];

const PATHS = require('./config/paths');

module.exports = {
  extends: 'airbnb',
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    jsx: true,
  },
  env: {
    node: true,
    browser: true,
    'jest/globals': true,
  },
  plugins: [
    'babel',
    'import',
    'jsx-a11y',
    'compat',
    'jest',
  ],
  rules: {
    // General
    'arrow-parens': ['error', 'as-needed'],
    'function-paren-newline': ["error", "consistent"],
    'object-curly-newline': ["error", { consistent: true }],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'linebreak-style': 0,
    'global-require': 0,
    'no-restricted-syntax': [2,
      ...restricted.filter(
        r => !['ForOfStatement'].includes(r.selector)
      ),
    ],

    // React
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'react/forbid-prop-types': [1, { forbid: ['any']} ],
    'react/prefer-stateless-function': [2, { ignorePureComponents: true }],
    'react/no-multi-comp': 0,
    'react/jsx-closing-bracket-location': [1, 'after-props'],
    'react/prop-types': [1, {
      ignore: [
        // `dispatch` is typically used by Redux `@connect`
        'dispatch',
        // `data` is injected by Apollo
        'data',
      ],
    }],

    // Import
    'import/no-unresolved': [2, { commonjs: true }],

    // Compat
    'compat/compat': 2,

    // JSX-a11y
    "jsx-a11y/anchor-is-valid": [ "error", {
      "components": [ "a" ],
      "aspects": [ "noHref", "invalidHref", "preferButton" ]
    }],
  },
  settings: {
    'import/resolver': {
      node: {
        paths: [
          PATHS.src,
          PATHS.root,
          'node_modules',
        ],
      },
    },
  },
  globals: {
    SERVER: false,
  },
};
