import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          devOptions: {
            enabled: true
          },
          includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg'],
          manifest: {
            name: 'Agri Record Card Generator Pro',
            short_name: 'AgriRecord',
            description: 'Farmer Record Card & Agriculture ID Card Generator',
            theme_color: '#064e3b',
            background_color: '#f8fafc',
            display: 'standalone',
            start_url: '/',
            icons: [
              {
                src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Farmer_icon.svg/192px-Farmer_icon.svg.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Farmer_icon.svg/512px-Farmer_icon.svg.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          }
        })
      ],
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
