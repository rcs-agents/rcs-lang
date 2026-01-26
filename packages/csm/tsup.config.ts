import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
    entry: ['src/index.ts'],
  },
  clean: true,
  sourcemap: true,
  minify: true,
  splitting: false,
  treeshake: true,
  target: 'es2022',
  external: [],
  noExternal: [],
  tsconfig: 'tsconfig.json',
});
