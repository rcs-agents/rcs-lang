import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import solid from 'vite-plugin-solid'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    solid(),
    dts({
      include: ['src'],
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: {
        // Only build react for now - index/lit/solid have build issues
        react: resolve(__dirname, 'src/react/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'lit', 'solid-js', 'solid-js/web', '@rcs-lang/csm', '@rcs-lang/types', 'lucide-react'],
    },
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
    },
  },
  optimizeDeps: {
    exclude: ['crypto'],
  },
  assetsInclude: ['**/*.otf', '**/*.ttf', '**/*.woff', '**/*.woff2'],
})
