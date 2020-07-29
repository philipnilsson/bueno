module.exports = {
  rootDir: 'src',
  testRegex: '.*\.test\.ts',
  setupFilesAfterEnv: ['<rootDir>/__test__/setupTests.js'],
  transform: {
    "^.+\\.ts$": "ts-jest"
  }
};
