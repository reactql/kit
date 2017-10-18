/* eslint-disable no-param-reassign */

// ----------------------
// IMPORTS

/* NPM */
import React from 'react';
import PropTypes from 'prop-types';

// Browser history, that we can use to control URL pushstate throughout our
// entire app
import createBrowserHistory from 'history/createBrowserHistory';

// React Router
import { Route, Redirect as ReactRouterRedirect } from 'react-router-dom';

// ----------------------

// Create and export a custom history
export const history = !SERVER && createBrowserHistory();

// <Status code="xxx"> component.  Updates the context router's context, which
// can be used by the server handler to respond to the status on the server.
class Status extends React.PureComponent {
  static propTypes = {
    code: PropTypes.number.isRequired,
    children: PropTypes.node,
  }

  static defaultProps = {
    children: null,
  }

  render() {
    const { code, children } = this.props;
    return (
      <Route render={({ staticContext }) => {
        if (staticContext) {
          staticContext.status = code;
        }
        return children;
      }} />
    );
  }
}

// <NotFound> component.  If this renders on the server in development mode,
// it will attempt to proxyify the request to the upstream `webpack-dev-server`.
// In production, it will issue a hard 404 and render.  In the browser, it will
// simply render.
export class NotFound extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node,
  }

  static defaultProps = {
    children: null,
  }

  render() {
    const { children } = this.props;

    return (
      <Status code={404}>
        {children}
      </Status>
    );
  }
}

// <Redirect> component. Mirrors React Router's component by the same name,
// except it sets a 301/302 status code for setting server-side HTTP headers.
export class Redirect extends React.PureComponent {
  static propTypes = {
    to: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]).isRequired,
    from: PropTypes.string,
    push: PropTypes.bool,
    permanent: PropTypes.bool,
  };

  static defaultProps = {
    from: null,
    push: false,
    permanent: false,
  }

  render() {
    const {
      to,
      from,
      push,
      permanent,
    } = this.props;

    const code = permanent ? 301 : 302;
    return (
      <Status code={code}>
        <ReactRouterRedirect to={to} from={from} push={push} />
      </Status>
    );
  }
}
