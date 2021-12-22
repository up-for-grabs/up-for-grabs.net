module.exports = {
  roots: ['<rootDir>/js/', '<rootDir>/tests/'],
  testMatch: ['**/spec/**/*.js'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  automock: false,
  setupFiles: [
    './tests/setupJest.js'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'js/**/*.js',
    // infrastructure, should be ignored
    '!js/lib/require.js',
    '!js/app.js'

  ],
  coverageReporters: ['text-summary', 'json', 'html', 'cobertura'],
};
