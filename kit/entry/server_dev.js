/* eslint-disable no-console */

// Production server entry point.  Spawns the server on default HOST:PORT

// ----------------------
// IMPORTS

/* NPM */

// Static file handler
import koaStatic from 'koa-static';

// Chalk terminal library
import chalk from 'chalk';

/* Local */

// Import console messages
import { logServerStarted } from 'kit/lib/console';

// Import paths.  We'll use this to figure out where our public folder is
// so we can serve static files
import PATHS from 'config/paths';

// Extend the server base
import server, { createReactHandler } from './server';

// ----------------------

// Host and port -- from the environment
const HOST = process.env.SERVER_DEV_HOST || 'localhost';
const PORT = process.env.SERVER_DEV_PORT || 8081;

// Get manifest values
const css = '/assets/css/style.css';
const scripts = [
  'vendor.js',
  'browser.js'].map(key => `/${key}`);

// Spawn the server
server.then(({ router, app }) => {
  // Create proxy to tunnel requests to the browser `webpack-dev-server`
  router.get('/*', createReactHandler(css, scripts));

  // Connect the development routes to the server
  app
    .use(koaStatic(PATHS.distDev))
    .use(router.routes())
    .use(router.allowedMethods());

  app.listen({ host: HOST, port: PORT }, () => {
    logServerStarted({
      type: 'server-side rendering',
      host: HOST,
      port: PORT,
      chalk: chalk.bgYellow.black,
    });
  });
});
