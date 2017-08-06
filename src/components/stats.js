// Simple <Stats> component that displays our current environment.

// ----------------------
// IMPORTS

/* NPM */

// React
import React from 'react';

/* App */

// Styles
import css from './stats.scss';

// ----------------------

export default () => {
  // We can pull the environment from `process.env.NODE_ENV`, which is set
  // to either 'development' | 'production' on both the server and in the browser
  const info = [
    ['Environment', process.env.NODE_ENV],
  ];

  return (
    <ul className={css.data}>
      {info.map(([key, val]) => (
        <li key={key}>{key}: <span>{val}</span></li>
      ))}
    </ul>
  );
};
