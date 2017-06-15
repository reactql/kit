/* eslint-disable no-underscore-dangle */

/*
Custom Redux store creation.  Instead of using the default Apollo store,
we'll create our own for each request so that we can easily layer in our
own reducers for store state outside of Apollo
*/

// ----------------------
// IMPORTS

/* NPM */
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import Immutable from 'seamless-immutable';

/* Local */

// Reducers -- CHANGE THIS TO REFLECT YOUR OWN REDUCERS!
import counterReducer from 'reducers/counter';

// ----------------------

// Detect if we're both in the browser, AND we have dehydrated state
const hasState = !!(!SERVER && window.__STATE__);

// All reducers, in one array -- CHANGE THIS TO REFLECT YOUR OWN REDUCERS!
const reducers = [counterReducer];

// Helper function that 'unwinds' the { reducerKey {state, reducer} } format
// from each imported reducer, and either returns the `reducer` function (if
// true) or the `state`, as an Immutable collection or the default state
function unwind(reducer = true) {
  // Get the combined reducers `reducer` or `state` object
  const r = Object.assign({},
    ...[].concat(...reducers.map(arr => Object.keys(arr).map(
      key => ({
        [key]: arr[key][reducer ? 'reducer' : 'state'],
      }),
    ))),
  );

  // If this is a reducer, return at this point
  if (reducer) return r;

  // We're looking for the state -- so let's map it
  return Object.assign({}, ...Object.keys(r).map(key => ({
    [key]: (hasState && Immutable(window.__STATE__[key])) || r[key],
  })));
}

export default function createNewStore(apolloClient) {
  const store = createStore(
    // By default, we'll use just the apollo reducer.  We can easily add our
    // own here, for global store management outside of Apollo
    combineReducers({
      apollo: apolloClient.reducer(),
      ...unwind(),
    }),
    // Initial server state, provided by the server.
    {
      apollo: (hasState && window.__STATE__.apollo) || {},
      ...unwind(false),
    },
    compose(
        applyMiddleware(
          apolloClient.middleware(),
          thunkMiddleware,
        ),
        // Enable Redux Devtools on the browser, for easy state debugging
        // eslint-disable-next-line no-underscore-dangle
        (!SERVER && typeof window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined') ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f,
    ),
  );

  return store;
}
