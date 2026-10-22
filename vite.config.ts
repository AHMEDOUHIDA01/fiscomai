import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// COOP/COEP headers are required so the browser grants SharedArrayBuffer,
// which ffmpeg.wasm (multithread) and the transformers.js WASM backend use.
const crossOriginIsolation = {
  name: 'cross-origin-isolation',
  configureServer(server: { middlewares: { use: (fn: (req: unknown, res: { setHeader: (k: string, v: string) => void }, next: () => void) => void) => void } }) {
    server.middlewares.use((_req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      next();
    });
  },
};

export default defineConfig({
  plugins: [react(), crossOriginIsolation],
  // Keep large AI/wasm deps out of Vite's dep pre-bundling; they are loaded
  // lazily at runtime only when a feature that needs them is used.
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util', '@huggingface/transformers', '@imgly/background-removal'],
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'es2022',
  },
});
