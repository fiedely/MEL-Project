import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // [UPDATED] Include all your specific favicon assets here
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'favicon-16x16.png', 'favicon-32x32.png'],
      manifest: {
        name: 'MEL | Movie Evaluation Lab',
        short_name: 'MEL',
        description: 'Advanced Movie Analysis and Archival System',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'android-chrome-192x192.png', // [UPDATED] Matches your file
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'android-chrome-512x512.png', // [UPDATED] Matches your file
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'android-chrome-512x512.png', 
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Needed for Android adaptive icons
          }
        ]
      }
    })
  ],
})