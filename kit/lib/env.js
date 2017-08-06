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
const isProduction = process.env.NODE_ENV === 'production';
const isServer = typeof SERVER !== 'undefined' && SERVER;

// Returns the prefix of the variable on `process.env` that determines
// whether we're running in server or browser mode, and in production or dev
function getStub() {
  return `${isServer ? 'SERVER' : 'BROWSER'}_${isProduction ? 'PROD' : 'DEV'}`;
}

// Get browser stub
function getBrowserStub() {
  return `BROWSER_${isProduction ? 'PROD' : 'DEV'}`;
}

// Get server stub
function getServerStub() {
  return `SERVER_${isProduction ? 'PROD' : 'DEV'}`;
}

// Get the hostname for the server, based on the current environment
export function getHost() {
  return process.env[`${getStub()}_HOST`] || defaultHost;
}

// Get the server host -- based on the current environment
export function getServerHost() {
  return process.env[`${getServerStub()}_HOST`] || defaultHost;
}

// Get the browser host -- based on the current environment
export function getBrowserHost() {
  return process.env[`${getBrowserStub()}_HOST`] || defaultHost;
}

// Get the port, based on the current environment
export function getPort() {
  const port = process.env[`${getStub()}_PORT`];
  if (port) return port;

  // No clue from the environment -- work it out ourselves
  return defaultPorts[process.env.NODE_ENV][isServer ? 'server' : 'browser'];
}

// Get the browser port, based on the current environment
export function getBrowserPort() {
  const port = process.env[`${getBrowserStub()}_PORT`];
  if (port) return port;

  // No clue from the environment -- work it out ourselves
  return defaultPorts[process.env.NODE_ENV].browser;
}

// Get the server port, based on the current environment
export function getServerPort() {
  const port = process.env[`${getServerStub()}_PORT`];
  if (port) return port;

  // No clue from the environment -- work it out ourselves
  return defaultPorts[process.env.NODE_ENV].server;
}

// Get the protocol://host:port of where the current server would bind
export function getURL(ssl = false) {
  return `http${ssl ? 's' : ''}://${getHost()}:${getPort()}`;
}

// Get the protocol://host:port of where the current server would bind
export function getServerURL(ssl = false) {
  return `http${ssl ? 's' : ''}://${getServerHost()}:${getServerPort()}`;
}
