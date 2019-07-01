module.exports = {
  roots: ["<rootDir>/javascripts/", "<rootDir>/tests/"],
  testMatch: ["**/spec/**/*.js"],
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },
  automock: false,
  setupFiles: [
    "./tests/setupJest.js"
  ]
};
