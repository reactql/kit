/* eslint-disable no-underscore-dangle */

/*
Custom Redux store creation.  Along with the default Apollo store,
we can define custom reducers using `kit/config.addReducer()` which will
be available on the server and in the browser.

Store state is wrapped by `seamless-immutable` to enforce a pattern of
immutability, to prevent weird side effects.
*/

// ----------------------
// IMPORTS

/* NPM */
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import Immutable from 'seamless-immutable';

/* Local */
import config from 'kit/config';

// ----------------------

// Detect if we're both in the browser, AND we have dehydrated state
const hasState = !!(!SERVER && window.__STATE__);

// Helper function that 'unwinds' the `config.reducers` Map, and provides
// the `reducer` function or `initialState` (wrapped in `seamless-immutable`)
// depending on what we asked for
function unwind(reducer = true) {
  // Unwind `config.reducers`.  If we're looking for the `reducer`, we'll
  // wrap this in a `defaultReducer` function that properly handles the Redux
  // 'undefined' sentinel value, or calls 'real' reducer if it's not undefined.
  //
  // If we're not looking for reducers, it'll pull out the `initialState`
  // variable instead, which we'll further process below
  const r = Object.assign({},
    ...[].concat([...config.reducers].map(arr => ({
      [arr[0]]: reducer ? function defaultReducer(state, action) {
        // If `state` === undefined, this is Redux sending a sentinel value
        // to check our set-up.  So we'll send back a plain object to prove
        // that we're properly handling our reducer
        if (typeof state === 'undefined') return {};

        // Otherwise, call our real reducer with the {state, action}
        return arr[1].reducer(state, action);
      } : arr[1].initialState,
    }))),
  );

  // If this is a reducer, return at this point
  if (reducer) return r;

  // If not, we're looking for the state -- so let's map it and wrap the
  // object in `seamless-immutable`, to avoid side-effects with Redux
  return Object.assign({}, ...Object.keys(r).map(key => ({
    [key]: Immutable((hasState && (window.__STATE__[key])) || r[key]),
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
