/* eslint-disable import/prefer-default-export */

// Environment-aware functions

// Get the protocol://host:port of where the current server would bind
export function getServerURL(host = process.env.HOST, port = process.env.PORT, allowSSL = true) {
  // Check for SSL
  if (allowSSL && process.env.SSL_PORT) {
    const stub = `https://${host || process.env.HOST}`;

    // If we're on port 443, that's 'regular' SSL so no need to specify port
    if (process.env.SSL_PORT === '443') return stub;
    return `${stub}:${process.env.SSL_PORT}`;
  }

  // Plain HTTP
  const stub = `http://${host || process.env.HOST}`;

  // If we're on port 80, that's 'regular' HTTP so no need to specify port
  if (port === '80') return stub;
  return `${stub}:${port}`;
}
