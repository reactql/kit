/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

// Development base config to extend from.

// ----------------------
// IMPORTS

/* NPM */
import WebpackConfig from 'webpack-config';

// ----------------------

export default new WebpackConfig().merge({
  // Add source maps
  devtool: 'source-map',
});
