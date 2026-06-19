// CS2 Case Lab v31.9: service worker disabled intentionally to avoid stale GitHub Pages cache.
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.registration.unregister()));
