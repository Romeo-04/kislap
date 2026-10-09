/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Model files are NOT precached here: Transformers.js stores them in the Cache API (ADR-0007).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.svg', 'sounds/*', 'fonts/*', 'mascot/*', 'stickers/*', 'audio/**/*'],
      manifest: {
        name: 'Kislap',
        short_name: 'Kislap',
        description: 'Basa. Kislap. Galing! A reading game that listens on your device.',
        lang: 'fil',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FFFBEF',
        theme_color: '#FFFBEF',
        icons: [{ src: '/icons/kislap.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2,mp3,ogg,webm,m4a,json}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
  worker: { format: 'es' },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
