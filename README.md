<img src="https://reactql.org/reactql/logo.svg" alt="ReactQL" width="278" height="77" />

![Travis](https://api.travis-ci.org/reactql/kit.svg?branch=master) ![npm](https://img.shields.io/npm/dt/reactql.svg?style=flat-square) ![license](https://img.shields.io/github/license/reactql/kit.svg?style=flat-square) [![Twitter Follow](https://img.shields.io/twitter/follow/reactql.svg?style=social&label=Follow)](https://twitter.com/reactql)

# New in 2.x: Full-stack GraphQL + React v16 streaming API + SSL

Full-stack React + GraphQL, done properly.

Want to install quickly? Use the [CLI](https://github.com/reactql/cli) - it does the heavy lifting for you.

## Features

### Stack

- [ReactQL CLI](https://github.com/reactql/cli) for quickly starting a new project (or upgrading an existing one)
- New in 2.x: [React v16](https://facebook.github.io/react/) for UI
- New in 2.x: [Apollo Server](http://dev.apollodata.com/tools/) for enabling the built-in GraphQL server
- [Apollo Client (React)](http://dev.apollodata.com/react/) for connecting to GraphQL
- [React Router 4](https://github.com/ReactTraining/react-router/tree/v4) for declarative browser + server routes
- [Redux](http://redux.js.org/) for flux/store state management

### GraphQL

- New in 2.x: Built-in GraphQL server via - just pass in your schema, and enable `/graphql` with a single line of code
- [GraphiQL](https://github.com/graphql/graphiql) query browser enabled by default
- Isomorphic GraphQL client - await data via SSR before rendering HTML; query asynchronously in the browser
- Avoid network overhead with local GraphQL querying via [apollo-local-query](https://github.com/af/apollo-local-query)
- Write `.gql` GraphQL query files, use fragments, or type queries inline.

### Server-side rendering

- Built-in [Koa 2](http://koajs.com/) web server, with async/await routing
- React v16 with streaming API - time-to-first-byte as low as 4-5ms!
- Full route-aware [server-side rendering (SSR)](https://reactql.org/docs/ssr) of initial HTML
- Universal building - both browser + Node.js web server compile down to static files
- Per-request Redux stores. Store state is dehydrated via SSR, and rehydrated automatically on the client
- Declarative/dynamic `<head>` section, using [react-helmet](https://github.com/nfl/react-helmet)
- Full page React via built-in `<Html>` component - every byte of your HTML is React!
- Run plain HTTP and SSL from the same port - just `config.enableSSL(sslOptions)` in your app code

### Real-time

- [Hot code reloading](http://gaearon.github.io/react-hot-loader/); zero refresh, real-time updates in development
- React + Redux state preservation on hot reloading, to avoid interrupting your dev flow
- [Development web server](https://reactql.org/docs/setup#development) that automatically rebuilds and restarts on code changes, for on-the-fly SSR testing with full source maps
- Hot code reload works inside Docker too! Just `docker-compose -f docker-compose.dev.yml`

### Code optimisation

- [Webpack v3](https://webpack.js.org/), with [tree shaking](https://webpack.js.org/guides/tree-shaking/) -- dead code paths are automatically eliminated
- Separate local + vendor bundles, for better browser caching/faster builds
- Dynamic polyfills, courtesy of [babel-preset-env](https://github.com/babel/babel-preset-env)
- Aggressive code minification with [Uglify](https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin)
- [GIF/JPEG/PNG/SVG crunching](https://github.com/tcoopman/image-webpack-loader) for images in production
- CSS code is combined, minified and optimised automatically - even if you use SASS, LESS and CSS together!

### Styles

- [PostCSS v6](http://postcss.org/) with [next-gen CSS](http://cssnext.io/) and inline [@imports](https://github.com/postcss/postcss-import)
- [SASS](http://sass-lang.com) and [LESS](http://lesscss.org/) support (also parsed through PostCSS)
- Automatic vendor prefixing - write modern CSS, and let the compiler take care of browser compatibility
- Mix and match SASS, LESS and regular CSS - without conflicts!
- CSS modules - your classes are hashed automatically, to avoid namespace conflicts
- Compatible with Foundation, Bootstrap, Material and more. Simply configure via a `.global.*` import to preserve class names

### Highly configurable

- New in 2.x: Userland configuration.  No need to edit kit code; simply use the built-in `Config` singleton
- Add a GraphQL server with one line of code
- Add GET|POST|PUT|PATCH|DELETE routes - auto-injected with Koa context and the per-request Redux store
- Add a custom 404 handler
- Enable/disable POST body parsing, along with custom options
- Enable/disable HTTP hardening
- Mount your front-end assets anywhere (like a CDN) with a dynamic `<base>` tag handling ([React Helmet](https://github.com/nfl/react-helmet) compatible)

### Production-ready

- [Production bundling](https://reactql.org/docs/bundling/production), that generates optimised server and client code
- [Static bundling mode](https://reactql.org/docs/bundling/static) for hosting your full app on any static host -- Github pages, S3, Netlify, etc
- [Static compression](https://webpack.js.org/plugins/compression-webpack-plugin/) using the [Zopfli Gzip](https://en.wikipedia.org/wiki/Zopfli) and [Brotli](https://opensource.googleblog.com/2015/09/introducing-brotli-new-compression.html) algorithms for the serving of static assets as pre-compressed `.gz` and `.br` files (default `vendor.js.bz` goes from 380kb -> 89kb!)
- Automatic HTTP hardening against common attack vectors via [Koa Helmet](https://github.com/venables/koa-helmet) (highly configurable)
- Easily extendable [webpack-config](https://fitbit.github.io/webpack-config/) files, for modular Webpack tweaks
- [Docker](https://www.docker.com/) support, with an optimised `Dockerfile` out-the-box
- [PM2](http://pm2.keymetrics.io/)-enabled Dockerfile, which auto-clusters over multi-core processes and auto-restarts on failure

### Developer support

- [ESLint v3](http://eslint.org/)ing based on a tweaked [Airbnb style guide](https://github.com/airbnb/javascript)
- React and Babel compatible [Jest](https://facebook.github.io/jest/) test runner, pre-configured
- [Node Inspector](https://nodejs.org/en/docs/inspector/) support for SSR in dev mode - remotely debug the server, set breakpoints, inspect the stack from within Chrome
- Tons of code commentary to fill you in on what's happening under the hood
- Extensive, up-to-date [online documentation](https://reactql.org/docs/)
- [Examples repository](https://github.com/reactql/examples), with real-world use cases

### CLI tool

- Get the [ReactQL CLI](https://github.com/reactql/cli) tool with `npm i -g reactql`
- Mac, Windows and Linux compatible
- One command to start a new project: `reactql new`
- One command to upgrade an existing one: `reactql upgrade`
- Takes care of the stuff you shouldn't have to: `reactql new` downloads the kit, unzips the files, removes artefacts, builds your `package.json`, installs required NPM packages, and dumps the start-up commands in your terminal, so you can start coding right away

## Usage

See the **[CLI tool](https://github.com/reactql/cli)** for easily deploying this starter kit on Mac, Windows or Linux.

Then run `npm start` in the project root, and away you go!

## Docker

An Alpine-based [Dockerfile](https://github.com/reactql/kit/blob/master/Dockerfile) is included, that will build, optimise and bundle a production-mode ReactQL web server, your static assets and client-side code -- making it trivial to deploy to production.

Build as normal with:

`docker build . -t <project>`

Then run with:

`docker run -p 4000:4000 <project>`

Navigating to http://<docker_host>:4000 will yield the ReactQL project code.

You can also run with Docker Compose:

`docker-compose -f docker-compose.dev.yml up`

This will build and spawn a development environment on ports 8080 and 8081. Just like your local dev environment, both browser hot code reloading and SSR auto-restarting will work on local code changes -- even inside the Docker stack!

(You can also spawn a production-grade environment with `docker-compose up`, using the default [docker-compose.yml](https://github.com/reactql/kit/blob/master/docker-compose.yml))

# Follow @reactql for updates

Get the latest updates by following us on Twitter: https://twitter.com/reactql

[![Twitter Follow](https://img.shields.io/twitter/follow/reactql.svg?style=social&label=Follow)](https://twitter.com/reactql)

### Complete documentation @ **https://reactql.org**

# New to GraphQL? Need help?

<img src="https://reactql.org/assets/ext/slack_mark.png" alt="ReactQL" width="70" />

[Join the ReactQL slack channel here.](https://join.slack.com/t/reactql/shared_invite/enQtMjU0MjUzNDEzNzY0LWIyY2MzOGNlYmE1ZjI5ZDZhZTI2ODdiYzM2NjczYzJhZDgxYmJmYzE1NDYzZjRkYmVmNmQ3MzM0NzM3N2M5ODM)

Watch my free [45 minute YouTube video](https://www.youtube.com/watch?v=DNPVqK_woRQ), for a live coding walk-through of putting together a GraphQL server with a database. Learn how to write queries, mutations and handle nested/related data.

# Thanks to...

Special thanks to the following providers, for proving free support:

**Netlify**, for hosting the https://reactql.org site

<a href="https://netlify.com" target="_blank"><img src="https://www.netlify.com/img/global/badges/netlify-color-bg.svg" alt="Netlify" width="75" /></a>

**BrowserStack**, for providing cross-browser testing

<a href="https://browserstack.com" target="_blank"><img src="https://reactql.org/assets/ext/browserstack.svg" alt="BrowserStack" width="200" /></a>

... and Facebook, Github, the NFL, Google, Apollo/Meteor, and the hundreds of organisations and open-source contributors that have contributed a lifetime of collective coding to make this stack possible. 

<a target='_blank' rel='nofollow' href='https://app.codesponsor.io/link/oxCNqbK23kM1XR2YkLsCK7v7/reactql/kit'>
  <img alt='Sponsor' width='888' height='68' src='https://app.codesponsor.io/embed/oxCNqbK23kM1XR2YkLsCK7v7/reactql/kit.svg' />
</a>
