module.exports = {
  coverageReporters: ['text'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
  ],
  transform: {
    '^.+\\.jsx?$': '<rootDir>/jest.transform.js',
  },
};
