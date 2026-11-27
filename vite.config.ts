import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const VERSAO = '0.10'; // sobe à mão quando há novidades para o Tiago ver
const COMMIT = (process.env.VERCEL_GIT_COMMIT_SHA ?? '').slice(0, 7);
const DATA = new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', timeZone: 'Europe/Lisbon' });

export default defineConfig({
  define: {
    __VERSAO__: JSON.stringify(VERSAO),
    __BUILD__: JSON.stringify(COMMIT ? `${DATA} · ${COMMIT}` : DATA),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // registo feito em main.tsx, para procurar atualizações sempre que a app volta ao ecrã
      includeAssets: ['icons/apple-touch-icon.png', 'icons/favicon.svg'],
      manifest: {
        name: 'Garrafeira',
        short_name: 'Garrafeira',
        description: 'A minha garrafeira privada',
        lang: 'pt-PT',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#14100F',
        theme_color: '#14100F',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
});
