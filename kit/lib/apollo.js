// ----------------------
// IMPORTS

/* NPM */

// Apollo client library
import { createNetworkInterface, ApolloClient } from 'react-apollo';

/* ReactQL */
import config from 'kit/config';

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
  return createClient({
    networkInterface: createNetworkInterface({
      uri: config.graphQLEndpoint,
    }),
  });
}
