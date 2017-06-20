/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

// Browser dev server.  This config will be used with `webpack-dev-server`
// to enable hot-reloading.  Sourcemaps and full debugging is enabled.

// ----------------------
// IMPORTS

/* NPM */
import webpack from 'webpack';
import WebpackConfig from 'webpack-config';

// Chalk terminal library
import chalk from 'chalk';

/* Local */


// Import console messages
import { css, stats } from './common';
import { logServerStarted } from '../lib/console';

// Local environment
import { getHost, getPort, getURL } from '../lib/env';

// Locla paths
import PATHS from '../../config/paths';

// ----------------------

// Host and port settings to spawn the dev server on
const HOST = getHost();
const PORT = getPort();
const LOCAL = getURL();

export default new WebpackConfig().extend({
  '[root]/browser.js': conf => {
    // Add `webpack-dev-server` polyfills needed to communicate with the browser

    conf.entry.browser.unshift(
      'react-hot-loader/patch',
      `webpack-dev-server/client?${LOCAL}`,
      'webpack/hot/only-dev-server',
    );

    // Add React-specific hot loading
    conf.module.rules.find(l => l.test.toString() === /\.jsx?$/.toString())
      .use.unshift({
        loader: 'react-hot-loader/webpack',
      });

    return conf;
  },
}, '[root]/dev.js').merge({
  module: {
    rules: [
      // CSS loaders
      ...css.getDevLoaders(),
    ],
  },

  // Dev server configuration
  devServer: {

    // bind our dev server to the correct host and port
    host: HOST,
    port: PORT,

    // link HTTP -> app/public, so static assets are being pulled from
    // our source directory and not the `dist/public` we'd normally use in
    // production.  Use `PATH.views` as a secondary source, for serving
    // the /webpack.html fallback
    contentBase: [
      PATHS.static,
      PATHS.views,
    ],

    // Enables compression to better represent build sizes
    compress: true,

    // Assume app/public is the root of our dev server
    publicPath: '/',

    // Inline our code, so we wind up with one, giant bundle
    inline: true,

    // Hot reload FTW! Every change is pushed down to the browser
    // with no refreshes
    hot: true,

    // Disable build's information
    noInfo: false,

    // Show a full-screen overlay in the browser when there is a
    // compiler error
    overlay: true,

    // We're using React Router for all routes, so redirect 404s
    // back to the webpack-dev-server bootstrap HTML
    historyApiFallback: {
      index: '/webpack.html',
    },

    // Format output stats
    stats,
  },

  // Extra output options, specific to the dev server -- source maps and
  // our public path
  output: {
    publicPath: `${LOCAL}/`,
  },

  plugins: [
    // Log to console when `webpack-dev-server` has finished
    {
      apply(compiler) {
        compiler.plugin('done', () => {
          logServerStarted({
            type: 'hot-reloading browser',
            host: HOST,
            port: PORT,
            chalk: chalk.bgMagenta.white,
          });
        });
      },
    },

    new webpack.NamedModulesPlugin(),

    // Activate the hot-reloader, so changes can be pushed to the browser
    new webpack.HotModuleReplacementPlugin(),
  ],
});
