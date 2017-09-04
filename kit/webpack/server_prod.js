/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

// Server-side production web server.  Generates a `dist/server.js` file that
// can be run with `npm run server`

// ----------------------
// IMPORTS

import path from 'path';
import webpack from 'webpack';

// We'll use `webpack-config` to extend the base config we've already created
import WebpackConfig from 'webpack-config';

// Chalk library for adding color to console messages
import chalk from 'chalk';

/* Local */
import { webpackProgress } from './common';
import PATHS from '../../config/paths';

// ----------------------

export default new WebpackConfig().extend({
  '[root]/server.js': conf => {
    // Optimise images
    conf.module.rules.find(l => l.test.toString() === /\.(jpe?g|png|gif|svg)$/i.toString())
      .use.push({
        // `image-webpack-loader` is used on the server build even with `emitFile`
        // on `fileLoader` disabled so that the correct hash can be generated.
        loader: 'image-webpack-loader',
        // workaround for https://github.com/tcoopman/image-webpack-loader/issues/88
        options: {},
      });
    return conf;
  },
}).merge({

  stats: 'minimal',

  // Production server entry point
  entry: {
    javascript: [
      path.resolve(PATHS.entry, 'server_prod.js'),
    ],
  },

  // Output to the `dist` folder
  output: {
    path: PATHS.dist,
    filename: 'server.js',
  },

  plugins: [
    webpackProgress(
      `${chalk.magenta.bold('ReactQL server bundle')} in ${chalk.bgMagenta.white.bold('production mode')}`,
    ),

    // Global variables
    new webpack.DefinePlugin({
      // We ARE running on the server
      SERVER: true,
      'process.env': {
        // Point the server host/port to the dev server
        HOST: JSON.stringify(process.env.HOST || 'localhost'),
        PORT: JSON.stringify(process.env.PORT || '4000'),
        SSL_PORT: process.env.SSL_PORT ? JSON.stringify(process.env.SSL_PORT) : null,

        // React constantly checking process.env.NODE_ENV causes massive
        // slowdowns during rendering. Replacing process.env.NODE_ENV
        // with a string not only removes this expensive check, it allows
        // a minifier to remove all of React's warnings in production.
        NODE_ENV: JSON.stringify('production'),
        DEBUG: false,
      },
    }),
  ],
});
