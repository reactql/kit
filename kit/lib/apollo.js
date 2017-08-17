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
// passed options alongside the defaults
export function createClient(opt = {}) {
  return new ApolloClient(Object.assign({
    reduxRootSelector: state => state.apollo,
  }, opt));
}

// Creates a new browser client
export function browserClient() {
  // If we have an internal GraphQL server, we need to append it with a
  // call to `getServerURL()` to add the correct host (in dev + production)
  const uri = config.graphQLServer
    ? `${getServerURL()}${config.graphQLEndpoint}` : config.graphQLEndpoint;

  return createClient({
    networkInterface: createNetworkInterface({
      // If we have an internal GraphQL server, then we should append the
      // URL with `getServerURL()` to get the correct hostname
      uri,
    }),
  });
}
