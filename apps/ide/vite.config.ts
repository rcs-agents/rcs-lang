import { resolve } from 'node:path';
import inject from '@rollup/plugin-inject';
import { defineConfig } from 'vite';

// Custom plugin to handle assert polyfill
const assertPolyfillPlugin = () => {
  return {
    name: 'assert-polyfill',
    transform(code, id) {
      // Only transform antlr4ts files
      if (id.includes('node_modules/antlr4ts')) {
        // Replace require("assert") with our polyfill
        if (code.includes('require("assert")')) {
          return {
            code:
              `import assert from '${resolve(__dirname, 'src/polyfills/assert.ts')}';\n` +
              code.replace(/const assert = require\("assert"\);?/g, ''),
            map: null,
          };
        }
      }
      return null;
    },
  };
};

export default defineConfig({
  plugins: [assertPolyfillPlugin()],
  define: {
    global: 'globalThis',
    'process.env': '{}',
    'process.env.NODE_ENV': '"production"',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // Add explicit aliases for workspace packages - point to dist for built packages
      '@rcs-lang/parser': resolve(__dirname, '../../packages/parser/dist'),
      '@rcs-lang/compiler': resolve(__dirname, '../../packages/compiler/dist'),
      '@rcs-lang/core': resolve(__dirname, '../../libs/core/dist'),
      '@rcs-lang/validation': resolve(__dirname, '../../libs/validation/dist'),
      '@rcs-lang/ast': resolve(__dirname, '../../packages/ast/dist'),
      '@rcs-lang/diagram': resolve(__dirname, '../../packages/diagram/src'),
      '@rcs-lang/file-system': resolve(__dirname, '../../libs/file-system/src'),
      // Browser polyfills for Node.js modules
      assert: resolve(__dirname, 'src/polyfills/assert.ts'),
      util: resolve(__dirname, 'src/polyfills/util.ts'),
      path: resolve(__dirname, 'src/polyfills/path.ts'),
      fs: resolve(__dirname, 'src/polyfills/fs.ts'),
      'node:assert': resolve(__dirname, 'src/polyfills/assert.ts'),
      'node:util': resolve(__dirname, 'src/polyfills/util.ts'),
      'node:path': resolve(__dirname, 'src/polyfills/path.ts'),
      'node:fs': resolve(__dirname, 'src/polyfills/fs.ts'),
      'node:fs/promises': resolve(__dirname, 'src/polyfills/fs-promises.ts'),
      'fs/promises': resolve(__dirname, 'src/polyfills/fs-promises.ts'),
    },
  },
  server: {
    port: 4000,
    host: true,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      plugins: [
        inject({
          assert: [resolve(__dirname, 'src/polyfills/assert.ts'), 'default'],
          modules: {
            assert: [resolve(__dirname, 'src/polyfills/assert.ts'), 'default'],
          },
        }),
      ],
    },
    commonjsOptions: {
      include: [/node_modules/, /packages/, /libs/],
      transformMixedEsModules: true,
      requireReturnsDefault: 'auto',
      namedExports: {
        'antlr4ts/atn/LexerATNSimulator': ['LexerATNSimulator'],
        'antlr4ts/atn/ATNDeserializer': ['ATNDeserializer'],
        'antlr4ts/VocabularyImpl': ['VocabularyImpl'],
        'antlr4ts/misc/Utils': ['Utils'],
      },
    },
  },
  optimizeDeps: {
    // Force pre-bundling of dependencies
    include: [
      'monaco-editor',
      'antlr4ts',
      'antlr4ts/CharStreams',
      'antlr4ts/CommonTokenStream',
      'antlr4ts/atn/LexerATNSimulator',
      'antlr4ts/atn/ATNDeserializer',
      'antlr4ts/VocabularyImpl',
      'antlr4ts/misc/Utils',
      'antlr4ts/atn/ATN',
      'antlr4ts/atn/ATNSimulator',
      'antlr4ts/Token',
      'antlr4ts/Lexer',
      'antlr4ts/tree/AbstractParseTreeVisitor',
      'antlr4ts/tree/TerminalNode',
      'antlr4ts/ParserRuleContext',
      'monaco-editor/esm/vs/editor/editor.api.js',
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        {
          name: 'replace-assert',
          setup(build) {
            // Replace require("assert") with a browser-compatible version
            build.onLoad({ filter: /node_modules\/antlr4ts.*\.js$/ }, async (args) => {
              const fs = await import('fs');
              let contents = await fs.promises.readFile(args.path, 'utf8');

              // Replace require("assert") with our polyfill
              if (contents.includes('require("assert")')) {
                contents =
                  `
                  const assert = function(condition, message) {
                    if (!condition) {
                      throw new Error(message || 'Assertion failed');
                    }
                  };
                ` + contents.replace(/const assert = require\("assert"\);?/g, '');
              }

              return { contents, loader: 'js' };
            });
          },
        },
      ],
    },
    // Exclude all workspace packages from optimization
    exclude: [
      '@rcs-lang/parser',
      '@rcs-lang/compiler',
      '@rcs-lang/core',
      '@rcs-lang/validation',
      '@rcs-lang/ast',
      '@rcs-lang/diagram',
      '@rcs-lang/file-system',
    ],
  },
  // Enable esbuild for faster builds
  esbuild: {
    target: 'es2020',
    keepNames: true,
  },
});
