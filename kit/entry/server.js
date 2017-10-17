/* eslint-disable no-param-reassign, no-console */

// Server entry point, for Webpack.  This will spawn a Koa web server
// and listen for HTTP requests.  Clients will get a return render of React
// or the file they have requested.

// ----------------------
// IMPORTS

/* Node */

// For pre-pending a `<!DOCTYPE html>` stream to the server response
import { PassThrough } from 'stream';

// HTTP & SSL servers.  We can use `config.enableSSL|disableHTTP()` to enable
// HTTPS and disable plain HTTP respectively, so we'll use Node's core libs
// for building both server types.
import http from 'http';
import https from 'https';

/* NPM */

// Patch global.`fetch` so that Apollo calls to GraphQL work
import 'isomorphic-fetch';

// React UI
import React from 'react';

// React utility to transform JSX to HTML (to send back to the client)
import ReactDOMServer from 'react-dom/server';

// Koa 2 web server.  Handles incoming HTTP requests, and will serve back
// the React render, or any of the static assets being compiled
import Koa from 'koa';

// Apollo tools to connect to a GraphQL server.  We'll grab the
// `ApolloProvider` HOC component, which will inject any 'listening' React
// components with GraphQL data props.  We'll also use `getDataFromTree`
// to await data being ready before rendering back HTML to the client
import { ApolloProvider, getDataFromTree } from 'react-apollo';

// Enforce SSL, if required
import koaSSL from 'koa-sslify';

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

// Import the Apollo GraphQL server, for Koa
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';

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

// Grab the shared Apollo Client / network interface instantiation
import { getNetworkInterface, createClient } from 'kit/lib/apollo';

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
  // For a local interface, we want to allow passing in the request's
  // context object, which can then feed through to our GraphQL queries to
  // extract pertinent information and manipulate the response
  function localInterface(context) {
    return apolloLocalQuery.createLocalInterface(
      graphql,
      config.graphQLSchema,
      {
        // Attach the request's context, which certain GraphQL queries might
        // need for accessing cookies, auth headers, etc.
        context,
      },
    );
  }

  function externalInterface(ctx) {
    return getNetworkInterface(config.graphQLEndpoint, ctx.apollo.networkOptions);
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

    // Generate the HTML from our React tree.  We're wrapping the result
    // in `react-router`'s <StaticRouter> which will pull out URL info and
    // store it in our empty `route` object
    const components = (
      <StaticRouter location={ctx.request.url} context={routeContext}>
        <ApolloProvider store={ctx.store} client={ctx.apollo.client}>
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
        config.handler404(ctx);

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
    const reactStream = ReactDOMServer.renderToNodeStream(
      <Html
        helmet={Helmet.renderStatic()}
        window={{
          webpackManifest: chunkManifest,
          __STATE__: ctx.store.getState(),
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
    ctx.status = 204;
  });

// Build the app instance, which we'll use to define middleware for Koa
// as a precursor to handling routes
const app = new Koa()
  // Adds CORS config
  .use(koaCors(config.corsOptions))

  // Error wrapper.  If an error manages to slip through the middleware
  // chain, it will be caught and logged back here
  .use(async (ctx, next) => {
    try {
      await next();
    } catch (e) {
      // If we have a custom error handler, use that - else simply log a
      // message and return one to the user
      if (typeof config.errorHandler === 'function') {
        config.errorHandler(e, ctx, next);
      } else {
        console.log('Error:', e.message);
        ctx.body = 'There was an error. Please try again later.';
      }
    }
  });

if (config.enableTiming) {
  // It's useful to see how long a request takes to respond.  Add the
  // timing to a HTTP Response header
  app.use(async (ctx, next) => {
    const start = ms.now();
    await next();
    const end = ms.parse(ms.since(start));
    const total = end.microseconds + (end.milliseconds * 1e3) + (end.seconds * 1e6);
    ctx.set('Response-Time', `${total / 1e3}ms`);
  });
}

// Middleware to set the per-request environment, including the Apollo client.
// These can be overriden/added to in userland with `config.addBeforeMiddleware()`
app.use(async (ctx, next) => {
  ctx.apollo = {};
  return next();
});

// Add 'before' middleware that needs to be invoked before the per-request
// Apollo client and Redux store has instantiated
config.beforeMiddleware.forEach(middlewareFunc => app.use(middlewareFunc));

// Create a new Apollo client and Redux store per request.  This will be
// stored on the `ctx` object, making it available for the React handler or
// any subsequent route/middleware
app.use(async (ctx, next) => {
  // Create a new server Apollo client for this request, if we don't already
  // have one
  if (!ctx.apollo.client) {
    ctx.apollo.client = createClient({
      ssrMode: true,
      // Create a network request.  If we're running an internal server, this
      // will be a function that accepts the request's context, to feed through
      // to the GraphQL schema
      networkInterface: createNeworkInterface(ctx),
      ...ctx.apollo.options,
    });
  }

  // Create a new Redux store for this request, if we don't have one
  if (!ctx.store) {
    ctx.store = createNewStore(ctx.apollo.client);
  }

  // Pass to the next middleware in the chain: React, custom middleware, etc
  return next();
});

/* FORCE SSL */

// Middleware to re-write HTTP requests to SSL, if required.
if (config.enableForceSSL) {
  app.use(koaSSL(config.enableForceSSL));
}

// Middleware to add preliminary security for HTTP headers via Koa Helmet
if (config.enableKoaHelmet) {
  app.use(koaHelmet(config.koaHelmetOptions));
}

// Attach custom middleware
config.middleware.forEach(middlewareFunc => app.use(middlewareFunc));

// Attach an internal GraphQL server, if we need one
if (config.graphQLServer) {
  // Attach the GraphQL schema to the server, and hook it up to the endpoint
  // to listen to POST requests
  router.post(
    config.graphQLEndpoint,
    graphqlKoa(context => ({
      // Bind the current request context, so it's accessible within GraphQL
      context,
      // Attach the GraphQL schema
      schema: config.graphQLSchema,
    })),
  );
}

// Do we need the GraphiQL query interface?  This can be used if we have an
// internal GraphQL server, or if we're pointing to an external server.  First,
// we check if `config.graphiql` === `true` to see if we need one...

if (config.graphiQL) {
  // The GraphiQL endpoint default depends on this order of precedence:
  // explicit -> internal GraphQL server endpoint -> /graphql
  let graphiQLEndpoint;

  if (typeof config.graphiQL === 'string') {
    // Since we've explicitly passed a string, we'll use that as the endpoint
    graphiQLEndpoint = config.graphiQL;
  } else if (config.graphQLServer) {
    // If we have an internal GraphQL server, AND we haven't set a string,
    // the default GraphiQL path should be the same as the server endpoint
    graphiQLEndpoint = config.graphQLEndpoint;
  } else {
    // Since we haven't set anything, AND we don't have an internal server,
    // by default we'll use `/graphql` which will work for an external server
    graphiQLEndpoint = '/graphql';
  }

  router.get(
    graphiQLEndpoint,
    graphiqlKoa({
      endpointURL: config.graphQLEndpoint,
    }),
  );
}

// Attach any custom routes we may have set in userland
config.routes.forEach(route => {
  router[route.method](route.route, ...route.handlers);
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

/* CUSTOM APP INSTANTIATION */

// Pass the `app` to do anything we need with it in userland. Useful for
// custom instantiation that doesn't fit into the middleware/route functions
if (typeof config.koaAppFunc === 'function') {
  config.koaAppFunc(app);
}

// Listener function that will start http(s) server(s) based on userland
// config and available ports
const listen = () => {
  // Spawn the listeners.
  const servers = [];

  // Plain HTTP
  if (config.enableHTTP) {
    servers.push(
      http.createServer(app.callback()).listen(process.env.PORT),
    );
  }

  // SSL -- only enable this if we have an `SSL_PORT` set on the environment
  if (process.env.SSL_PORT) {
    servers.push(
      https.createServer(config.sslOptions, app.callback()).listen(process.env.SSL_PORT),
    );
  }

  return servers;
};

// Export everything we need to run the server (in dev or prod)
export default {
  router,
  app,
  listen,
};
