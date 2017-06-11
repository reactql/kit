<img src="https://reactql.org/reactql/logo.svg" alt="ReactQL" width="278" height="77" />

# Starter kit code (Javascript version)

React+GraphQL front-end starter kit. Universal: Browser + SSR.

[Typescript version](https://github.com/reactql/kit.ts) also available.

Want to install quickly? Use the [CLI](https://github.com/reactql/cli) - it does the heavy lifting for you.

## Features

### Stack

- [ReactQL CLI](https://github.com/reactql/cli) for quickly starting a new project
- [React](https://facebook.github.io/react/) for UI
- [Apollo Client (React)](http://dev.apollodata.com/react/) for GraphQL
- [React Router 4](https://github.com/ReactTraining/react-router/tree/v4) for declarative browser + server routes
- [Redux](http://redux.js.org/) for flux/store state management

### Server-side rendering

- Built-in [Koa 2](http://koajs.com/) web server, with async/await routing
- Full route-aware [server-side rendering (SSR)](https://reactql.org/docs/ssr) of initial HTML
- Universal building - both browser + Node.js web server
- HTTP header hardening with [Helmet for Koa](https://github.com/venables/koa-helmet)
- Declarative/dynamic `<head>` section, using [react-helmet](https://github.com/nfl/react-helmet)

### Real-time

- Dev + [React-compatible hot code reloading](http://gaearon.github.io/react-hot-loader/); zero refresh, real-time updates
- [Development web server](https://reactql.org/docs/setup#development) that automatically rebuilds and restarts on code changes, for on-the-fly SSR testing with full source maps


### Code optimisation

- [Webpack 2](https://webpack.js.org/), with [tree shaking](https://webpack.js.org/guides/tree-shaking/)
- Universal building - both browser + Node.js web server
- Easily extendable [webpack-config](https://fitbit.github.io/webpack-config/) files
- [Production bundling](https://reactql.org/docs/setup#production), for generating optimised server and client code
- [Static bundling mode](https://reactql.org/docs/setup#browser) for hosting your full app on any static host -- Github pages, S3, Netlify, etc 
- Separate local + vendor bundles, for better browser caching/faster builds
- Dynamic polyfills, courtesy of [babel-preset-env](https://github.com/babel/babel-preset-env)
- Aggressive code minification with [Uglify](https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin)
- [GIF/JPEG/PNG/SVG crunching](https://github.com/tcoopman/image-webpack-loader) for images
- [Static compression](https://webpack.js.org/plugins/compression-webpack-plugin/) using the [Zopfli Gzip](https://en.wikipedia.org/wiki/Zopfli) and [Brotli](https://opensource.googleblog.com/2015/09/introducing-brotli-new-compression.html) algorithms for the serving of static assets as pre-compressed `.gz` and `.br` files

### Styles

- [PostCSS v6](http://postcss.org/) with [next-gen CSS](http://cssnext.io/) and inline [@imports](https://github.com/postcss/postcss-import)
- [SASS](http://sass-lang.com) and [LESS](http://lesscss.org/) support (also parsed through PostCSS)

### Developer support

- [ESLint](http://eslint.org/)ing based on a tweaked [Airbnb style guide](https://github.com/airbnb/javascript)
- Tons of code commentary to fill you in on what's happening under the hood
- Extensive, up-to-date [online documentation](https://reactql.org/docs/)
- [Examples repository](https://github.com/reactql/examples), showing you how to add a GraphQL server, run without GraphQL, take advantage of Redux, etc.

## Usage

See the **[CLI tool](https://github.com/reactql/cli)** for easily deploying this starter kit on Mac, Windows or Linux.

### Complete documentation @ **https://reactql.org**
