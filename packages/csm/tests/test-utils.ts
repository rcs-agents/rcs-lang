// Simple mock function implementation for bun tests
export function createMockFn(implementation?: (...args: any[]) => any) {
  const calls: any[][] = [];
  const fn = (...args: any[]) => {
    calls.push(args);
    if (implementation) {
      return implementation(...args);
    }
  };
  
  fn.calls = calls;
  fn.mock = { calls };

  return fn;
}

// Create vi object for compatibility
export const vi = {
  fn: createMockFn
};