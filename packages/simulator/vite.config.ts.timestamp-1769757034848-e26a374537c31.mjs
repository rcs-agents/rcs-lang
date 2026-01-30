// vite.config.ts
import { defineConfig } from "file:///work/rcs/rcl/node_modules/.bun/vite@5.4.21+53e8dc97309a5b25/node_modules/vite/dist/node/index.js";
import react from "file:///work/rcs/rcl/node_modules/.bun/@vitejs+plugin-react@4.7.0+587b416e12753ae7/node_modules/@vitejs/plugin-react/dist/index.js";
import solid from "file:///work/rcs/rcl/node_modules/.bun/vite-plugin-solid@2.11.10+eed251a3aef12466/node_modules/vite-plugin-solid/dist/esm/index.mjs";
import dts from "file:///work/rcs/rcl/node_modules/.bun/vite-plugin-dts@3.9.1+4b96dc1e8fd36ef1/node_modules/vite-plugin-dts/dist/index.mjs";
import { resolve } from "path";
var __vite_injected_original_dirname = "/work/rcs/rcl/packages/simulator";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    solid(),
    dts({
      include: ["src"],
      insertTypesEntry: true
    })
  ],
  build: {
    lib: {
      entry: {
        // Only build react for now - index/lit/solid have build issues
        react: resolve(__vite_injected_original_dirname, "src/react/index.ts")
      },
      formats: ["es"]
    },
    rollupOptions: {
      external: ["react", "react-dom", "lit", "solid-js", "solid-js/web", "@rcs-lang/csm", "@rcs-lang/types", "lucide-react"]
    }
  },
  resolve: {
    alias: {
      crypto: "crypto-browserify"
    }
  },
  optimizeDeps: {
    exclude: ["crypto"]
  },
  assetsInclude: ["**/*.otf", "**/*.ttf", "**/*.woff", "**/*.woff2"]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvd29yay9yY3MvcmNsL3BhY2thZ2VzL3NpbXVsYXRvclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL3dvcmsvcmNzL3JjbC9wYWNrYWdlcy9zaW11bGF0b3Ivdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL3dvcmsvcmNzL3JjbC9wYWNrYWdlcy9zaW11bGF0b3Ivdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHNvbGlkIGZyb20gJ3ZpdGUtcGx1Z2luLXNvbGlkJ1xuaW1wb3J0IGR0cyBmcm9tICd2aXRlLXBsdWdpbi1kdHMnXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCdcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgc29saWQoKSxcbiAgICBkdHMoe1xuICAgICAgaW5jbHVkZTogWydzcmMnXSxcbiAgICAgIGluc2VydFR5cGVzRW50cnk6IHRydWUsXG4gICAgfSksXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgbGliOiB7XG4gICAgICBlbnRyeToge1xuICAgICAgICAvLyBPbmx5IGJ1aWxkIHJlYWN0IGZvciBub3cgLSBpbmRleC9saXQvc29saWQgaGF2ZSBidWlsZCBpc3N1ZXNcbiAgICAgICAgcmVhY3Q6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3JlYWN0L2luZGV4LnRzJyksXG4gICAgICB9LFxuICAgICAgZm9ybWF0czogWydlcyddLFxuICAgIH0sXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgZXh0ZXJuYWw6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ2xpdCcsICdzb2xpZC1qcycsICdzb2xpZC1qcy93ZWInLCAnQHJjcy1sYW5nL2NzbScsICdAcmNzLWxhbmcvdHlwZXMnLCAnbHVjaWRlLXJlYWN0J10sXG4gICAgfSxcbiAgfSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBjcnlwdG86ICdjcnlwdG8tYnJvd3NlcmlmeScsXG4gICAgfSxcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWydjcnlwdG8nXSxcbiAgfSxcbiAgYXNzZXRzSW5jbHVkZTogWycqKi8qLm90ZicsICcqKi8qLnR0ZicsICcqKi8qLndvZmYnLCAnKiovKi53b2ZmMiddLFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBa1IsU0FBUyxvQkFBb0I7QUFDL1MsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sV0FBVztBQUNsQixPQUFPLFNBQVM7QUFDaEIsU0FBUyxlQUFlO0FBSnhCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLElBQUk7QUFBQSxNQUNGLFNBQVMsQ0FBQyxLQUFLO0FBQUEsTUFDZixrQkFBa0I7QUFBQSxJQUNwQixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsS0FBSztBQUFBLE1BQ0gsT0FBTztBQUFBO0FBQUEsUUFFTCxPQUFPLFFBQVEsa0NBQVcsb0JBQW9CO0FBQUEsTUFDaEQ7QUFBQSxNQUNBLFNBQVMsQ0FBQyxJQUFJO0FBQUEsSUFDaEI7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNiLFVBQVUsQ0FBQyxTQUFTLGFBQWEsT0FBTyxZQUFZLGdCQUFnQixpQkFBaUIsbUJBQW1CLGNBQWM7QUFBQSxJQUN4SDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLFFBQVE7QUFBQSxFQUNwQjtBQUFBLEVBQ0EsZUFBZSxDQUFDLFlBQVksWUFBWSxhQUFhLFlBQVk7QUFDbkUsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
