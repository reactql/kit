module.exports = {
  coverageReporters: ['text'],
  collectCoverageFrom: [
    'src/**/*.js(x)',
  ],
  transform: {
    '^.+\\.js(x)$': '<rootDir>/jest.transform.js',
  },
};
