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

/* Local */

// Grab the shared Apollo Client
import { serverClient } from 'kit/lib/apollo';

// Custom redux store creator.  This will allow us to create a store 'outside'
// of Apollo, so we can apply our own reducers and make use of the Redux dev
// tools in the browser
import createNewStore from 'kit/lib/redux';

// Initial view to send back HTML render
import Html from 'kit/views/ssr';

// App entry point
import App from 'src/app';

// Import paths.  We'll use this to figure out where our public folder is
// so we can serve static files
import PATHS from 'config/paths';

// ----------------------

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
    const client = serverClient();

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

    // Full React HTML render
    const html = ReactDOMServer.renderToString(components);

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
      // By default, just set the status code to 404.  You can add your
      // own custom logic here, if you want to redirect to a permanent
      // 404 route or set a different response on `ctx.body`
      ctx.status = routeContext.status;
    }

    // Render the view with our injected React data.  We'll pass in the
    // Helmet component to generate the <head> tag, as well as our Redux
    // store state so that the browser can continue from the server
    ctx.body = `<!DOCTYPE html>\n${ReactDOMServer.renderToStaticMarkup(
      <Html
        html={html}
        head={Helmet.rewind()}
        window={{
          webpackManifest: chunkManifest,
          __STATE__: store.getState(),
        }}
        css={css}
        scripts={scripts} />,
    )}`;
  };
}

// Run the server
export default (async function server() {
  return {
    router: (new KoaRouter())
      // Set-up a general purpose /ping route to check the server is alive
      .get('/ping', async ctx => {
        ctx.body = 'pong';
      })

      // Favicon.ico.  By default, we'll serve this as a 204 No Content.
      // If /favicon.ico is available as a static file, it'll try that first
      .get('/favicon.ico', async ctx => {
        ctx.res.statusCode = 204;
      }),
    app: new Koa()

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
      }),
  };
}());
