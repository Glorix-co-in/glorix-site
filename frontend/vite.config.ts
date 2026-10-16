import { defineConfig } from "vite";
import solid from "@solidjs/vite-plugin";
import { fileRoutes } from "filesystem-routing/vite";

export default defineConfig({
  plugins: [
    solid({ start: true, diagnostics: true, extensions: [".jsx", ".tsx"] }),
    fileRoutes({ types: true }),
  ],
  server: {
    port: 3000,
    host: "127.0.0.1",
    // Windows can reject native file watches with EBUSY during file writes.
    watch: { usePolling: true, interval: 300 },
    proxy: { "/api": "http://127.0.0.1:3001" },
  },
  build: {
    target: "esnext",
    assetsInlineLimit: 0,
  },
});
