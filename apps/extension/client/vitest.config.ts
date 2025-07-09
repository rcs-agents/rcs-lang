import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: [
      '**/node_modules/**',
      '**/out/**',
      '**/dist/**',
      // Exclude tests that require VSCode test environment
      '**/commands.test.ts',
      '**/compilationService.test.ts',
      '**/integration.test.ts',
      '**/utils.test.ts',
      '**/runTest.ts',
      '**/runIntegrationTest.ts',
      '**/suite/**',
      // Exclude tests that import vscode directly (need VSCode environment)
      '**/interactiveDiagram.comprehensive.test.ts',
      '**/interactiveDiagram.integration.test.ts',
      '**/interactiveDiagramEnhanced.test.js',
      '**/interactiveDiagramIntegration.test.js',
      '**/interactiveDiagramWebview.test.ts',
    ],
  },
});
