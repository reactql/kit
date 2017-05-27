/* eslint-disable import/no-dynamic-require, no-console */

// Webpack entry point.  Note the .babel.js extension-- this will be parsed
// through babel, using the `.babelrc` settings to transpile to your current
// version of Node

// ----------------------
// IMPORTS

/* Node */
import path from 'path';

// FitBit's [webpack-config](https://fitbit.github.io/webpack-config/) lib for
// breaking down complex configurations into multiple files for easier
// extensibility
import Config, { environment } from 'webpack-config';

// Project paths configuration
import PATHS from './config/paths';

// ----------------------

// Helper function that'll take the name of the config file, and throw back an
// array of Webpack objects to use for the final config
function load(file) {
  // Resolve the config file
  let wp;

  try {
    wp = require(path.resolve(PATHS.webpack, file)).default;
  } catch (e) {
    console.error(`Error: ${file}.js not found or has errors:`);
    console.error(e);
    process.exit();
  }

  // If the config isn't already an array, add it to a new one, map over each
  // `webpack-config`, and create a 'regular' Webpack-compatible object
  return (Array.isArray(wp) ? wp : [wp]).map(config => (
    new Config().merge(config).toObject()
  ));
}

// Set the 'root' path to the 'webpack' dir in this folder
environment.setAll({
  root: () => PATHS.webpack,
});

// Spawning webpack will be done through an `npm run ...` command, so we'll
// map those npm options here to know which webpack config file to use
const toExport = [];

for (const build of (process.env.WEBPACK_CONFIG || '').trim().split(',')) {
  // Unwind the array into the final export
  if (build) toExport.push(...load(build));
}

// If we don't have any configs to export, yell!
if (!toExport.length) {
  console.error('Error: WEBPACK_CONFIG files not given');
  process.exit();
}

export default toExport;
