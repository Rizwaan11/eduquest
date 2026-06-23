import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@monaco-editor") || id.includes("monaco-editor")) return "vendor-monaco";
          if (id.includes("pdfjs-dist") || id.includes("@react-pdf-viewer")) return "vendor-pdf";
          if (id.includes("mermaid")) return "vendor-mermaid";
          if (id.includes("@mui") || id.includes("@emotion")) return "vendor-mui";
          if (id.includes("framer-motion") || id.includes("/motion/")) return "vendor-motion";
          return "vendor";
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: true,
  },
});
