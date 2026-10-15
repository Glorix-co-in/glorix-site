import { defineConfig } from 'vite';
import solid from '@solidjs/vite-plugin';

export default defineConfig({
  // Turnkey client mode: no index.html and no mount file — the plugin generates
  // the entries around src/App.tsx (wrapped in src/Document.tsx) and `vite build`
  // prerenders the shell into a purely static dist/client.
  plugins: [
    solid({ start: true, diagnostics: true }), // add `ssr: true` for streaming SSR
  ],
  server: {
    port: 3000,
    host: '127.0.0.1',
    proxy: { '/api': 'http://127.0.0.1:3001' },
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 0,
  },
});
