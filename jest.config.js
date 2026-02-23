export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/*-test.js'],
  transform: {},
  moduleFileExtensions: ['js'],
  verbose: true,
  testEnvironmentOptions: {
    NODE_OPTIONS: '--experimental-vm-modules'
  }
};
