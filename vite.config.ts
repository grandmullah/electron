import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/renderer',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'renderer/src/main.tsx'),
      },
      output: {
        entryFileNames: 'src/[name].js',
        chunkFileNames: 'src/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'renderer/src'),
      '@main': resolve(__dirname, 'main'),
      '@renderer': resolve(__dirname, 'renderer'),
      '@shared': resolve(__dirname, 'shared')
    }
  }
}); 