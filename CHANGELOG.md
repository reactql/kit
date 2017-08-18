2.4.0 - 2017-08-18
-----------------------------------------------

## Server
* Moves Apollo client and Redux store to Koa `ctx` middleware, so it's available to all routes
* Adds `config.addMiddleware()`, to add custom middleware to the Koa server

## App
* Adds sample `Powered-By` header, to showcase custom middleware
* Adds `ctx.store.getStore()` dump to sample `/test` and 404 routes, to show the difference in Apollo response

2.3.0 - 2017-08-17
-----------------------------------------------

## GraphQL
* Adds GraphiQL IDE by default to `/graphql` when using external GraphQL endpoint
* Allows explicit GraphiQL IDE endpoint to be set on `config.enableGraphQLServer|setGraphQLEndpoint()`
* Updates GraphiQL endpoint to match internal GraphQL POST endpoint URL by default (falls back to `/graphql`)

## Config
* **Breaking change** -- now `config.enableGraphQLServer()` should be called isomorphically!
* Adds explicit `config.setGraphQLSchema()` for passing the schema to the GraphQL server (use inside a `SERVER` block only!)

2.2.0 - 2017-08-17
-----------------------------------------------

## NPM
* Bumps packages:
regenerator-runtime     ^0.10.5  →  ^0.11.0
eslint-plugin-jsx-a11y   ^5.1.1  →   ^6.0.2
apollo-server-koa                           ^1.0.5  →   ^1.1.0
react-apollo                                ^1.4.8  →  ^1.4.14
react-redux                                 ^5.0.5  →   ^5.0.6
react-router                                ^4.1.1  →   ^4.1.2
react-router-dom                            ^4.1.1  →   ^4.1.2
redux                                       ^3.7.1  →   ^3.7.2
babel-core                                 ^6.25.0  →  ^6.26.0
babel-plugin-transform-object-rest-spread  ^6.23.0  →  ^6.26.0
babel-plugin-transform-regenerator         ^6.24.1  →  ^6.26.0
babel-polyfill                             ^6.23.0  →  ^6.26.0
cross-env                                   ^5.0.4  →   ^5.0.5
css-loader                                 ^0.28.4  →  ^0.28.5
eslint-plugin-react                         ^7.1.0  →   ^7.2.1
html-webpack-plugin                        ^2.29.0  →  ^2.30.1
less-loader                                 ^4.0.4  →   ^4.0.5
postcss-nested                              ^2.1.0  →   ^2.1.2
progress-bar-webpack-plugin                 ^1.9.3  →  ^1.10.0
webpack                                     ^3.4.1  →   ^3.5.5
webpack-bundle-analyzer                     ^2.8.2  →   ^2.9.0
webpack-config                              ^7.0.0  →   ^7.2.1
webpack-dev-server                          ^2.6.1  →   ^2.7.1
webpack-manifest-plugin                     ^1.2.1  →   ^1.3.1

2.1.0 - 2017-08-07
-----------------------------------------------

## Production
* Fixes production server run error introduced by when diagnosing #55
* Fixes docker image building

## NPM
* Bumps packages:
- "cross-env": "^5.0.4"
- "eslint": "^4.4.1"
- "chalk": "^2.1.0"

2.0.0 - 2017-08-06
-----------------------------------------------

# New features in 2.0.0

Kit v2 introduces a few significant improvements that make it easier to upgrade between kits, and power-up your ReactQL experience:

## React v16 + new streaming SSR

React has been bumped to the new v16, and `renderToString` has been replaced with `renderToStream` -- for turbo-powered first page rendering of React to HTML.

Early tests have shown a promising reduction from 12ms+ for React-only rendering (no GraphQL) to 4-5ms on my local Macbook Pro, using out-the-box defaults.

What's more, on Node 8+, the asynchronous `createReactHandler` that sets up the Redux store, runs Helmet, initialises the component tree and starts the stream, has been benchmarked as low as 0.48ms on my same machine!

Your ReactQL project will be faster than ever.

## Kit API - a cleaner separation between 'kit' and 'app' code

In kit v1.x, the lines between ReactQL and your client code were a little blurry.  Editing the Apollo endpoint meant modifying `config/project.js`, which was a file that Webpack also used to assess whether to show the bundle optimiser post-build.

If you wanted to add anything more to the server or browser, you'd typically need to delve into `kit/*` files and make changes.

Now, the separation between two is clearer than ever. ReactQL v2.x introduces a new `Config` singleton instance that provides 'hooks' into adding functionality to the standard config, without mashing together custom code.

ReactQL is and always has been a 'starter kit', and will continue to be so. But now the framework-esque separation of client and kit code paves the way to clean abstractions, and easier upgrading.

In a future ReactQL CLI version, it's possible that you'll be able to upgrade an active project to the latest kit with a single command, instead of the current process of creating a new project, copying over `src` and manually/surgically editing kit files.

## Built-in GraphQL server.

ReactQL was originally focused on being a front-end starter kit.  But the effort put into creating a fast and capable SSR stack means you now also have an ideal home to run a monolithic GraphQL server, too.

Starting with 2.0, you're now able to add a GraphQL server easily, by add a few lines of code to `src/app.js`:

**src/app.js**
```js
// Import the new `Config` singleton instance
import config from `kit/config`;

// Enable GraphQL on the server -- this code will be eliminated from the browser bundle
if (SERVER) {
  config.enableGraphQLServer(require('src/path/to/schema').default);
}
```

That's it!

The above mounts a GraphQL server inside Koa at `/graphql`, gives you a visual UI to query data via GraphiQL, and sets up Apollo to point to the server URI automatically. It takes care of your server-side CORS config, and adds POST body processing for incoming GraphQL queries.

It also adds [apollo-local-query](https://github.com/af/apollo-local-query) to Apollo client initialisation on the server, so instead of routing requests over the network, GraphQL queries are made against the schema already loaded in memory -- eliminating TCP/IP overhead.

Of course, if you want to connect to a third-party endpoint, you can still do that easily:

```js
config.setApolloURI('http://example.com/graphql');
```

(Special thanks to graph.cool for allowing us to use their service in the starter kit in 1.x. Hopefully the move above will also take some load off your server :smile:)

## Add Redux reducers more easily

With the new `Config` API, you no longer need to edit `kit/lib/redux.js` to add custom reducers.

Instead, you can add them to `src/app.js` and keep reducers in userland:

```js
import config from `kit/config`;

// Create a reducer somewhere, shaped as { state, reducer() } -- this will
// probably be imported from a separate file
const someReducer = {
  // This is the reducer's initial state
  state: {
    someSetting: true,
  },
  reducer(state, action) {
    // ... reducer code to do something with `state`
  }
}

// Add the reducer, and specify the reducer key
settings.addReducer('someKey', someReducer);
```

## Custom routes

You can now add custom GET|POST|PUT|PATCH routes to the server, like so:

```js
// We can add custom routes to the web server easily, by using
// `config.add<Get|Post|Put|Patch>Route()`.  Note:  These are server routes only.
config.addGetRoute('/test', async ctx => {
  ctx.body = 'Hello from your ReactQL route.';
});
```

Routes will be added in insertion order, to obey your precedence rules.

## POST body parsing

`koa-bodyparser` is enabled by default, to process POST requests for a built-in GraphQL server or custom POST routes.

By default, it'll process JSON and form requests automatically.

You can disable with:

```js
config.disableBodyParser();
```

Or pass in your own custom options to `koa-bodyparser` with:

```js
config.setBodyParserOptions({
  // Example of a config option -- see https://github.com/koajs/bodyparser
  jsonLimit: '8mb',
})
```

## Custom 404 handler

The custom 404 handler added in 2.0 is one of several planned API 'hooks' that allow you to attach custom functionality to common server and browser entry points, without editing kit code.

This example ships in the starter kit:

```js
config.set404Handler((ctx, store) => {
  // For demo purposes, let's get a JSON dump of the current Redux state
  // to see that we can expect its contents
  const stateDump = JSON.stringify(store.getState());

  // Explicitly set the return status to 404.  This is done for us by
  // default if we don't have a custom 404 handler, but left to the function
  // otherwise (since we might not always want to return a 404)
  ctx.status = 404;

  // Set the body
  ctx.body = `This route does not exist on the server - Redux dump: ${stateDump}`;
});
```

You get access to the Koa `ctx` request context object as well as the Redux `store`, giving you the flexibility to handle responses in whichever way makes the most sense for your application.

In future kits, expect hooks to crop up in places like redirect and error handling.

## Neater `src` layout; more commentary

The out-the-box sample app that comes with a new ReactQL project is now better organised. Instead of a single `src/app.js` file, components have been given their own files/folders, and tons of extra commentary has been added to give you a better idea of what's happening under the hood.

Whilst `src/app.js` is still required in every project (that's where ReactQL will look for your app code), now the file should serve two simple purposes:

1. Configuring the app, per the new features above.
2. Exporting the root React component, to mount automatically inside `<Html> -> <div id="main"/>`

This best practice will make it easier to organise your code, and know what goes where.

Several components also demonstrate the pattern of asset co-location; images and SASS code is often in the same directory as the calling `.js` file, to make it clear which assets belong to which React components.

---

v2.0 documentation will land on https://reactql.org/docs soon.

All changes:

## Code layout
* Removes moot `config/project.js`

## Configuration
* Adds new `Config` class to `kit/config.js`, initialised as a singleton to use globally in `src/app.js`
* Adds the following new methods:
- `addReducer(key, reducer)` -- adds a new Redux reducer in the shape of `{state, reducer()}`
- `disableBodyParser()` -- disables `koa-bodyparser` in the server config
- `setBodyParserOptions(opt)` -- pass custom `koa-bodyparser` options to override defaults
- `addRoute(method, route, handler)` -- add new Koa route
- `addGetRoute(route, handler)` -- add new GET route
- `addPostRoute(route, handler)` -- add new POST route
- `addPutRoute(route, handler)` -- add new PUT route
- `addPatchRoute(route, handler)` -- add new PATCH route
- `addDeleteRoute(route, handler)` -- add new DELETE route
- `set404Handler(func)` -- sets a custom 404 handler, which is given `(state, store)` inside `createReactHandler()`
- `enableGraphQLServer(schema, endpoint = '/graphql', graphiql = true)` -- enables built-in GraphQL web server at `/graphql`, (optionally) enables up GraphiQL
- `setGraphQLEndpoint(uri)` -- sets the GraphQL server URI for Apollo. For use with external GraphQL servers.

## Browser
* Replaces ReactDOM's deprecated `render` with the new `hydrate` method, for rehydrating server HTML.

## Server
* Bumps to React v16's streaming API.
* React's `data-reactid` tags no longer appear in resulting HTML, saving bandwidth
* Adds GraphQL server configuration
* Adds GraphiQL UI option when using a local GraphQL server
* Adds `apollo-local-query`, for bypassing the network when using a local GraphQL server
* Adds `createNeworkInterface()`, for memoizing network interface creation on the server
* Refactors React to use `renderToStream` instead of `renderToStaticMarkup`
* Refactors `<Html>` component to take component tree as a child prop, and not as a rendered string
* Adds custom route configuration
* Adds `kcors` to allow cross-origin requests by default (for REST/GraphQL)

## Libs
* Removes `serverClient()` method in `kit/lib/apollo.js`, to avoid unnecessary `apollo-local-query` bundling on the browser
* Improves `getURL()` in `kit/lib/env.js`, to allow a boolean flag to enable HTTPS
* Adds `getServerURL()` to `kit/lib/env.js`, to explicitly get the web server host and port (typically for GraphQL)
* Refactors `kib/lib/redux.js` to derive config from the `config.reducers` Map

## Webpack
* Adds new `npm run build-analyze` option, to open a browser window showing the bundle analysis report after building
* Removes explicit `BUNDLE_ANALYZER` config option -- now uses the above command

## App
* Refactors app code to tidy up the `src` folder
* Gives each component its own file/folder layout, with images/CSS co-located
* Adds tons of extra commentary to make it clearer how each component works
* Moves `<root>/reducers` to `src/reducers`, to reflect best practices
* Refactors counter reducer to use the new `{state, reducer()}` reducer shape (now exported bare; no longer attached to a reducer key)
* Refactors SASS/CSS to use separate files to be imported by components, instead of together in one file

## General
* Fixes spacing issues being reported in ESLInt 4.0
* Shaves 9kb off `vendor.<hash>.js` bundle (383kb -> 374kb... 107kb gzipped... 90.9kb Brotli!)

## NPM
* Adds packages:
- "apollo-local-query": "^0.3.0",
- "apollo-server-koa": "^1.0.5",
- "graphql": "^0.10.5"
- "kcors": "^2.2.1"
- "koa-bodyparser": "^4.2.0"

* Bumps packages:
- "eslint": "^4.3.0"
- "serve": "^6.0.6"
- "react": "^16.0.0-beta.3"
- "react-dom": "^16.0.0-beta.3"

## Known issues
* Static bundling via `npm run build-static` builds an an invalid `<script>` include for the Webpack manifest, pending https://github.com/reactql/kit/issues/55

1.17.1 - 2017-08-02
-----------------------------------------------

## Webpack
* Refactors inline image and font file regex to `kit/webpack/common.js`
* Fixes image/font file loading, when importing from an NPM package

1.17.0 - 2017-07-30
-----------------------------------------------

## Server (development)
* Adds `--inspect` to server fork in development, to enable debugging

1.16.0 - 2017-07-26
-----------------------------------------------

## Webpack
* Moves sass `sourceMap` option to newer `options` object

## NPM
* Bumps packages:
brotli-webpack-plugin    ^0.3.0  →  ^0.4.0
boxen                           ^1.1.0  →   ^1.2.1
react-apollo                    ^1.4.3  →   ^1.4.8
chunk-manifest-webpack-plugin   ^1.1.0  →   ^1.1.2
eslint-config-airbnb           ^15.0.2  →  ^15.1.0
eslint-plugin-babel             ^4.1.1  →   ^4.1.2
iltorb                          ^1.3.3  →   ^1.3.5
postcss-nested                  ^2.0.2  →   ^2.1.0
serve                           ^6.0.2  →   ^6.0.3
webpack                         ^3.1.0  →   ^3.4.1
webpack-dev-server              ^2.5.1  →   ^2.6.1
webpack-manifest-plugin         ^1.1.2  →   ^1.2.1

1.15.1 - 2017-07-22
-----------------------------------------------

## PostCSS
* Fixes `url()` imports in CSSNano, by disabling `normalizeUrl`

1.15.0 - 2017-07-21
-----------------------------------------------

## Webpack
* Fixes global CSS/Sass/LESS RegEx check

1.14.0 - 2017-07-17
-----------------------------------------------

## General
* Merges #49 - browser window now automatically opens on `npm start`

## NPM
* Removes `compression-webpack-plugin` in favour of `zopfli-webpack-plugin`
* Bumps packages
extract-text-webpack-plugin   ^2.1.2  →  ^3.0.0
postcss-cssnext                3.0.0  →   3.0.2

boxen                    ^1.1.0  →  ^1.2.0
react-router             ^4.1.1  →  ^4.1.2
react-router-dom         ^4.1.1  →  ^4.1.2
redux                    ^3.7.1  →  ^3.7.2
postcss-nested           ^2.0.2  →  ^2.0.4
webpack                  ^3.1.0  →  ^3.3.0
webpack-bundle-analyzer  ^2.8.2  →  ^2.8.3

1.13.0 - 2017-07-08
------------------------------------------------

## Webpack
* Enables scope hoisting `webpack.optimize.ModuleConcatenationPlugin`-- shaves a few KB of the vendor bundle size

## NPM
* Bumps packages:
postcss-cssnext          2.11.0  →   3.0.0
react-apollo              ^1.4.2  →   ^1.4.3
babel-preset-env          ^1.5.2  →   ^1.6.0
eslint-config-airbnb     ^15.0.1  →  ^15.0.2
eslint-plugin-import      ^2.6.1  →   ^2.7.0
iltorb                    ^1.3.2  →   ^1.3.3
serve                     ^6.0.0  →   ^6.0.2
webpack                   ^3.0.0  →   ^3.1.0
webpack-dev-server        ^2.5.0  →   ^2.5.1
webpack-manifest-plugin   ^1.1.0  →   ^1.1.2

1.12.0 - 2017-07-02
------------------------------------------------

## ESLint
* Reverts back to ESLint v3, to avoid Airbnb syntax issues (fixes #44)
* Reverts to `eslint-plugin-jsx-a11y` ^5.1.0, fixing ESLint v3 issues

## Testing
* Adds `jest` test runner (currently no tests)
* Adds `npm test` option to `package.json`
* Adds `.travis.yml` for building and testing lint status via Travis-CI

1.11.0 - 2017-06-30
------------------------------------------------

## Webpack
* Removes Uglify2 compression options, to avoid edge cases in NPM packages
* Bump to Webpack v3 and latest versions (shaves 12.2% off the default vendor build sizes)

## NPM
* Bumps versions:
chalk                    ^1.1.3  →  ^2.0.1
eslint                  ^3.19.0  →  ^4.1.1
eslint-plugin-jsx-a11y   ^5.0.3  →  ^6.0.2
serve                    ^5.2.2  →  ^6.0.0
webpack                  ^2.6.1  →  ^3.0.0
koa                              ^2.2.0  →   ^2.3.0
redux                            ^3.7.0  →   ^3.7.1
babel-loader                     ^7.1.0  →   ^7.1.1
eslint-import-resolver-webpack   ^0.8.1  →   ^0.8.3
eslint-plugin-import             ^2.3.0  →   ^2.6.1
graphql-tag                      ^2.4.0  →   ^2.4.2
html-webpack-plugin             ^2.28.0  →  ^2.29.0
resolve-url-loader               ^2.0.3  →   ^2.1.0

1.10.1 - 2017-06-21
------------------------------------------------

## Docker
* Fixes #35 - image optimiser binaries are now built successfully

1.10.0 - 2017-06-20
------------------------------------------------

## ESLint
* Reverts to ESLint v3.19.0 pending https://github.com/airbnb/javascript/issues/1447

1.9.0 - 2017-06-20
------------------------------------------------

## Webpack
* Removes redundant `OccurrenceOrderPlugin` (on in default in Weback v2)
* Updates `module.loaders` -> `module.rules`, and `loaders.loaders` -> `rules.use`

## NPM
* Bumps packages:
"babel-core": "^6.25.0"
"babel-loader": "^7.1.0"
"babel-preset-env": "^1.5.2"
"cross-env": "^5.0.1"
"eslint-plugin-compat": "^1.0.4"
"eslint-plugin-react": "^7.1.0",
"extract-text-webpack-plugin": "^2.1.2",
"file-loader": "^0.11.2",
"graphql-tag": "^2.4.0"
"less-loader": "^4.0.4"
"resolve-url-loader": "^2.0.3"
"sass-loader": "^6.0.6",
"serve": "^5.2.2",
"style-loader": "^0.18.2"
"webpack-dev-server": "^2.5.0"
"koa-helmet": "^3.2.0",
"koa-router": "^7.2.1"
"react": "^15.6.1",
"react-apollo": "^1.4.2",
"react-dom": "^15.6.1"
"redux": "^3.7.0"

1.8.1 - 2017-06-15
------------------------------------------------

## Webpack
* Improves sourceMap handling in `postcss-loader` per the fix at https://github.com/postcss/postcss-loader/issues/250

## NPM:
* Bumps packages:
"postcss-loader": "^2.0.6"

1.8.0 - 2017-06-15
------------------------------------------------

## State management (Redux)
* Refactors `kit/lib/redux.js` to provide a pattern for adding custom reducers outside of Apollo
* Adds `reducers/counter.js` sample reducer, for incrementing a counter
* Adds `<ReduxCounter>` example to `src/app.js` for triggering an increment action and listening for store changes
* Adds `react-redux`, for passing Redux store state to React via props
* Adds `redux-thunk`, for allowing custom actions that return functions, giving them access to `dispatch` related actions
* Adds `seamless-immutable`, for enforcing immutability in custom Redux state

## ESLint
* Bumps to ESLint v4 (from v3.19)

## NPM
* Adds packages
"react-redux": "^5.0.5"
"redux-thunk": "^2.2.0",
"seamless-immutable": "^7.1.2"
* Bumps packages:
"eslint": "^4.0.0"

1.7.0 - 2017-06-08
------------------------------------------------

## General
* Fixes issue in `kit/lib/env.js`, where `isProduction` was always returning `false`

## Docker
* Adds `Dockerfile`, for building a production web server Docker image
* Adds `.dockerignore`, copied from the existing `.gitignore` to avoid unnecessary build context

## NPM
* Removes `yarn.lock` -- the official advice is to avoid Yarn at present, due to certain third-party NPM packages relying on 'postinstall' hooks to build binaries from source
* Adds `package-lock.json`, for faster builds with NPM v5
* Explicitly adds `iltorb` and `node-zopfli`, binary packages required for Brotli and Zopfli compression respectively
* Adds packages:
"iltorb": "^1.3.1"
"node-zopfli": "^2.0.2"

1.6.0 - 2017-06-06
------------------------------------------------

## GraphQL
* Adds `graphql-tag` loader, for storing queries in `.gql|graphql` files (closes #32)
* Refactors `src/app.js` to use file queries
* Adds `src/queries/all_messages.gql`, for retrieving GraphCool endpoint messages
* Adds `src/queries/message.gql`, imported by `all_messages.gql` as a query fragment

## Webpack
* Adds `graphql-tag` loader config to `kit/webpack/base.js`

## NPM
* Adds packages:
"graphql-tag": "^2.2.1"

1.5.3 - 2017-06-06
------------------------------------------------

## Webpack
* Replaces `cheap-module-source-map` with `source-map` in development, for compatibility with CSS
* Adds `sourceMap` option to `common.css.getExtractCSSLoaders()`

1.5.2 - 2017-06-05
------------------------------------------------

## ESLint
* Adds React ignore for the following props:
- `dispatch`, for less Redux boilerplate
- `data`, injected by Apollo

## Apollo
* Removes redundant `kit/lib/apollo.js -> mergeData()` function

1.5.1 - 2017-06-01
------------------------------------------------

## Environment
* Adds more complete `kit/lib/env.js`, with functions for getting browser/server-specific host/ports

1.5.0 - 2017-06-01
------------------------------------------------

## Environment
* Adds `kit/lib/env.js`, for determining local environment settings
* Adds `getHost()`, `getPort()` and `getURL()` to `kit/lib/env.js` to detect where the local server is/will be spawned on
* Updates Webpack and `kit/entry/server_*.js` configs to use dynamic environment host/port/URL
* Adds development/production env vars to webpack builds, to provide context to Webpack

## NPM
* Replaces `concurrently` with `npm-run-all`, to avoid errors in NPM v5.0.0 when terminating with Ctrl/Cmd + C
* Removes packages:
"concurrently": "^3.4.0"
* Adds packages:
"npm-run-all": "^4.0.2"

1.4.1 - 2017-05-30
------------------------------------------------

## Server
* Adds 301/302 redirect handling (issues `Location:` header to new URL)
* Adds 404 Not Found handling; by default, just sets a 404 status code

## App
* Adds sample `<Redirect>` handler, from /old/path to /new/path
* Adds fall-through 404 handler, when no routes are matched

1.4.0 - 2017-05-30
------------------------------------------------
## General
* Fixes edge case where `<script defer>` tags in `kit/views/ssr.js` could cause manifest/vendor/browser files to load in the wrong order
* Adds Brotli compression - builds `.br` versions of static assets in production
* Adds `staticMiddleware()` to `kit/entry/server.js` for serving static file assets
* Replaces `koa-static` middleware with a direct call to parent `koa-send`
* Bumps to PostCSS v6 by removing inline Webpack config

## NPM
* Removes packages:
"koa-static": "^3.0.0"

* Adds packages:
"brotli-webpack-plugin": "^0.3.0"
"koa-send": "^4.1.0"

* Bumps packages:
"babel-preset-env": "^1.5.1"
"css-loader": "^0.28.4"
"eslint-plugin-compat": "^1.0.3"
"eslint-plugin-import": "^2.3.0"
"eslint-plugin-jsx-a11y": "^5.0.3"
"node-sass": "^4.5.3"
"style-loader": "^0.18.1"
"webpack": "^2.6.1"
"webpack-bundle-analyzer": "^2.8.2"
"koa-router": "^7.2.0"
"react-helmet": "^5.1.3"

1.3.2 - 2017-05-29
------------------------------------------------
* Replaces `gzip` with `zopfli` compression on Webpack build assets (up to 5% better compression)
* Adds `npm run build-browser` script, for generating just a production browser bundle

1.3.1 - 2017-05-28
------------------------------------------------
* Fixes #30 - code splitting now works on both the dev and production web server

1.3.0 - 2017-05-27
------------------------------------------------
## Linting
* Fixes #24 - ESLint works with latest Atom ESLinter, bypasses the need for Webpack and `babel-register`, and speeds up linting.
* Removes `kit/webpack/eslint.js` - which is now moot

## Server
* Closes #4 - Introduces server development bundling.  Now running `npm start` bundles _both_ a hot-reloading browser bundle, and a spawns server-side rendering that reloads upon code changes.
* Adds `distDev` route to paths, for server development bundled assets
* Adds `kit/webpack/server_dev.js` Webpack config for building and launching a development server
* Adds separate `kit/webpack/server_prod.js` Webpack config for building production server bundle
* Refactors `kit/entry/server.js` for working in both dev/production
* Adds console messages to show server start-up info, including network IP and ports
* Fixes `__dirname` in the built server bundle, so that `dist/server.js` can be run from anywhere (mentioned in / fixes https://github.com/reactql/cli/issues/36)

## Helpers
* Adds `kit/lib/console.js` and `logServerStarted()` function, for dumping neat console messages to the screen when starting servers
* Adds `kit/lib/routing.js`, with `<Status>` (internal), `<NotFound>` and `<Redirect>` components for handling status codes, 404s and redirects, universally.

## Webpack / bundling
* Adds ability to use multiple webpack-configs in a given config file, by exporting as an array
* Tidies up `kit/webpack/base` with common stats; fixes path typo
* Adds `kit/webpack/dev.js`, which is extended by server_dev and browser_dev and adds the correct env vars and source-maps.
* Closes #22 - Adds static bundling.  Now you can run `npm run build-static` to create a production browser bundle along with an `index.html` file, for uploading to a static web host
* Adds `npm run build-static-run`, for static bundling and running the static site locally on port 5000
* Adds `npm run static`, for running an already built static bundle
* Refactors `kit/webpack/browser_prod.js` to add console messages; fixes minor chunk hash typo
* Adds `css.getDevLoaders()` and `css.getExtractCSSLoaders()` helper functions to `kit/webpack/common.js`, for CSS configs that work across multiple configs
* Adds `stats` to `kit/webpack/common.js`, for a common output format that shows built assets, errors and warnings, with minimal clutter

## NPM
* Adds packages:
"concurrently": "^3.4.0"
"serve": "^5.1.5"
"boxen": "^1.1.0",
"chalk": "^1.1.3",
"ip": "^1.1.5"
* Removes redundant packages:
  "babel-register": "^6.24.1"
  "node-noop": "^1.0.0"
  "promise-monofill": "^1.0.1"
* Re-orders packages so that they correctly appear within `devDependencies` or `dependencies`
* Refactors `npm run...` commands as follows:
  "browser": Runs hot-reloaded Webpack dev server for the browser on port 8080
  "build": Builds production bundles for server and browser
  "build-run": Builds production bundles, and runs a live web server
  "build-static": Builds a production browser bundle and `index.html`, for hosting statically
  "build-static-run": Builds static bundle, and runs it locally on port 5000
  "clean": Removes `dist` folder and contents
  "lint": Runs ESLint on project source code
  "server": Runs a previously build production web server
  "server-dev": Runs a development web server on port 8081 (restarts automatically on code changes)
  "start": Starts both a development web server and a hot-reloadable browser Webpack dev server (ports 8081/8080 respectively)
  "static": Starts a static web server on port 5000 for a previously built static bundle
  "test": Currently does nothing. TBD.

## App
* Adds 404 route handling (currently a blank response - but 404 codes can be implemented at the server level to be handled by middleware, or respond appropriately; redirects TBD.)

1.2.0 - 2017-05-22
------------------------------------------------
* Adds `npm run build-browser-only` option, which creates `index.html` alongside regular JS and CSS browser bundling. Useful for static hosts or via a BYO web server.
* Adds provisional `postcss.config.js`, for upcoming PostCSS v6.0 (note: not implemented yet; CSSNext currently awaiting https://github.com/MoOx/postcss-cssnext/issues/374)
* Fixes PostCSS source maps in development
* Adds `HOST` environment var for overriding `localhost` default
* Adds `Running on http://localhost:4000/` default message when server starts (or whatever the correct `HOST` and `PORT` are)
* Bumps NPM packages:
  "cross-env": "^5.0.0",
  "css-loader": "^0.28.1",
  "eslint-config-airbnb": "^15.0.0",
  "eslint-plugin-jsx-a11y": "^5.0.1",
  "eslint-plugin-react": "^7.0.1",
  "image-webpack-loader": "^3.3.1",
  "node-noop": "^1.0.0",
  "postcss-cssnext": "2.11.0",
  "postcss-loader": "^2.0.5",
  "postcss-nested": "^2.0.2",
  "promise-monofill": "^1.0.1",
  "sass-loader": "^6.0.5",
  "style-loader": "^0.18.0",
  "webpack": "^2.5.1",
  "webpack-bundle-analyzer": "^2.8.1",
  "webpack-dev-server": "^2.4.5",
  "webpack-node-externals": "^1.6.0"
* Bumps `yarn.lock`
* Merges #25 - .editorconfig ESLint fix eol-last

1.1.2 - 2017-04-29
------------------------------------------------
* Closes #33 - Webpack config options are not specified by `WEBPACK_CONFIG` in `package.json`

1.1.1 - 2017-04-24
------------------------------------------------
* Adds CSSNano, for optimising resulting stylesheet code via PostCSS
* Adds extensible `css-loader` defaults to `kit/webpack/common.js`
* Fixes `src/styles.css` to use SASS-style nesting of elements
* Bumps `yarn.lock`
* Bumps NPM:
 chunk-manifest-webpack-plugin  ^1.0.0  →  ^1.1.0
 webpack-dev-server             ^2.4.3  →  ^2.4.4

1.1.0 - 2017-04-22
------------------------------------------------
* Adds '.global.(css|scss|sass|less)' loaders, making it trivial to separate 'localised' and global styles
* Fixes ESLint'ing to allow `for...of`, correctly filtering out the Airbnb restriction
* Adds `postcss-nested`, to allow SASS-style nesting on plain CSS
* Adds `kit/webpack/common.js` for shared configuration between Webpack files
* Refactors style loading in Webpack files targeting all environments
* Fixes `prop-types` warning generated by `react-apollo` by bumping to 1.1.0
* Adds global style to `src/styles.global.css`
* Refactors class names with original name, prepended to the base64 hash
* Updates `yarn.lock`
* Bumps NPM packages:
 react-apollo               ^1.0.1  →  ^1.1.0
 babel-eslint               ^7.2.1  →  ^7.2.3
 babel-loader        ^7.0.0-beta.1  →  ^7.0.0
 webpack-dev-server         ^2.4.2  →  ^2.4.3

1.0.7 - 2017-04-17
------------------------------------------------
* Optimises `window.*` initial variables on SSR by removing whitespace
* Allows passing a `window` prop to `<Html>` on SSR, instead of separate props for `webpackManifest` / `state`

1.0.6 - 2017-04-17
------------------------------------------------
* Moves `manifest.json` and `chunk-manifest.json` to `dist` instead of `dist/public` (stops them being accessible publicly)
* Fixes issue with manifest paths not working on non-root routes

1.0.5 - 2017-04-17
------------------------------------------------
* Closes #1 - Adds `/favicon.ico` route handling-- if an icon is available, it'll be served. Otherwise, the server will return "204 No Content"
* Adds sample ReactQL favicon at `static/favicon.ico`
* Moved `static/webpack.html` default page for the Webpack Dev Server to `kit/views/webpack.html`, to emphasise that `static` is userland
* Improves Webpack Dev Server config to check `static/*` first, and then `kit/views/*` when looking for static files (i.e. the `webpack.html` default view)
* Adds `CopyWebpackPlugin` to production-- `static/*` will be copied to `dist/public/*` to make static files available to the production server

1.0.4 - 2017-04-17
------------------------------------------------
* Adds decorator syntax via [transform-decorators-legacy](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy)
* Adds static class properties [transform-class-properties](https://babeljs.io/docs/plugins/transform-class-properties/)
* Adds support for extending `React.PureComponent` without generating linting errors (when using props/context)
* Modifies sample `<GraphQLMessage>` component in `src/app.js` to use `@graphql` as a decorator and static `propTypes`

1.0.3 - 2017-04-17
------------------------------------------------
* Merges #8 - removes deprecation warning related to loaderUtils.parseQuery()

1.0.2 - 2017-04-17
------------------------------------------------
* Merges #7 - bumps NPM packages

1.0.1 - 2017-04-16
------------------------------------------------
* Adds `CHANGELOG`
* Adds `README.md`
* Adds `process.env.NODE_ENV === 'production'` to server Webpack config, for SSR minification (React in particular)

1.0.0 - 2017-04-16
------------------------------------------------
* Initial kit -- all starter kit code provided up to CLI version 2.2.0
