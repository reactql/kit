/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

// Generates a client-only bundle.  For times when you don't want a full
// web server, or you need to host a static site.

// ----------------------
// IMPORTS

// Path lib
import path from 'path';

// We'll use `webpack-config` to extend the base config we've already created
import WebpackConfig from 'webpack-config';

// HTML plugin, for generating a static index.html to serve from
import HtmlWebpackPlugin from 'html-webpack-plugin';

// Local
import PATHS from '../../config/paths';

// ----------------------

export default new WebpackConfig().extend('[root]/browser_prod.js').merge({
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(PATHS.views, 'browser.html'),
    }),
  ],
});
