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
  },
  plugins: [
    'babel',
    'import',
    'jsx-a11y',
    'compat',
  ],
  rules: {
    'arrow-parens': ['error', 'as-needed'],
    'react/forbid-prop-types': [1, { forbid: ['any']} ],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
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
    'linebreak-style': 0,
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'no-restricted-syntax': [2,
      ...restricted.filter(
        r => !['ForOfStatement'].includes(r.selector)
      ),
    ],
    'global-require': 0,
    'import/no-unresolved': [2, { commonjs: true }],
    'compat/compat': 2
  },
  settings: {
    'import/resolver': {
      node: {
        paths: [
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
