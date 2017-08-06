// Example of CSS, SASS and LESS styles being used together

// ----------------------
// IMPORTS

/* NPM */
import React from 'react';

/* App */

// Styles
import css from './styles.css';
import sass from './styles.scss';
import less from './styles.less';

// ----------------------

export default () => (
  <ul className={css.styleExamples}>
    <li className={css.example}>Styled by CSS</li>
    <li className={sass.example}>Styled by SASS</li>
    <li className={less.example}>Styled by LESS</li>
  </ul>
);
