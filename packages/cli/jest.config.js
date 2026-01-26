module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/dist', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    'dist/**/*.js',
    '!dist/index.js', // CLI entry point
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};