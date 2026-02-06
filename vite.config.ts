import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: __dirname,
  publicDir: path.resolve(__dirname, 'public'),
  plugins: [react()],
  base: '/',  // ← UBAH INI dari './' ke '/'
  server: {
    proxy: {
      '/api/main': {
        target: 'https://octra.network',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/main/, ''),
      },
      '/api/scan': {
        target: 'https://network.octrascan.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/scan/, ''),
      },
    },
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
