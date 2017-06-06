/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

// Development base config to extend from.

// ----------------------
// IMPORTS

/* NPM */
import webpack from 'webpack';
import WebpackConfig from 'webpack-config';

// ----------------------

export default new WebpackConfig().merge({
  // Add source maps
  devtool: 'source-map',

  plugins: [
    // Set NODE_ENV to 'development', in case we need verbose debug logs
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      DEBUG: true,
    }),
  ],
});
