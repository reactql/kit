module.exports = {
  coverageReporters: ['text'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
  ],
  transform: {
    '^.+\\.jsx?$': '<rootDir>/jest.transform.js',
  },
};
