const CACHE_NAME = 'encuestas-caba-v1';
const CACHE_FILES = [
  '/',
  '/encuestas.html',
  '/app.js',
  '/assets/limpieza.jpg',
  '/assets/transporte.jpg',
  '/assets/espacios_verdes.jpg',
  '/assets/eventos.jpg',
  '/assets/subte.jpg',
  '/assets/seguridad.jpg',
  '/assets/accesibilidad.jpg'
];


self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_FILES);
    })
  );
});


self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
});


self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request).then(networkResp => {
        return networkResp;
      }).catch(() => {
        return new Response('Offline; recurso no en caché', {
          status: 503,
          statusText: 'Servicio no disponible'
        });
      });
    })
  );
});
