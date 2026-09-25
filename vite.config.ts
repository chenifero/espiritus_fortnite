import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      workbox: {
        // El arte pesa ~2,8 MB: precargarlo todo en la instalación castigaría los datos
        // móviles, así que cada espíritu se guarda la primera vez que se ve.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/sprites/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'sprites',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'fuentes',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'Espíritus Fortnite',
        short_name: 'Espíritus',
        description: 'Marca qué espíritus de Fortnite tienes coleccionados',
        theme_color: '#0b0f19',
        background_color: '#0b0f19',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
})
