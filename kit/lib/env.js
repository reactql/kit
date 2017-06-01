// Environment-aware functions

// Default host that any server should bind to.  This is generally just
// 'localhost', for all server types
const defaultHost = 'localhost';

// Default ports.  Various modes (development, production) and various server
// types (browser, server, static) are catered for
const defaultPorts = {
  production: {
    server: 4000,
  },
  development: {
    browser: 8080,
    server: 8081,
  },
};

// Determines whether we're currently running in production
const isProduction = !!process.env.NODE_ENV === 'production';
const isServer = typeof SERVER !== 'undefined' && SERVER;

// Returns the prefix of the variable on `process.env` that determines
// whether we're running in server or browser mode, and in production or dev
function getStub() {
  return `${isServer ? 'SERVER' : 'BROWSER'}_${isProduction ? 'PROD' : 'DEV'}`;
}

// Get the hostname for the server, based on the current environment
export function getHost() {
  return process.env[`${getStub()}_HOST`] || defaultHost;
}

// Get the port for the server, based on the current environment
export function getPort() {
  const port = process.env[`${getStub()}_PORT`];
  if (port) return port;

  // No clue from the environment -- work it out ourselves
  return defaultPorts[process.env.NODE_ENV][isServer ? 'server' : 'browser'];
}

// Get the protocol://host:port of where the current server would bind
export function getURL() {
  return `http://${getHost()}:${getPort()}`;
}
