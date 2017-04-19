/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

// Browser dev server.  This config will be used with `webpack-dev-server`
// to enable hot-reloading.  Sourcemaps and full debugging is enabled.

// ----------------------
// IMPORTS

// NPM
import webpack from 'webpack';
import WebpackConfig from 'webpack-config';

// Local
import PATHS from '../../config/paths';

// ----------------------

// Host and port settings to spawn the dev server on
const HOST = 'localhost';
const PORT = 8080;
const LOCAL = `http://${HOST}:${PORT}`;

// CSS loader options.  We want local modules, for all imports to be
// recognised, and source maps enabled
const cssLoader = {
  loader: 'css-loader',
  query: {
    modules: true,
    importLoaders: 1,
    sourceMap: true,
  },
};

const sassLoader = {
  loader: 'sass-loader',
  options: {
    outputStyle: 'expanded',
    includePaths: [
      './node_modules',
    ],
    sourceMap: true,
  },
};

export default new WebpackConfig().extend({
  '[root]/browser.js': conf => {
    // Add `webpack-dev-server` polyfills needed to communicate with the browser

    conf.entry.browser.unshift(
      'react-hot-loader/patch',
      `webpack-dev-server/client?${LOCAL}`,
      'webpack/hot/only-dev-server',
    );

    // Add React-specific hot loading
    conf.module.loaders.find(l => l.test.toString() === /\.jsx?$/.toString())
      .loaders.unshift({
        loader: 'react-hot-loader/webpack',
      });

    return conf;
  },
}).merge({

  // Add source maps
  devtool: 'cheap-module-source-map',

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

    // We're using React Router for all routes, so redirect 404s
    // back to the webpack-dev-server bootstrap HTML
    historyApiFallback: {
      index: '/webpack.html',
    },

    // Displays neater and more compact statistics
    stats: {
      chunks: false,
      colors: true,
      errors: true,
      hash: true,
      performance: true,
      version: true,
      warnings: true,
    },
  },

  module: {
    loaders: [
      // .css processing.  In development, styles are bundled into the
      // resulting Javascript, instead of winding up in a separate file.
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          cssLoader,
          {
            loader: 'postcss-loader',
          },
        ],
      },
      // SASS processing.  Same as .css, but parsed through `node-sass` first
      {
        test: /\.s(a|c)ss$/,
        loaders: [
          'style-loader',
          cssLoader,
          'resolve-url-loader',
          sassLoader,
        ],
      },
      // LESS processing.  Parsed through `less-loader` first
      {
        test: /\.less$/,
        loaders: [
          'style-loader',
          cssLoader,
          'less-loader',
        ],
      },
    ],
  },

  // Extra output options, specific to the dev server -- source maps and
  // our public path
  output: {
    sourceMapFilename: '[file].map',
    publicPath: `${LOCAL}/`,
  },

  plugins: [
    new webpack.NamedModulesPlugin(),

    // Activate the hot-reloader, so changes can be pushed to the browser
    new webpack.HotModuleReplacementPlugin(),

    // Set NODE_ENV to 'development', in case we need verbose debug logs
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
  ],
});
