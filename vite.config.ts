import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/Waso/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg', 'icons/icon-maskable.svg'],
      manifest: {
        name: 'Waso',
        short_name: 'Waso',
        description: 'Pokedex pour oiseaux',
        start_url: '/Waso/',
        scope: '/Waso/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        // Placeholder icons (emoji-based SVG) — swap for real artwork later, same file names.
        icons: [
          {
            src: 'icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'icons/icon-maskable.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Note: this intentionally does NOT match public/birdnet/** (model files, ~50MB) —
        // precaching them would bloat the initial app install. Instead they're cached on
        // first use via the CacheFirst runtime rule below (fetched once, then offline).
        globPatterns: ['**/*.{js,css,html,ico,svg,json,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: /\/birdnet\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'birdnet-model-v1',
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
