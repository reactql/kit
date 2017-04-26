/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

// This is our base config file.  All of our configs will extend from this,
// so we'll define all the foundational stuff that applies to every build
// and add to it in other files

// ----------------------
// IMPORTS

// Webpack 2 is our bundler of choice.
import webpack from 'webpack';

// We'll use `webpack-config` to create a 'base' config that can be
// merged/extended from for further configs
import WebpackConfig from 'webpack-config';

// CopyWebpackPlugin will be used to get our external .css
import CopyWebpackPlugin from 'copy-webpack-plugin';

// HtmlWebpackPlugin will generate our HTML
import HtmlWebpackPlugin from 'html-webpack-plugin';

// HtmlWebpackIncludeAssetsPlugin will be used to prepend our external .css to our generated styles
import HtmlWebpackIncludeAssetsPlugin from 'html-webpack-include-assets-plugin';

// CSSNext is our postcss plugin of choice, that will allow us to use 'future'
// stylesheet syntax like it's available today.
import cssnext from 'postcss-cssnext';

// PostCSS filters
import postcssPartialImport from 'postcss-partial-import';
import postcssNested from 'postcss-nested';

// Show a nice little progress bar
import ProgressBarPlugin from 'progress-bar-webpack-plugin';

// Chalk lib, to add some multi-colour awesomeness to our progress messages
import chalk from 'chalk';

// Our local path configuration, so webpack knows where everything is/goes.
// Since we haven't yet established our module resolution paths, we have to
// use the full relative path
import PATHS from '../../config/paths';

// ----------------------

// Export a new 'base' config, which we can extend/merge from
export default new WebpackConfig().merge({

  // Javascript file extensions that webpack will resolve
  resolve: {
    // I tend to use .js exclusively, but .jsx is also allowed
    extensions: ['.js', '.jsx'],

    // When we do an `import x from 'x'`, webpack will first look in our
    // root folder to try to resolve the package this.  This allows us to
    // short-hand imports without knowing the full/relative path.  If it
    // doesn't find anything, then it'll check `node_modules` as normal
    modules: [
      PATHS.root,
      'node_modules',
    ],
  },

  // File type config and the loaders that will handle them.  This makes it
  // possible to do crazy things like `import css from './style.css'` and
  // actually get that stuff working in *Javascript* -- woot!
  module: {
    loaders: [
      // Html
      {
        test: /\.html$/,
        loader: 'html-loader'
      },

      // Fonts
      {
        test: /\.(woff|woff2|ttf|eot)$/i,
        loader: 'file-loader',
        query: {
          name: 'assets/fonts/[name].[hash].[ext]',
        },
      },

      // Images.  By default, we'll just use the file loader.  In production,
      // we'll also crunch the images first -- so let's set up `loaders` to
      // be an array to make extending this easier
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          {
            loader: 'file-loader',
            query: {
              name: 'assets/img/[name].[hash].[ext]',
            },
          },
        ],
      },
    ],
  },

  // Output settings.  Where our files will wind up, and what we consider
  // to be the root public path for dev-server.
  output: {

    // Our compiled bundles/static files will wind up in `dist`
    path: PATHS.public,

    // Deem the `dist` folder to be the root of our web server
    publicPath: '/',

    // Filenames will simply be <name>.js
    filename: '[name].js',
  },

  plugins: [
    // Progress bar + options
    new ProgressBarPlugin({
      format: ` ${chalk.magenta.bold('ReactQL')} building [:bar] ${chalk.green.bold(':percent')} (:elapsed seconds)`,
    }),

    new CopyWebpackPlugin([
      { from: 'node_modules/grommet/grommet.min.css', to: 'public/assets/css/'},
    ]),

    new HtmlWebpackPlugin({
      template: 'kit/views/webpack.html',
    }),

    new HtmlWebpackIncludeAssetsPlugin({
      assets: ['public/assets/css/grommet.min.css'],
      append: false,
    }),

    // Options that our module loaders will pull from
    new webpack.LoaderOptionsPlugin({

      // Switch loaders to `minimize mode` where possible
      minimize: true,

      // Turn off `debug mode` where possible
      debug: false,
      options: {

        // The 'context' that our loaders will use as the root folder
        context: PATHS.src,

        // PostCSS -- @import, cssnext
        postcss() {
          return {
            plugins: [
              // @import powers
              postcssPartialImport({
                dirs: [
                  PATHS.src,
                ],
              }),
              postcssNested(),
              // Use the default CSSNext settings
              cssnext(),
            ],
          };
        },

        // image-webpack-loader image crunching options
        imageWebpackLoader: {
          mozjpeg: {
            quality: 65,
          },
          pngquant: {
            quality: '65-90',
            speed: 4,
          },
          svgo: {
            plugins: [
              {
                removeViewBox: false,
              },
              {
                removeEmptyAttrs: false,
              },
            ],
          },
        },
      },
    }),
  ],
});
