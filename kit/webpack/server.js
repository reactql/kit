/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

// ----------------------
// IMPORTS

import path from 'path';
import webpack from 'webpack';
import WebpackConfig from 'webpack-config';

// Plugin to allow us to exclude `node_modules` packages from the final
// bundle.  Since we'll be running `server.js` from Node, we'll have access
// to those modules locally and they don't need to wind up in the bundle file
import nodeModules from 'webpack-node-externals';

// Common config
import { css } from './common';

import PATHS from '../../config/paths';

// ----------------------

// Helper function to recursively filter through loaders, and apply the
// supplied function
function recursiveLoader(root = {}, func) {
  if (root.loaders) {
    root.loaders.forEach(l => recursiveLoader(l, func));
  }
  if (root.loader) return func(root);
  return false;
}

export default new WebpackConfig().extend({
  '[root]/base.js': conf => {
    // Prevent file emission, since the browser bundle will already have done it
    conf.module.loaders.forEach(loader => {
      recursiveLoader(loader, l => {
        if (l.loader === 'file-loader') {
          // eslint-disable-next-line
          l.query.emitFile = false;
        }
      });
    });

    // Optimise images
    conf.module.loaders.find(l => l.test.toString() === /\.(jpe?g|png|gif|svg)$/i.toString())
      .loaders.push({
        // `image-webpack-loader` is used on the server build even `emitFile`
        // on `fileLoader` disabled so that the correct hash can be generated.
        loader: 'image-webpack-loader',
        // workaround for https://github.com/tcoopman/image-webpack-loader/issues/88
        options: {},
      });

    return conf;
  },
}).merge({

  // Set the target to Node.js, since we'll be running the bundle on the server
  target: 'node',

  // Output to the `dist` folder
  output: {
    path: PATHS.dist,
    filename: 'server.js',
  },

  entry: {
    javascript: [
      // Server entry point
      path.join(PATHS.entry, 'server.js'),
    ],
  },

  // Make __dirname work properly
  node: {
    __dirname: true,
  },

  module: {
    loaders: [
      // CSS loaders
      ...(function* loadCss() {
        for (const loader of css.loaders) {
          // Iterate over CSS/SASS/LESS and yield local and global mod configs
          for (const mod of css.getModuleRegExp(loader.ext)) {
            yield {
              test: new RegExp(mod[0]),
              loader: [
                {
                  loader: 'css-loader/locals',
                  query: Object.assign({}, css.loaderDefaults, mod[1]),
                },
                'postcss-loader',
                ...loader.use,
              ],
            };
          }
        }
      }()),
      // .js(x) files can extend the `.babelrc` file at the root of the project
      // (which was used to spawn Webpack in the first place), because that's
      // exactly the same polyfill config we'll want to use for this bundle
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: [
            'react',
          ],
          plugins: [
            'transform-object-rest-spread',
            'syntax-dynamic-import',
            'transform-class-properties',
            'transform-decorators-legacy',
          ],
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      // We're running on the Node.js server, so set `SERVER` to true
      SERVER: true,

      // React constantly checking process.env.NODE_ENV causes massive
      // slowdowns during rendering. Replacing process.env.NODE_ENV
      // with a string not only removes this expensive check, it allows
      // a minifier to remove all of React's warnings in production.
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
  ],
  // No need to transpile `node_modules` files, since they'll obviously
  // still be available to Node.js when we run the resulting `server.js` entry
  externals: nodeModules(),
});
