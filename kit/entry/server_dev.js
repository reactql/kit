/* eslint-disable no-console */

// Production server entry point.  Spawns the server on default HOST:PORT

// ----------------------
// IMPORTS

/* NPM */

// Chalk terminal library
import chalk from 'chalk';

/* Local */

// Import console messages
import { logServerStarted } from 'kit/lib/console';

// Extend the server base
import server, { createReactHandler, staticMiddleware } from './server';

// ----------------------

// Get manifest values
const css = '/assets/css/style.css';
const scripts = [
  'vendor.js',
  'browser.js'].map(key => `/${key}`);

// Spawn the development server.
// Runs inside an immediate `async` block, to await listening on ports
(async () => {
  const { app, router, listen } = server;

  // Create proxy to tunnel requests to the browser `webpack-dev-server`
  router.get('/*', createReactHandler(css, scripts));

  // Connect the development routes to the server
  app
    .use(staticMiddleware())
    .use(router.routes())
    .use(router.allowedMethods());

  // Spawn the server
  listen();

  // Log to the terminal that we're ready for action
  logServerStarted({
    type: 'server-side rendering',
    chalk: chalk.bgYellow.black,
  });
})();
