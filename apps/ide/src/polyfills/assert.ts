// Browser polyfill for assert module
export function assert(condition: any, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

export function ok(condition: any, message?: string): asserts condition {
  assert(condition, message);
}

export function equal(actual: any, expected: any, message?: string): void {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

export function notEqual(actual: any, expected: any, message?: string): void {
  if (actual === expected) {
    throw new Error(message || `Expected values to be different`);
  }
}

export function deepEqual(actual: any, expected: any, message?: string): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

export function throws(fn: () => any, message?: string): void {
  try {
    fn();
    throw new Error(message || 'Expected function to throw');
  } catch (e) {
    // Expected
  }
}

export default assert;
