module.exports = {
  roots: ['<rootDir>/javascripts/', '<rootDir>/tests/'],
  testMatch: ['**/spec/**/*.js'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  moduleNameMapper: {
    'tag-builder': '<rootDir>javascripts/tag-builder.js',
    'project-ordering': '<rootDir>javascripts/project-ordering.js'
  },
  automock: false,
  setupFiles: [
    './tests/setupJest.js'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'javascripts/**/*.js',
    // infrastructure, should be ignored
    '!javascripts/lib/require.js',
    '!javascripts/app.js'

  ],
  coverageReporters: ['text-summary', 'json', 'html', 'cobertura'],
};
