// CS2 Case Lab v31.11: service worker disabled intentionally to avoid stale GitHub Pages cache.
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.registration.unregister()));


## v31.18
- Fixed upgrade roulette/result sync.
- Removed sale commission.
- Sticker wear/float removed; sticker prices are individualized by tournament/team/finish.
- Added album refresh, leveled achievements/missions, stronger team events, season event refresh, larger season store with bulk buy, Season Pass renew, better custom cases and profile customization.
