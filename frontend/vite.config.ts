import { defineConfig } from 'vite';
import solid from '@solidjs/vite-plugin';
import { fileRoutes } from 'filesystem-routing/vite';

export default defineConfig({
  // Turnkey client mode: no index.html and no mount file — the plugin generates
  // the entries around src/App.tsx (wrapped in src/Document.tsx) and `vite build`
  // prerenders the shell into a purely static dist/client.
  plugins: [
    solid({ start: true, diagnostics: true, extensions: ['.jsx', '.tsx'] }),
    fileRoutes({ types: true }),
  ],
  server: {
    port: 3000,
    host: '127.0.0.1',
    // Windows can reject native file watches with EBUSY during file writes.
    watch: { usePolling: true, interval: 300 },
    proxy: { '/api': 'http://127.0.0.1:3001' },
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 0,
  },
});
