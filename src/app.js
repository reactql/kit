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
import counterReducer from 'src/reducers/counter';

// Main component -- i.e. the 'root' React component in our app
import Main from 'src/components/main';

// Init global styles.  These will be added to the resulting CSS automatically
// without any class hashing.  Use this to include default or framework CSS.
import './styles.global.css';

// ----------------------

/* REDUCERS */

// Add our custom `counter` reducer.  This must follow the shape
// {state, reducer()}, otherwise it will throw an error
config.addReducer('counter', counterReducer);

// Set our server config, by checking `SERVER` -- this code path will be
// eliminated by Webpack in the browser, so we can safely add this.

if (SERVER) {
  /* GRAPHQL */

  // If we're running on the server, create a built-in GraphQL server using
  // custom schema.  By default, this will bind to /graphql -- POST will
  // handle GraphQL requests; GET will display the GraphiQL query interface
  //
  // Apollo will attempt to connect to /graphql automatically.  We'll run
  // this only on the server, to avoid the bloat of loading unnecessary GraphQL
  // schema and types on the client
  config.enableGraphQLServer(require('src/graphql/schema').default);

  /* CUSTOM ROUTES */

  // We can add custom routes to the web server easily, by using
  // `config.add<Get|Post|Put|Patch>Route()`.  Note:  These are server routes only.
  config.addGetRoute('/test', async ctx => {
    ctx.body = 'Hello from your ReactQL route.';
  });

  /* CUSTOM 404 HANDLER */

  // By default, if the server gets a route request that results in a 404,
  // it will set `ctx.status = 404` but continue to render the <NotFound>
  // block as normal.  If we want to add our own custom handler, we can use
  // `config.set404Handler()` as below.
  //
  // Note:  This only applies to SERVER routes.  On the client, the
  // <NotFound> block will *always* run.

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
}

// In app.js, we need to export the root component we want to mount as the
// starting point to our app.  We'll just export the `<Main>` component.
export default Main;
