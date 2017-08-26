// ----------------------
// IMPORTS

/* NPM */

// Apollo client library
import { createNetworkInterface, ApolloClient } from 'react-apollo';

/* ReactQL */

// Configuration
import config from 'kit/config';

// Get environment, to figure out where we're running the GraphQL server
import { getServerURL } from 'kit/lib/env';

// ----------------------

// Helper function to create a new Apollo client, by merging in
// passed options alongside any set by `config.setApolloOptions` and defaults
export function createClient(opt = {}) {
  return new ApolloClient(Object.assign({
    reduxRootSelector: state => state.apollo,
  }, config.apolloClientOptions, opt));
}

// Wrap `createNetworkInterface` to attach middleware
export function getNetworkInterface(uri) {
  const networkInterface = createNetworkInterface({
    uri,
    opts: config.apolloNetworkOptions,
  });

  // Attach middleware
  networkInterface.use(config.apolloMiddleware.map(f => ({ applyMiddleware: f })));
  networkInterface.useAfter(config.apolloAfterware.map(f => ({ applyAfterware: f })));

  return networkInterface;
}

// Creates a new browser client
export function browserClient() {
  // If we have an internal GraphQL server, we need to append it with a
  // call to `getServerURL()` to add the correct host (in dev + production)
  const uri = config.graphQLServer
    ? `${getServerURL()}${config.graphQLEndpoint}` : config.graphQLEndpoint;

  return createClient({
    networkInterface: getNetworkInterface(uri),
  });
}
