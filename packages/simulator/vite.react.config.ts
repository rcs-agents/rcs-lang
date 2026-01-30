import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/react', 'src/core'],
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: {
        react: resolve(__dirname, 'src/react/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@rcs-lang/csm',
        '@rcs-lang/rcx',
        '@rcs-lang/types',
        'lucide-react',
      ],
    },
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
    },
  },
})
