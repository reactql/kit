/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

// This config generates a production-grade browser bundle.  It minifies and
// optimises all Javascript source code, and extracts and processes CSS before
// dumping it in a finished `styles.css` file in the `dist` folder

// ----------------------
// IMPORTS

import { join } from 'path';

import webpack from 'webpack';
import WebpackConfig from 'webpack-config';

// In dev, we inlined stylesheets inside our JS bundles.  Now that we're
// building for production, we'll extract them out into a separate .css file
// that can be called from our final HTML.  This plugin does the heavy lifting
import ExtractTextPlugin from 'extract-text-webpack-plugin';

// Compression plugin for generating `.gz` static files
import CompressionPlugin from 'compression-webpack-plugin';

// Chunk Manifest plugin for generating a chunk asset manifest
import ChunkManifestPlugin from 'chunk-manifest-webpack-plugin';

// Plugin for computing chunk hash
import WebpackChunkHash from 'webpack-chunk-hash';

// Manifest plugin for generating an asset manifest
import ManifestPlugin from 'webpack-manifest-plugin';

// Bundle Analyzer plugin for viewing interactive treemap of bundle
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

// Copy files from `PATH.static` to `PATHS.public`
import CopyWebpackPlugin from 'copy-webpack-plugin';

// Common config
import { css } from './common';

// Our local path configuration, so webpack knows where everything is/goes
import PATHS from '../../config/paths';

// Project configuration to control build settings
import { BUNDLE_ANALYZER } from '../../config/project';

// ----------------------

// The final CSS file will wind up in `dist/public/assets/css/style.[contenthash].css`

const extractCSS = new ExtractTextPlugin({
  filename: 'assets/css/style.[contenthash].css',
  allChunks: true,
});

// Extend the `browser.js` config
export default new WebpackConfig().extend({
  '[root]/browser.js': config => {
    // Optimise images
    config.module.loaders.find(l => l.test.toString() === /\.(jpe?g|png|gif|svg)$/i.toString())
      .loaders.push({
        loader: 'image-webpack-loader',
        // workaround for https://github.com/tcoopman/image-webpack-loader/issues/88
        options: {},
      });

    return config;
  },
}).merge({
  output: {
    // Filenames will be <name>.<chunkhas>.js in production on the browser
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js',
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
              loader: extractCSS.extract({
                use: [
                  {
                    loader: 'css-loader',
                    query: Object.assign({}, css.loaderDefaults, mod[1]),
                  },
                  'postcss-loader',
                  ...loader.use,
                ],
                fallback: 'style-loader',
              }),
            };
          }
        }
      }()),
    ],
  },
  // Minify, optimise
  plugins: [

    // Set NODE_ENV to 'production', so that React will minify our bundle
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),

    // Check for errors, and refuse to emit anything with issues
    new webpack.NoEmitOnErrorsPlugin(),

    // Minimize
    new webpack.optimize.UglifyJsPlugin({
      mangle: true,
      compress: {
        warnings: false, // Suppress uglification warnings
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        screw_ie8: true,
      },
      output: {
        comments: false,
      },
      exclude: [/\.min\.js$/gi], // skip pre-minified libs
    }),

    // Optimise chunk IDs
    new webpack.optimize.OccurrenceOrderPlugin(),

    // A plugin for a more aggressive chunk merging strategy
    new webpack.optimize.AggressiveMergingPlugin(),

    // Compress assets into .gz files, so that our Koa static handler can
    // serve those instead of the full-sized version
    new CompressionPlugin({
      // Overwrite the default 80% compression-- anything is better than
      // nothing
      minRatio: 0.99,
    }),

    // Fire up CSS extraction
    extractCSS,

    // Extract webpack bootstrap logic into a separate file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity,
    }),

    // Map hash to module id
    new webpack.HashedModuleIdsPlugin(),

    // Compute chunk hash
    new WebpackChunkHash(),

    // Generate chunk manifest
    new ChunkManifestPlugin({
      // Put this in `dist` rather than `dist/public`
      filename: '../chunk-manifest.json',
      manifestVariable: 'webpackManifest',
    }),

    // Generate assets manifest
    new ManifestPlugin({
      // Put this in `dist` rather than `dist/public`
      fileName: '../manifest.json',
      // Prefix assets with '/' so that they can be referenced from any route
      publicPath: '/',
    }),

    // Output interactive bundle report
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: join(PATHS.dist, 'report.html'),
      openAnalyzer: BUNDLE_ANALYZER.openAnalyzer,
    }),

    // Copy files from `PATHS.static` to `dist/public`.  No transformations
    // will be performed on the files-- they'll be copied as-is
    new CopyWebpackPlugin([
      {
        from: PATHS.static,
        force: true, // This flag forces overwrites between versions
      },
    ]),
  ],
});
