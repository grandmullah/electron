import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
      plugins: [react()],
      base: mode === 'development' ? '/' : './', // Relative paths for Electron packaged apps
      define: {
            'process.env.NODE_ENV': JSON.stringify(mode), // Make NODE_ENV available in renderer
      },
      build: {
            outDir: 'dist/renderer',
            sourcemap: mode !== 'production', // Disable sourcemaps in prod
            rollupOptions: {
                  input: {
                        main: resolve(__dirname, 'renderer/src/main.tsx'),
                  },
                  output: {
                        entryFileNames: 'src/[name].js',
                        chunkFileNames: 'src/[name].js',
                        assetFileNames: 'assets/[name].[ext]'
                  }
            },
            // Copy JavaScript files to build output
            copyPublicDir: true,
            // Ensure js files are included in build
            assetsInclude: ['**/*.js', '**/*.html'],
            // Copy additional directories
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
      // Copy additional files during build
      publicDir: 'renderer',
      resolve: {
            alias: {
                  '@': resolve(__dirname, 'renderer/src'),
                  '@main': resolve(__dirname, 'main'),
                  '@renderer': resolve(__dirname, 'renderer'),
                  '@shared': resolve(__dirname, 'shared'),
                  '@js': resolve(__dirname, 'renderer/js')
            }
      }
})); 