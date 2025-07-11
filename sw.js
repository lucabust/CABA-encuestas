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
  '/assets/accesibilidad.jpg',
  './login.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
  .then(cache => cache.addAll(CACHE_FILES))
      .catch(err => console.error('Fallo al cachear:', err))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

//DEBEN PONER SU CONFIGURACIÓN DE FIREBASE
firebase.initializeApp({
    apiKey: "AIzaSyBlhTmbEv6Bp2TTf-t5E2QqxssxXGxiNV0",
  authDomain: "caba-encuestas-pwa.firebaseapp.com",
  projectId: "caba-encuestas-pwa",
  storageBucket: "caba-encuestas-pwa.firebasestorage.app",
  messagingSenderId: "627050396363",
  appId: "1:627050396363:web:1e57c9bf57870b7c94794e"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "./icon.png"
  });
});

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
