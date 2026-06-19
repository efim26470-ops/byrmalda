// CS2 Case Lab v31.1 lite: no cache service worker.
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.registration.unregister()));
