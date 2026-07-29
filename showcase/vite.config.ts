import path from "node:path";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

const showcaseRoot = fileURLToPath(new URL(".", import.meta.url));
const reactPath = path.resolve(showcaseRoot, "node_modules/react");
const reactDomPath = path.resolve(showcaseRoot, "node_modules/react-dom");

export default defineConfig({
  resolve: {
    alias: {
      "@lunarq/frontend-shared": fileURLToPath(new URL("../src", import.meta.url)),
      // Shared package + recharts resolve from the monorepo root; force one React copy.
      react: reactPath,
      "react-dom": reactDomPath,
      "react/jsx-runtime": path.resolve(reactPath, "jsx-runtime.js"),
      "react/jsx-dev-runtime": path.resolve(reactPath, "jsx-dev-runtime.js"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["recharts", "react", "react-dom"],
  },
  server: {
    port: 4180,
    fs: {
      allow: [showcaseRoot, fileURLToPath(new URL("..", import.meta.url))],
    },
  },
});
