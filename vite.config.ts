/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Model files are NOT precached here: Transformers.js stores them in the Cache API (ADR-0007).
// BASE_PATH lets the same app build for a sub-path host (GitHub Pages: /kislap/); Vercel uses '/'.
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.svg', 'sounds/*', 'fonts/*', 'stickers/*', 'audio/**/*'],
      manifest: {
        name: 'Kislap',
        short_name: 'Kislap',
        description: 'Basa. Kislap. Galing! A reading game that listens on your device.',
        lang: 'fil',
        start_url: base,
        scope: base,
        id: base,
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait',
        background_color: '#fff9f4',
        theme_color: '#fff9f4',
        // rounded art with wings near the edge: not safe for maskable crops
        icons: [{ src: `${base}icons/kislap.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,mp3,ogg,webm,m4a,json}'],
        // Dev-only model folders under public/models are gitignored. Never precache them.
        globIgnores: ['models/**'],
        navigateFallback: '/index.html',
        // The ONNX Runtime files are 26 MB, too big to precache on install. Cache them the first
        // time the worker loads them, so the app still runs offline after that (ADR-0007).
        runtimeCaching: [
          {
            urlPattern: /\/assets\/ort-wasm-.*\.(wasm|mjs)$/,
            handler: 'CacheFirst',
            options: { cacheName: 'ort-runtime', expiration: { maxEntries: 4 } },
          },
        ],
      },
    }),
  ],
  worker: { format: 'es' },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
