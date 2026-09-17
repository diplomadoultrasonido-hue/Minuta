// Este archivo DEBE vivir en /public (se sirve como /firebase-messaging-sw.js)
// y es el que muestra la notificación del sistema operativo cuando el
// mensaje llega con la pestaña cerrada o en segundo plano.
//
// Un service worker no puede leer variables de entorno de Next.js, así que
// aquí abajo hay que copiar A MANO los mismos valores NEXT_PUBLIC_FIREBASE_*
// que pusiste en tus variables de entorno. No son secretos: Firebase los
// expone igual en el navegador, así que no hay problema en que estén aquí.

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'PEGA_AQUI_TU_API_KEY',
  authDomain: 'TU-PROYECTO.firebaseapp.com',
  projectId: 'TU-PROYECTO',
  storageBucket: 'TU-PROYECTO.appspot.com',
  messagingSenderId: 'TU_MESSAGING_SENDER_ID',
  appId: 'TU_APP_ID',
});

const messaging = firebase.messaging();

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
