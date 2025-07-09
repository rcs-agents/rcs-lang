// Pre-bundle the parser with assert polyfill for browser usage
(globalThis as any).assert = (condition: any, message?: string) => {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
};

// Export parser components
export { ParserFactory, AntlrRclParser } from '@rcl/parser';
