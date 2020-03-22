module.exports = {
  clearMocks: true,
  debug: false,
  timeout: 10000,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  setupFilesBeforeEnv: ['./jest.setup.js'],
  testMatch: ['**/*.test.ts'],
  testRunner: 'jest-circus/runner',
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: false
}
