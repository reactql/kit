/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

// Browser webpack config.  This will provide the foundation settings for
// configuring our source code to work in any modern browser

// ----------------------
// IMPORTS

/* Node */
import path from 'path';

/* NPM */
import webpack from 'webpack';
import WebpackConfig from 'webpack-config';

/* Local */

// Our local path configuration, so webpack knows where everything is/goes
import PATHS from '../../config/paths';

// ----------------------

// Extend the 'base' config
export default new WebpackConfig().extend('[root]/base.js').merge({

  // This is where webpack will start crunching our source code
  entry: {
    // Client specific source code.  This is the stuff we write.
    browser: [
      // Entry point for the browser
      path.join(PATHS.entry, 'browser.js'),
    ],
  },

  // Set-up some common mocks/polyfills for features available in node, so
  // the browser doesn't balk when it sees this stuff
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },

  // Modules specific to our browser bundle
  module: {
    rules: [
      // .js(x) loading
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            query: {
              // Ignore the .babelrc at the root of our project-- that's only
              // used to compile our webpack settings, NOT for bundling
              babelrc: false,
              presets: [
                ['env', {
                  // Enable tree-shaking by disabling commonJS transformation
                  modules: false,
                  // Exclude default regenerator-- we want to enable async/await
                  // so we'll do that with a dedicated plugin
                  exclude: ['transform-regenerator'],
                }],
                // Transpile JSX code
                'react',
              ],
              plugins: [
                'transform-object-rest-spread',
                'syntax-dynamic-import',
                'transform-regenerator',
                'transform-class-properties',
                'transform-decorators-legacy',
              ],
            },
          },
        ],
      },
    ],
  },

  plugins: [
    // Separate our third-party/vendor modules into a separate chunk, so that
    // we can load them independently of our app-specific code changes
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: module => (
        // this assumes your vendor imports exist in the node_modules directory
        module.context && module.context.indexOf('node_modules') !== -1
      ),
    }),
  ],
});
