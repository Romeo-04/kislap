import { registerSW } from 'virtual:pwa-register'

// Caches the app shell for offline use (spec §12). Full offline flow: issue #5.
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return
  registerSW({ immediate: true })
}
