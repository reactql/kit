// Simple class to act as a singleton for app-wide configuration.

// ----------------------
// IMPORTS

/* ReactQL */

// Get environment, to figure out where we're running the GraphQL server
import { getServerURL } from 'kit/lib/env';

// ----------------------

class Config {
  constructor() {
    // Store reducers in a `Map`, for easy key retrieval
    this.reducers = new Map();

    // Create a set for routes -- to retrieve based on insertion order
    this.routes = new Set();

    // By default, point the GraphQL URI to the server variant of the local
    // ReactQL project
    this.graphQLEndpoint = `${getServerURL()}/graphql`;

    // Enable body parsing by default.  Leave `koa-bodyparser` opts as default
    this.enableBodyParser = true;
    this.bodyParserOptions = {};
  }

  /* REDUX */

  // Adds a new reducer.  Checks that `reducer` fits the right shape, otherwise
  // throws an error
  addReducer(key, reducer) {
    if (typeof reducer !== 'object' || !reducer.state || typeof reducer.reducer !== 'function') {
      throw new Error(`Can't add reducer for '${key}' - reducer must be an object of {state, reducer}`);
    }
    this.reducers.set(key, reducer);
  }

  /* WEB SERVER / SSR */

  // Disable the optional `koa-bodyparser`, to prevent POST data being sent to
  // each request.  By default, body parsing is enabled.
  disableBodyParser() {
    this.enableBodyParser = false;
  }

  setBodyParserOptions(opt = {}) {
    this.bodyParserOptions = opt;
  }

  // Adds a custom server route to attach to our Koa router
  addRoute(method, route, handler) {
    this.routes.add({
      method,
      route,
      handler,
    });
  }

  // Adds custom GET route
  addGetRoute(route, handler) {
    this.addRoute('get', route, handler);
  }

  // Adds custom POST route
  addPostRoute(route, handler) {
    this.addRoute('post', route, handler);
  }

  // Adds custom PUT route
  addPutRoute(route, handler) {
    this.addRoute('put', route, handler);
  }

  // Adds custom PATCH route
  addPatchRoute(route, handler) {
    this.addRoute('patch', route, handler);
  }

  // Adds custom DELETE route
  addDeleteRoute(route, handler) {
    this.addRoute('delete', route, handler);
  }

  // 404 handler for the server.  By default, `kit/entry/server.js` will
  // simply return a 404 status code without modifying the HTML render.  By
  // setting a handler here, this will be returned instead
  set404Handler(func) {
    if (typeof func !== 'function') {
      throw new Error('404 handler must be a function');
    }
    this.handler404 = func;
  }

  /* GRAPHQL */

  // Add GraphQL server.  The only required parameter is `schema`, which is
  // a valid GraphQLSchema instance
  enableGraphQLServer(schema, endpoint = '/graphql', graphiql = true) {
    this.graphQLServer = {
      schema,
      endpoint,
      graphiql,
    };
  }

  // Set an external GraphQL URI for use with Apollo
  setGraphQLEndpoint(uri) {
    this.graphQLEndpoint = uri;
  }
}

// Since there's only one `Config` instance globally, we'll create the new
// instance here and export it.  This will then provide any subsequent imports
// with the same object, so we can add settings to a common config
export default new Config();
