/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

// Server-side bundle for development.  Just like the production bundle, this
// runs on localhost:4000 by default, with two differences;
//
// 1) No files are emitted. This bundle runs in memory.
// 2) The server is re-bundled / re-started on every code change.

// ----------------------
// IMPORTS

/* Node */
import path from 'path';
import childProcess from 'child_process';

/* NPM */

import webpack from 'webpack';
import WebpackConfig from 'webpack-config';

// In dev, we inlined stylesheets inside our JS bundles.  Now that we're
// building for production, we'll extract them out into a separate .css file
// that can be called from our final HTML.  This plugin does the heavy lifting
import ExtractTextPlugin from 'extract-text-webpack-plugin';

// Copy files from `PATH.static` to `PATHS.distDev`
import CopyWebpackPlugin from 'copy-webpack-plugin';

/* Local */
import { css } from './common';
import PATHS from '../../config/paths';

// ----------------------

// Simple Webpack plugin for (re)spawning the development server after
// every build
class ServerDevPlugin {
  apply(compiler) {
    compiler.plugin('done', () => {
      if (this.server) this.server.kill();
      this.server = childProcess.fork(path.resolve(PATHS.dist, 'server_dev.js'), {
        cwd: PATHS.dist,
        silent: false,
        execArgv: ['--inspect'],
      });
    });
  }
}

const extractCSS = new ExtractTextPlugin({
  filename: 'assets/css/style.css',
  allChunks: true,
});

export default [
  // Server bundle
  new WebpackConfig().extend('[root]/dev.js', '[root]/server.js').merge({
    watch: true,
    stats: 'none',

    // Production server entry point
    entry: {
      javascript: [
        path.resolve(PATHS.entry, 'server_dev.js'),
      ],
    },

    // Output to the `dist` folder
    output: {
      path: PATHS.dist,
      filename: 'server_dev.js',
    },

    plugins: [
      new webpack.DefinePlugin({
        // We ARE running on the server
        SERVER: true,
        'process.env': {
          // Point the server host/port to the production server
          HOST: JSON.stringify(process.env.HOST || 'localhost'),
          PORT: JSON.stringify(process.env.PORT || '8081'),
          SSL_PORT: process.env.SSL_PORT ? JSON.stringify(process.env.SSL_PORT) : null,

          // Debug development
          NODE_ENV: JSON.stringify('development'),
          DEBUG: true,
        },
      }),

      // Start the development server
      new ServerDevPlugin(),
    ],
  }),

  // Browser bundle
  new WebpackConfig().extend('[root]/dev.js', '[root]/browser.js').merge({
    watch: true,
    stats: 'none',

    output: {
      path: PATHS.distDev,
      filename: '[name].js',
    },

    module: {
      rules: [
        // CSS loaders
        ...css.getExtractCSSLoaders(extractCSS, true /* sourceMaps = true */),
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        // We're not running on the server
        SERVER: false,
        'process.env': {
          // Point the server host/port to the dev server
          HOST: JSON.stringify(process.env.HOST || 'localhost'),
          PORT: JSON.stringify(process.env.PORT || '8081'),
          SSL_PORT: process.env.SSL_PORT ? JSON.stringify(process.env.SSL_PORT) : null,

          // Debug development
          NODE_ENV: JSON.stringify('development'),
          DEBUG: true,
        },
      }),

      // Check for errors, and refuse to emit anything with issues
      new webpack.NoEmitOnErrorsPlugin(),

      // Fire up CSS extraction
      extractCSS,

      // Copy files from `PATHS.static` to `dist/dev`.  No transformations
      // will be performed on the files-- they'll be copied as-is
      new CopyWebpackPlugin([
        {
          from: PATHS.static,
          force: true, // This flag forces overwrites between versions
        },
      ]),
    ],
  }),
];
