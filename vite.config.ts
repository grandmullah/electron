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
            chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
            minify: 'esbuild', // Use esbuild for minification
            // Remove console logs in production
            esbuild: mode === 'production' ? {
                  drop: ['console', 'debugger'],
            } : undefined,
            rollupOptions: {
                  input: {
                        main: resolve(__dirname, 'renderer/src/main.tsx'),
                  },
                  output: {
                        entryFileNames: 'src/[name].js',
                        chunkFileNames: 'src/[name].js',
                        assetFileNames: 'assets/[name].[ext]',
                        manualChunks: {
                              // Vendor chunks for better caching
                              'vendor-react': ['react', 'react-dom'],
                              'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
                              'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
                              'vendor-utils': ['axios', 'dayjs', 'swr'],
                              // Service chunks for lazy loading
                              'services-print': ['renderer/src/services/printService.ts'],
                              'services-api': ['renderer/src/services/apiConfig.ts', 'renderer/src/services/betHistoryService.ts'],
                              'services-games': ['renderer/src/services/gamesService.ts'],
                              'services-agent': ['renderer/src/services/agentService.ts']
                        }
                  }
            },
            // Copy JavaScript files to build output
            copyPublicDir: true,
            // Ensure js files are included in build
            assetsInclude: ['**/*.js', '**/*.html']
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