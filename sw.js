const CACHE_NAME = 'cs2-case-lab-v7-cache';
const CORE_ASSETS = [
  './','index.html','cases.html','inventory.html','upgrade.html','contracts.html','wheel.html','battle.html','ads.html','profile.html','install.html',
  'styles.css?v=7.0.0','app.js?v=7.0.0','manifest.webmanifest','favicon.svg','assets/icons/icon-192.png','assets/icons/icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS.map(x => new Request(x, {cache:'reload'})))).catch(()=>null));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.hostname.includes('raw.githubusercontent.com') || url.hostname.includes('steamcommunity.com') || url.hostname.includes('akamai')){
    event.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }
  event.respondWith(fetch(req).then(res => {
    const copy = res.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(()=>null);
    return res;
  }).catch(() => caches.match(req).then(cached => cached || caches.match('index.html'))));
});
