/** Jest config for backend integration tests (requires a test PostgreSQL DB). */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  // Integration tests touch the DB; run serially.
  maxWorkers: 1,
  testTimeout: 20000,
};
