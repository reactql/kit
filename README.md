<img src="https://reactql.org/reactql/logo.svg" alt="ReactQL" width="278" height="77" />

![Travis](https://api.travis-ci.org/reactql/kit.svg?branch=master) ![npm](https://img.shields.io/npm/dt/reactql.svg?style=flat-square) ![license](https://img.shields.io/github/license/reactql/kit.svg?style=flat-square)

# Isomorphic starter kit code (written in ES6)

React+GraphQL front-end starter kit. Universal: Browser + SSR.

Want to install quickly? Use the [CLI](https://github.com/reactql/cli) - it does the heavy lifting for you.

## Features

### Stack

- [ReactQL CLI](https://github.com/reactql/cli) for quickly starting a new project
- [React v15](https://facebook.github.io/react/) for UI
- [Apollo Client (React)](http://dev.apollodata.com/react/) for GraphQL
- [React Router 4](https://github.com/ReactTraining/react-router/tree/v4) for declarative browser + server routes
- [Redux](http://redux.js.org/) for flux/store state management

### Server-side rendering

- Built-in [Koa 2](http://koajs.com/) web server, with async/await routing
- Full route-aware [server-side rendering (SSR)](https://reactql.org/docs/ssr) of initial HTML
- Universal building - both browser + Node.js web server compile down to static, runnable files
- HTTP header hardening with [Helmet for Koa](https://github.com/venables/koa-helmet)
- Declarative/dynamic `<head>` section, using [react-helmet](https://github.com/nfl/react-helmet)

### Real-time

- [Hot code reloading](http://gaearon.github.io/react-hot-loader/); zero refresh, real-time updates in development (that preserves React + Redux state)
- [Development web server](https://reactql.org/docs/setup#development) that automatically rebuilds and restarts on code changes, for on-the-fly SSR testing with full source maps


### Code optimisation

- [Webpack v3](https://webpack.js.org/), with [tree shaking](https://webpack.js.org/guides/tree-shaking/)
- Universal building - both browser + Node.js web server
- Easily extendable [webpack-config](https://fitbit.github.io/webpack-config/) files
- Separate local + vendor bundles, for better browser caching/faster builds
- Dynamic polyfills, courtesy of [babel-preset-env](https://github.com/babel/babel-preset-env)
- Aggressive code minification with [Uglify](https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin)
- [GIF/JPEG/PNG/SVG crunching](https://github.com/tcoopman/image-webpack-loader) for images

### Styles

- [PostCSS v6](http://postcss.org/) with [next-gen CSS](http://cssnext.io/) and inline [@imports](https://github.com/postcss/postcss-import)
- [SASS](http://sass-lang.com) and [LESS](http://lesscss.org/) support (also parsed through PostCSS)

### Production-ready

- [Production bundling](https://reactql.org/docs/bundling/production), that generates optimised server and client code
- [Static bundling mode](https://reactql.org/docs/bundling/static) for hosting your full app on any static host -- Github pages, S3, Netlify, etc
- [Static compression](https://webpack.js.org/plugins/compression-webpack-plugin/) using the [Zopfli Gzip](https://en.wikipedia.org/wiki/Zopfli) and [Brotli](https://opensource.googleblog.com/2015/09/introducing-brotli-new-compression.html) algorithms for the serving of static assets as pre-compressed `.gz` and `.br` files (default `vendor.js.bz` goes from 380kb -> 89kb!)
- [Docker](https://www.docker.com/) support, out-the-box

### Developer support

- [ESLint v3](http://eslint.org/)ing based on a tweaked [Airbnb style guide](https://github.com/airbnb/javascript)
- [Jest](https://facebook.github.io/jest/) test runner
- [Node Inspector](https://nodejs.org/en/docs/inspector/) support for SSR in dev mode - remotely debug the server, set breakpoints, inspect the stack from within Chrome
- Tons of code commentary to fill you in on what's happening under the hood
- Extensive, up-to-date [online documentation](https://reactql.org/docs/)
- [Examples repository](https://github.com/reactql/examples), with real-world use cases

## Usage

See the **[CLI tool](https://github.com/reactql/cli)** for easily deploying this starter kit on Mac, Windows or Linux.

Then run `npm start` in the project root, and away you go!

## Docker

A [Dockerfile](https://github.com/reactql/kit/blob/master/Dockerfile) is included, that will build, optimise and bundle a production-mode ReactQL web server, your static assets and client-side code -- making it trivial to deploy to production.

Build as normal with:

`docker build . -t <project>`

Then run with:

`docker run -p 4000:4000 <project>`

Navigating to http://<docker_host>:4000 will yield the ReactQL project code.

### Complete documentation @ **https://reactql.org**

# New to GraphQL?

Watch my free [45 minute YouTube video](https://www.youtube.com/watch?v=DNPVqK_woRQ), for a live coding walk-through of putting together a GraphQL server with a database. Learn how to write queries, mutations and handle nested/related data.

If you want to build your own GraphQL server, check out the [GraphQL Server repo](https://github.com/reactql/examples/tree/master/graphql-server) in [examples](https://github.com/reactql/examples).
