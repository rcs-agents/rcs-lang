import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      include: ["src"],
      exclude: ["**/*.test.ts", "**/*.test.tsx"],
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-dom/client",
        "monaco-editor",
        "@monaco-editor/react",
        "@ark-ui/react",
        "lucide-react",
        // Keep these RCS packages external (consumed apps will provide them)
        "@rcs-lang/ast",
        "@rcs-lang/core",
        "@rcs-lang/csm",
        "@rcs-lang/parser",
        "@rcs-lang/compiler",
        "@rcs-lang/file-system",
        "@rcs-lang/types",
        // Bundle diagram and simulator to avoid subpath export issues
        // These are loaded conditionally and won't cause bundle bloat if unused
        "lz-string",
        "shiki",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "react/jsx-runtime",
        },
      },
    },
    sourcemap: true,
    minify: false,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
