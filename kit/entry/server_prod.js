/* eslint-disable no-console */

// Production server entry point.  Spawns the server on default HOST:PORT

// ----------------------
// IMPORTS

/* Node */

import path from 'path';

// Needed to read manifest files
import { readFileSync } from 'fs';

/* NPM */

// Static file handler
import koaStatic from 'koa-static';

/* Local */

// Import paths.  We'll use this to figure out where our public folder is
// so we can serve static files
import PATHS from 'config/paths';

// Import console messages
import { logServerStarted } from 'kit/lib/console';

// Extend the server base
import server, { createReactHandler } from './server';

// ----------------------

// Host and port -- from the environment
const HOST = process.env.SERVER_PROD_HOST || 'localhost';
const PORT = process.env.SERVER_PROD_PORT || 4000;

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
    // Serve static files from our dist/public directory, which is where
    // the compiled JS, images, etc will wind up.  Note this is being checked
    // FIRST before any routes -- static files always take priority
    .use(koaStatic(PATHS.public, {
      // All asset names contain the hashes of their contents so we can
      // assume they are immutable for caching
      maxage: 31536000000,
      // Don't defer to middleware.  If we have a file, serve it immediately
      defer: false,
    }))
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
