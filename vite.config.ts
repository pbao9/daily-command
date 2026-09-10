import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// base: './' so the built index.html references assets with relative paths
// (chrome-extension://<id>/...) instead of absolute "/" paths that break
// when the extension isn't served from the origin root.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        popup: 'popup.html',
        blocked: 'blocked.html',
        'background/service-worker': 'src/background/service-worker.ts',
      },
      output: {
        // The manifest references the service worker by exact path, so it
        // (alone) needs a stable, non-hashed filename.
        entryFileNames: (chunk) =>
          chunk.name === 'background/service-worker' ? '[name].js' : 'assets/[name]-[hash].js',
      },
    },
  },
});
