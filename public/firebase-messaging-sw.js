// Este archivo DEBE vivir en /public (se sirve como /firebase-messaging-sw.js)
// y es el que muestra la notificación del sistema operativo cuando el
// mensaje llega con la pestaña cerrada o en segundo plano.
//
// Un service worker no puede leer variables de entorno de Next.js, así que
// estos valores van copiados a mano — son los mismos que pusiste en
// NEXT_PUBLIC_FIREBASE_*. No son secretos: Firebase los expone igual en el
// navegador, así que no hay problema en que estén aquí.

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAe6TdW1EoXurm1yUzNxeh9YWiPP3Dg63M',
  authDomain: 'minuta-4fb65.firebaseapp.com',
  projectId: 'minuta-4fb65',
  storageBucket: 'minuta-4fb65.firebasestorage.app',
  messagingSenderId: '753985344221',
  appId: '1:753985344221:web:1102bcd739454374e34134',
});

const messaging = firebase.messaging();

// Salta la espera y toma control de inmediato — evita el error
// "Subscription failed - no active Service Worker" la primera vez que se
// registra.
self.addEventListener('install', () => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Notificación mostrada cuando la app NO está en primer plano.
messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || 'Minuta';
  const options = {
    body: (payload.notification && payload.notification.body) || '',
    icon: '/icon-192.png',
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});

// Al hacer clic en la notificación, enfoca o abre la pestaña del dashboard.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/dashboard') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});