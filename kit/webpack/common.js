/* eslint-disable import/prefer-default-export */

export const css = {
  // CSS loader configuration -- plain CSS, SASS and LESS
  loaders: [
    {
      ext: 'css',
      use: [],
    },
    {
      ext: 's(c|a)ss',
      use: ['resolve-url-loader', 'sass-loader?sourceMap'],
    },
    {
      ext: 'less',
      use: ['less-loader'],
    },
  ],

  // Format for 'localised' CSS modules
  localIdentName: '[local]-[hash:base64]',

  // Return an array containing the module RegExp and css-loader config,
  // based on the original file extension
  getModuleRegExp(ext) {
    return [
      [`[^\\.global]\\.${ext}$`, { modules: true }],
      [`\\.global\\.${ext}$`, { modules: false }],
    ];
  },
};
