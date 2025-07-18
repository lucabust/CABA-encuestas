const CACHE_NAME = 'encuestas-caba-v1';
const CACHE_FILES = [
  '/',
  '/index.html',
  '/app.js',
  '/assets/limpieza.jpg',
  '/assets/transporte.jpg',
  '/assets/espacios_verdes.jpg',
  '/assets/eventos.jpg',
  '/assets/subte.jpg',
  '/assets/seguridad.jpg',
  '/assets/accesibilidad.jpg',
  '/login.html'
];

// 1. Instalación: caché de archivos esenciales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_FILES))
      .catch(err => console.error('Fallo al cachear:', err))
  );
});

// 2. Activación: eliminar caches antiguos
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

// 3. Fetch: responder desde cache o red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request).catch(() => {
        return new Response('Offline; recurso no en caché', {
          status: 503,
          statusText: 'Servicio no disponible'
        });
      });
    })
  );
});


// 4. Firebase FCM: configuración básica
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBlhTmbEv6Bp2TTf-t5E2QqxssxXGxiNV0",
  authDomain: "caba-encuestas-pwa.firebaseapp.com",
  projectId: "caba-encuestas-pwa",
  storageBucket: "caba-encuestas-pwa.firebasestorage.app",
  messagingSenderId: "627050396363",
  appId: "1:627050396363:web:1e57c9bf57870b7c94794e"
});

const messaging = firebase.messaging();

// 5. Mostrar notificación cuando llega un mensaje en segundo plano
messaging.onBackgroundMessage(payload => {
  console.log('[Service Worker] Notificación recibida:', payload);

  const { title, body } = payload.notification;

  self.registration.showNotification(title, {
    body: body,
    icon: './icon.png'
  });
});

// 6. Manejar click en la notificación
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then(clientList => {
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
