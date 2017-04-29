// Webpack entry point.  Note the .babel.js extension-- this will be parsed
// through babel, using the `.babelrc` settings to transpile to your current
// version of Node

// ----------------------
// IMPORTS

// FitBit's [webpack-config](https://fitbit.github.io/webpack-config/) lib for
// breaking down complex configurations into multiple files for easier
// extensibility
import Config, { environment } from 'webpack-config';

// Project paths configuration
import PATHS from './config/paths';

// ----------------------

// Helper function that'll take the name of the config file, and throw back a
// fully-formed object that webpack will take as the final config to bundle
function load(file) {
  return new Config().extend(`[root]/${file}.js`).toObject();
}

// Set the 'root' path to the 'webpack' dir in this folder
environment.setAll({
  root: () => PATHS.webpack,
});

// Spawning webpack will be done through an `npm run ...` command, so we'll
// map those npm options here to know which webpack config file to use
const toExport = [];

for (const build of (process.env.WEBPACK_CONFIG || '').trim().split(',')) {
  if (build) toExport.push(load(build));
}

if (!toExport.length) {
  // eslint-disable-next-line no-console
  console.error('Error: WEBPACK_CONFIG files not given');
  process.exit();
}

export default toExport;
