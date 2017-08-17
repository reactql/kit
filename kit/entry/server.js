/* eslint-disable no-param-reassign, no-console */

// Server entry point, for Webpack.  This will spawn a Koa web server
// and listen for HTTP requests.  Clients will get a return render of React
// or the file they have requested
//
// Note:  No HTTP optimisation is performed here (gzip, http/2, etc).  Node.js
// will nearly always be slower than Nginx or an equivalent, dedicated proxy,
// so it's usually better to leave that stuff to a faster upstream provider

// ----------------------
// IMPORTS

/* Node */

// For pre-pending a `<!DOCTYPE html>` stream to the server response
import { PassThrough } from 'stream';

/* NPM */

// Patch global.`fetch` so that Apollo calls to GraphQL work
import 'isomorphic-fetch';

// React UI
import React from 'react';

// React utility to transform JSX to HTML (to send back to the client)
// import ReactDOMServer from 'react-dom/server';
import ReactDOMServer from 'react-dom/server';

// Koa 2 web server.  Handles incoming HTTP requests, and will serve back
// the React render, or any of the static assets being compiled
import Koa from 'koa';

// Apollo tools to connect to a GraphQL server.  We'll grab the
// `ApolloProvider` HOC component, which will inject any 'listening' React
// components with GraphQL data props.  We'll also use `getDataFromTree`
// to await data being ready before rendering back HTML to the client
import { createNetworkInterface, ApolloProvider, getDataFromTree } from 'react-apollo';

// Enable cross-origin requests
import koaCors from 'kcors';

// Static file handler
import koaSend from 'koa-send';

// HTTP header hardening
import koaHelmet from 'koa-helmet';

// Koa Router, for handling URL requests
import KoaRouter from 'koa-router';

// High-precision timing, so we can debug response time to serve a request
import ms from 'microseconds';

// React Router HOC for figuring out the exact React hierarchy to display
// based on the URL
import { StaticRouter } from 'react-router';

// <Helmet> component for retrieving <head> section, so we can set page
// title, meta info, etc along with the initial HTML
import Helmet from 'react-helmet';

// Allow local GraphQL schema querying when using a built-in GraphQL server
import apolloLocalQuery from 'apollo-local-query';

// Import all of the GraphQL lib, for use with our Apollo client connection
import * as graphql from 'graphql';

/* ReactQL */

// App entry point.  This must come first, because app.js will set-up the
// server config that we'll use later
import App from 'src/app';

// Custom redux store creator.  This will allow us to create a store 'outside'
// of Apollo, so we can apply our own reducers and make use of the Redux dev
// tools in the browser
import createNewStore from 'kit/lib/redux';

// Initial view to send back HTML render
import Html from 'kit/views/ssr';

// Grab the shared Apollo Client
import { createClient } from 'kit/lib/apollo';

// App settings, which we'll use to customise the server -- must be loaded
// *after* app.js has been called, so the correct settings have been set
import config from 'kit/config';

// Import paths.  We'll use this to figure out where our public folder is
// so we can serve static files
import PATHS from 'config/paths';

// ----------------------

// Create a network layer based on settings.  This is an immediate function
// that binds either the `localInterface` function (if there's a built-in
// GraphQL) or `externalInterface` (if we're pointing outside of ReactQL)
const createNeworkInterface = (() => {
  function localInterface() {
    return apolloLocalQuery.createLocalInterface(
      graphql,
      config.graphQLServer.schema,
    );
  }

  function externalInterface() {
    return createNetworkInterface({
      uri: config.graphQLEndpoint,
    });
  }

  return config.graphQLServer ? localInterface : externalInterface;
})();

// Static file middleware
export function staticMiddleware() {
  return async function staticMiddlewareHandler(ctx, next) {
    try {
      if (ctx.path !== '/') {
        return await koaSend(
          ctx,
          ctx.path,
          process.env.NODE_ENV === 'production' ? {
            root: PATHS.public,
            immutable: true,
          } : {
            root: PATHS.distDev,
          },
        );
      }
    } catch (e) { /* Errors will fall through */ }
    return next();
  };
}

// Function to create a React handler, per the environment's correct
// manifest files
export function createReactHandler(css = [], scripts = [], chunkManifest = {}) {
  return async function reactHandler(ctx) {
    const routeContext = {};

    // Create a new server Apollo client for this request
    const client = createClient({
      ssrMode: true,
      networkInterface: createNeworkInterface(),
    });

    // Create a new Redux store for this request
    const store = createNewStore(client);

    // Generate the HTML from our React tree.  We're wrapping the result
    // in `react-router`'s <StaticRouter> which will pull out URL info and
    // store it in our empty `route` object
    const components = (
      <StaticRouter location={ctx.request.url} context={routeContext}>
        <ApolloProvider store={store} client={client}>
          <App />
        </ApolloProvider>
      </StaticRouter>
    );

    // Wait for GraphQL data to be available in our initial render,
    // before dumping HTML back to the client
    await getDataFromTree(components);

    // Handle redirects
    if ([301, 302].includes(routeContext.status)) {
      // 301 = permanent redirect, 302 = temporary
      ctx.status = routeContext.status;

      // Issue the new `Location:` header
      ctx.redirect(routeContext.url);

      // Return early -- no need to set a response body
      return;
    }

    // Handle 404 Not Found
    if (routeContext.status === 404) {
      // By default, just set the status code to 404.  Or, we can use
      // `config.set404Handler()` to pass in a custom handler func that takes
      // the `ctx` and store

      if (config.handler404) {
        config.handler404(ctx, store);

        // Return early -- no need to set a response body, because that should
        // be taken care of by the custom 404 handler
        return;
      }

      ctx.status = routeContext.status;
    }

    // Create a HTML stream, to send back to the browser
    const htmlStream = new PassThrough();

    // Prefix the doctype, so the browser knows to expect HTML5
    htmlStream.write('<!DOCTYPE html>');

    // Create a stream of the React render. We'll pass in the
    // Helmet component to generate the <head> tag, as well as our Redux
    // store state so that the browser can continue from the server
    const reactStream = ReactDOMServer.renderToStream(
      <Html
        head={Helmet.rewind()}
        window={{
          webpackManifest: chunkManifest,
          __STATE__: store.getState(),
        }}
        css={css}
        scripts={scripts}>
        {components}
      </Html>,
    );

    // Pipe the React stream to the HTML output
    reactStream.pipe(htmlStream);

    // Set the return type to `text/html`, and stream the response back to
    // the client
    ctx.type = 'text/html';
    ctx.body = htmlStream;
  };
}

// Build the router, based on our app's settings.  This will define which
// Koa route handlers
const router = (new KoaRouter())
  // Set-up a general purpose /ping route to check the server is alive
  .get('/ping', async ctx => {
    ctx.body = 'pong';
  })

  // Favicon.ico.  By default, we'll serve this as a 204 No Content.
  // If /favicon.ico is available as a static file, it'll try that first
  .get('/favicon.ico', async ctx => {
    ctx.res.statusCode = 204;
  });

// Build the app instance, which we'll use to define middleware for Koa
// as a precursor to handling routes
const app = new Koa()
  // Adds CORS config
  .use(koaCors())

  // Preliminary security for HTTP headers
  .use(koaHelmet())

  // Error wrapper.  If an error manages to slip through the middleware
  // chain, it will be caught and logged back here
  .use(async (ctx, next) => {
    try {
      await next();
    } catch (e) {
      // TODO we've used rudimentary console logging here.  In your own
      // app, I'd recommend you implement third-party logging so you can
      // capture errors properly
      console.log('Error', e.message);
      ctx.body = 'There was an error. Please try again later.';
    }
  })

  // It's useful to see how long a request takes to respond.  Add the
  // timing to a HTTP Response header
  .use(async (ctx, next) => {
    const start = ms.now();
    await next();
    const end = ms.parse(ms.since(start));
    const total = end.microseconds + (end.milliseconds * 1e3) + (end.seconds * 1e6);
    ctx.set('Response-Time', `${total / 1e3}ms`);
  });

// Attach a GraphQL server, if we need one
if (config.graphQLServer) {
  // Import the Apollo GraphQL server, for Koa
  const apolloGraphQLServer = require('apollo-server-koa');

  // Attach the GraphQL schema to the server, and hook it up to the endpoint
  // to listen to POST requests
  router.post(
    config.graphQLServer.endpoint,
    apolloGraphQLServer.graphqlKoa(context => ({
      // Bind the current request context, so it's accessible within GraphQL
      context,
      // Attach the GraphQL schema
      schema: config.graphQLServer.schema,
    })),
  );

  // Do we need the GraphiQL query interface?
  if (config.graphQLServer.graphiql) {
    router.get(
      config.graphQLServer.endpoint,
      apolloGraphQLServer.graphiqlKoa({
        endpointURL: config.graphQLEndpoint,
      }),
    );
  }
}

// Attach any custom routes we may have set in userland
config.routes.forEach(route => {
  router[route.method](route.route, route.handler);
});

/* BODY PARSING */

// `koa-bodyparser` is used to process POST requests.  Check that it's enabled
// (default) and apply a custom config if we need one
if (config.enableBodyParser) {
  app.use(require('koa-bodyparser')(
    // Pass in any options that may have been set in userland
    config.bodyParserOptions,
  ));
}

// Run the server
export default (async function server() {
  return {
    router,
    app,
  };
}());
