// A tab may display another tab's badge without sending another hit to Hits.
const cacheName = 'portfolio-last-visit-v1';
const originPath = new URL('shared-visit-badge', self.registration.scope).href;
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  const address = new URL(event.request.url);
  if (address.origin + address.pathname !== originPath) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    if (address.searchParams.has('read')) {
      return (await cache.match(originPath)) || Response.error();
    }
    const badge = new URL('https://hits.sh/ml-adnan-bashir.github.io/portfolio.svg?label=Page%20visits&color=f4c4ad&labelColor=090a0d&style=flat');
    badge.searchParams.set('_view', address.searchParams.get('visit'));
    const response = await fetch(badge, {mode:'no-cors', cache:'no-store', credentials:'omit', referrerPolicy:'no-referrer'});
    await cache.put(originPath, response.clone());
    return response;
  })());
});
