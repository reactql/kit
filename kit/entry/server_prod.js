/* eslint-disable no-console */

// Production server entry point.  Spawns the server on default HOST:PORT

// ----------------------
// IMPORTS

/* Node */

import path from 'path';

// Needed to read manifest files
import { readFileSync } from 'fs';

/* Local */

// Import paths.  We'll use this to figure out where our public folder is
// so we can serve static files
import PATHS from 'config/paths';

// Local environment
import { getHost, getPort } from 'kit/lib/env';

// Import console messages
import { logServerStarted } from 'kit/lib/console';

// Extend the server base
import server, { createReactHandler, staticMiddleware } from './server';

// ----------------------

// Host and port -- from the environment
const HOST = getHost();
const PORT = getPort();

// Read in manifest files
const [manifest, chunkManifest] = ['manifest', 'chunk-manifest'].map(
  name => JSON.parse(
    readFileSync(path.resolve(PATHS.dist, `${name}.json`), 'utf8'),
  ),
);

// Get manifest values
const css = manifest['browser.css'];
const scripts = [
  'manifest.js',
  'vendor.js',
  'browser.js'].map(key => manifest[key]);

// Spawn the server
server.then(({ router, app }) => {
  // Connect the production routes to the server
  router.get('/*', createReactHandler(css, scripts, chunkManifest));
  app
    .use(staticMiddleware())
    .use(router.routes())
    .use(router.allowedMethods());

  app.listen({ host: HOST, port: PORT }, () => {
    logServerStarted({
      type: 'server',
      host: HOST,
      port: PORT,
    });
  });
});
