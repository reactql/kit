import { DllPlugin } from 'webpack';
import WebpackConfig from 'webpack-config';

// Local paths
import PATHS from '../../config/paths';

export default {
  entry: [
    // The more modules listed here the faster recompiling will be
    // Use the webpack bundle analyzer to determine the largest modules
    'apollo-client',
    'graphql',
    'history',
    'lodash',
    'prop-types',
    'react-redux',
    'react',
    'react-apollo',
    'react-dom',
    'react-router-dom',
    'redux',
    'seamless-immutable',
  ],
  output: {
    library: 'dll',
    path: PATHS.static,
    filename: 'vendor.js',
  },
  plugins: [
    new DllPlugin({
      name: 'dll',
      path: `${PATHS.webpack}/dll.json`,
    }),
  ],
};
