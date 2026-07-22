import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@lunarq/frontend-shared": fileURLToPath(new URL("../src", import.meta.url)),
    },
  },
  server: {
    port: 4180,
  },
});
