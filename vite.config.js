import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  base: '/',
  plugins: [
    wasm(),
    topLevelAwait()
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: true,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          rapier: ['@dimforge/rapier3d']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  optimizeDeps: {
    exclude: ['@dimforge/rapier3d']
  },
  resolve: {
    alias: {
      '@dimforge/rapier3d': '@dimforge/rapier3d/rapier_wasm3d.js'
    }
  }
});