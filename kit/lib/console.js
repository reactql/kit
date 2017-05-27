/* eslint-disable import/prefer-default-export, no-console */


// ----------------------
// IMPORTS

/* NPM */

// Display a border around a message
import boxen from 'boxen';

// Chalk library, to add colour to our console logs
import chalk from 'chalk';

// IP library, for determining the local network interface
import ip from 'ip';

// ----------------------

export function logServerStarted(opt = {}) {
  let message = chalk.green(`Running ${(opt.chalk || chalk.bold)(opt.type)} in ${chalk.bold(process.env.NODE_ENV)} mode\n\n`);

  const localURL = `http://${opt.host}:${opt.port}`;
  message += `- ${chalk.bold('Local:           ')} ${localURL}`;

  try {
    const url = `http://${ip.address()}:${opt.port}`;
    message += `\n- ${chalk.bold('On Your Network: ')} ${url}`;
  } catch (err) { /* ignore errors */ }

  console.log(
    boxen(message, {
      padding: 1,
      borderColor: 'green',
      margin: 1,
    }),
  );
}
