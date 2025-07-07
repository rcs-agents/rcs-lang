// Vitest setup file for CLI tests
import { beforeAll, afterAll } from 'vitest';

// Global test setup
beforeAll(() => {
  console.log('Setting up CLI tests');
});

afterAll(() => {
  console.log('Cleaning up CLI tests');
});