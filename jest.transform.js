/* eslint-disable import/no-extraneous-dependencies */
const babel = require('babel-jest');

module.exports = babel.createTransformer({
  presets: [
    'react',
    ['env', {
      targets: {
        node: true,
      },
    }],
  ],
  plugins: [
    ['module-resolver', {
      root: ['.'],
      alias: {
        src: './src',
      },
    }],
    'transform-object-rest-spread',
    'syntax-dynamic-import',
    'transform-regenerator',
    'transform-class-properties',
    'transform-decorators-legacy',
  ],
});
