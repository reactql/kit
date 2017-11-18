// Your app's entry point.  Every ReactQL projects requires 'src/app.js',
// which both the server and browser will import.
//
// In this file, you'll do two things:
//
// 1.  Import `kit/config`, and configure your app.  In this example, I'm
// adding a custom Redux reducer that acts as a simple counter, and enabling
// a built-in GraphQL server that imports a schema for a simple message.
//
// 2.  Export the root React component that goes between <div id="main"/>
// in the server-side HTML.

// ----------------------
// IMPORTS

/* ReactQL */

// Config API, for adding reducers and configuring our ReactQL app
import config from 'kit/config';

/* App */

// Example counter reducer.  This simply increments the counter by +1
import counterReducer from 'reducers/counter';

// Main component -- i.e. the 'root' React component in our app
import Main from 'components/main';

// Init global styles.  These will be added to the resulting CSS automatically
// without any class hashing.  Use this to include default or framework CSS.
import './styles.global.css';

// ----------------------

/* REDUCERS */

// Add our custom `counter` reducer, with the initial state as a zero count.
// Note:  The initial state (3rd param) will automatically be wrapped in
// `seamless-immutable` by the kit's Redux init code, so plain objects are
// automatically immutable by default
config.addReducer('counter', counterReducer, { count: 0 });

/* GRAPHQL */

// Enable the internal GraphQL server.  This will do two things:
//
// 1.  On the server, it will set-up the necessary route handlers to 'listen'
// to incoming GraphQL requests on `/graphql`, as well as (by default) set-up
// the GraphiQL IDE
//
// 2.  On the client, it will append the correct server URL so that we can
// call the ReactQL host properly, and let the server handle our requests
config.enableGraphQLServer();

/* SERVER */

// Set our server config, by checking `SERVER` -- this code path will be
// eliminated by Webpack in the browser, so we can safely add this.

if (SERVER) {
  /* SSL */

  // By default, the Koa web server runs on a plain HTTP server. However,
  // you can easily enable HTTPS.  In the following commands, I grab a sample
  // self-signed key/cert combo and call `config.enableSSL()` with the options
  // I want to pass to the `https.createServer()` that happens under the hood.
  //
  // Note: Running https:// in your browser using this self-signed cert will
  // undoubtably raise a security error. But at least we can see it's working.
  //
  // Production note: I generally recommend using a dedicated upstream proxy
  // such as Nginx to handle HTTPS traffic, since the TLS handshake will likely
  // be faster, and you can add HTTP/2 and have much finer-grain control over
  // HTTP. But, if you need a fast SSL service, ReactQL has you covered!

  /*
    Uncomment the next two lines to enable SSL!
  */

  // const cert = require('src/cert/self_signed');
  // config.enableSSL({ key: cert.key, cert: cert.cert });

  // If wanted, you could also run an *SSL-only* server by uncommenting:
  // config.disableHTTP();

  // Or, you could automatically redirect non-HTTP traffic to SSL by
  // uncommenting the following: (Note: pass { port: 8081 }) for development
  // or { port: 4000 } for the default production port
  // config.forceSSL({ port: 8081 });

  /* GRAPHQL SCHEMA */
  // Pass in the schema to use for our internal GraphQL server.  Note we're
  // doing this inside a `SERVER` block to avoid importing a potentially large
  // file, which would then inflate our client bundle unnecessarily
  config.setGraphQLSchema(require('src/graphql/schema').default);

  /* CUSTOM ROUTES */

  // We can add custom routes to the web server easily, by using
  // `config.add<Get|Post|Put|Patch>Route()`.  Note:  These are server routes only.
  config.addGetRoute('/test', async ctx => {
    // For demo purposes, let's get a JSON dump of the current Redux state
    // to see that we can expect its contents
    const stateDump = JSON.stringify(ctx.store.getState());

    // Display a simple message, along with the Redux dump.  Note that this
    // won't contain a full `apollo` response, because it hasn't passed through
    // the React handler -- but it *does* mean we can still manipulate the state
    // from within our root, or fire action handlers!
    ctx.body = `Hello from your ReactQL route. Redux dump: ${stateDump}`;
  });

  /* CUSTOM 404 HANDLER */

  // By default, if the server gets a route request that results in a 404,
  // it will set `ctx.status = 404` but continue to render the <NotFound>
  // block as normal.  If we want to add our own custom handler, we can use
  // `config.set404Handler()` as below.
  //
  // Note:  This only applies to SERVER routes.  On the client, the
  // <NotFound> block will *always* run.

  config.set404Handler(ctx => {
    // Like above, we'll grab a dump of the store state again -- this time,
    // it *will* contain a full `apollo` dump because in order to figure out that
    // a route has hit a 404, it will already have rendered the React chain
    // and retrieved any relevant GraphQL
    const stateDump = JSON.stringify(ctx.store.getState());

    // Explicitly set the return status to 404.  This is done for us by
    // default if we don't have a custom 404 handler, but left to the function
    // otherwise (since we might not always want to return a 404)
    ctx.status = 404;

    // Set the body
    ctx.body = `This route does not exist on the server - Redux dump: ${stateDump}`;
  });

  /* CUSTOM ERROR HANDLER */

  // By default, any exceptions thrown anywhere in the middleware chain
  // (including inside the `createReactHandler` func) will propogate up the
  // call stack to a default error handler that simply logs the message and
  // informs the user that there's an error.  We can override that default
  // behaviour with a func with a (e, ctx, next) -> {} signature, where `e` is
  // the error thrown, `ctx` is the Koa context object, and `next()` should
  // be called if you want to recover from the error and continue processing
  // subsequent middleware.  Great for logging to third-party tools, tc.
  config.setErrorHandler((e, ctx /* `next` is unused in this example */) => {
    // Mimic the default behaviour with an overriden message, so we know it's
    // working
    // eslint-disable-next-line no-console
    console.log('Custom error: ', e.message);
    ctx.body = 'Some kind of error. Check your source code.';
  });

  /* CUSTOM KOA APP INSTANTIATION */

  // If you need to do something with `app` outside of middleware/routing,
  // you can pass a func to `config.getKoaApp()` that will be fed the `app`
  // instance directly.
  config.getKoaApp(app => {
    // First, we'll add a new `engine` key to the app.context`
    // prototype (that per-request `ctx` extends) that can be
    // used in the middleware below, to set a `Powered-By` header.
    // eslint-disable-next-line no-param-reassign
    app.context.engine = 'ReactQL';

    // We'll also add a generic error handler, that prints out to the console.
    // Note: This is a 'lower-level' than `config.setErrorHandler()` because
    // it's not middleware -- it's for errors that happen at the server level
    app.on('error', e => {
      // This function should never show up, because `config.setErrorHandler()`
      // is already catching errors -- but just an FYI for what you might do.
      // eslint-disable-next-line no-console
      console.error('Server error:', e);
    });
  });

  /* CUSTOM MIDDLEWARE */

  // We can set custom middleware to be processed on the server.  This gives us
  // fine-grain control over headers, requests, responses etc, and even decide
  // if we want to avoid the React handler until certain conditions

  // There are two flavours of middleware -- `before` middleware, which
  // executes in Koa before the per-request Apollo client / Redux store has
  // been instantiated... and can be called with `confiig.addBeforeMiddleware`

  // ... and 'after' middleware, which runs after per-request instantiation.
  // Let's use the latter to add a custom header so we can see middleware in action
  config.addMiddleware(async (ctx, next) => {
    ctx.set('Powered-By', ctx.engine); // <-- `ctx.engine` from `config.getKoaApp()` above!

    // For the fun of it, let's demonstrate that we can fire Redux actions
    // and it'll manipulate the state on the server side!  View the SSR version
    // to see that the counter is now 1 and has been passed down the wire
    ctx.store.dispatch({ type: 'INCREMENT_COUNTER' });

    // Always return `next()`, otherwise the request won't 'pass' to the next
    // middleware in the stack (likely, the React handler)
    return next();
  });
}

// In app.js, we need to export the root component we want to mount as the
// starting point to our app.  We'll just export the `<Main>` component.
export default Main;
