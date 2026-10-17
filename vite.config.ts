import { defineConfig, loadEnv } from "vite";
import process from "node:process";
import solid from "@solidjs/vite-plugin";
import { fileRoutes } from "filesystem-routing/vite";
import { siteApi } from "./server/apiPlugin.ts";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      siteApi({
        convexUrl: env.VITE_CONVEX_URL,
        password: env.ADMIN_PASSWORD,
        secret: env.ADMIN_API_SECRET,
      }),
      solid({ start: true, diagnostics: true, extensions: [".jsx", ".tsx"] }),
      fileRoutes({ types: true }),
    ],
    server: {
      port: 3000,
      host: "127.0.0.1",
      // Windows can reject native file watches with EBUSY during file writes.
      watch: { usePolling: true, interval: 300 },
    },
    build: {
      target: "esnext",
      assetsInlineLimit: 0,
    },
  };
});
