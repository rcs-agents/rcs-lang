Object.defineProperty(exports, '__esModule', { value: true });
const config_1 = require('vitest/config');
exports.default = (0, config_1.defineConfig)({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/test/**/*.test.ts'],
    exclude: ['node_modules', 'out'],
  },
});
//# sourceMappingURL=vitest.config.js.map
