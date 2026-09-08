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
  },
});
