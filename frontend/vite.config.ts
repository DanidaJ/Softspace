import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Custom plugin for SPA fallback
function spaFallbackPlugin() {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        // If it's a navigation request (not a file with extension), serve index.html
        if (
          req.method === 'GET' &&
          !url.includes('.') &&
          !url.startsWith('/@') &&
          !url.startsWith('/node_modules') &&
          !url.startsWith('/__')
        ) {
          req.url = '/index.html';
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      // Enable SPA fallback for dev server (handles BrowserRouter routes)
      appType: 'spa',
      plugins: [spaFallbackPlugin(), react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
