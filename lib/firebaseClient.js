import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Estos valores NO son secretos (Firebase los expone al navegador por
// diseño), por eso van con el prefijo NEXT_PUBLIC_ y se pueden ver en el
// código fuente del sitio sin problema.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp() {
  return getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
}

/**
 * Pide permiso de notificaciones al navegador (si hace falta), obtiene el
 * token FCM del dispositivo y lo manda a guardar al backend asociado al
 * usuario logueado. Se puede llamar varias veces sin problema (p.ej. cada
 * vez que carga el dashboard); si el permiso ya fue concedido y el token no
 * cambió, simplemente no hace nada visible.
 *
 * Devuelve 'granted', 'denied', 'unsupported' o 'error'.
 */
export async function initPushNotifications() {
  try {
    if (typeof window === 'undefined') return 'unsupported';
    if (!('Notification' in window) || !(await isSupported())) return 'unsupported';
    if (!firebaseConfig.apiKey) {
      console.warn('Firebase no está configurado (faltan NEXT_PUBLIC_FIREBASE_*)');
      return 'unsupported';
    }

    if (Notification.permission === 'denied') return 'denied';

    if (Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      if (result !== 'granted') return result;
    }

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const app = getFirebaseApp();
    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (!token) return 'error';

    await fetch('/api/notifications/register-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    return 'granted';
  } catch (e) {
    console.error('No se pudo activar notificaciones push', e);
    return 'error';
  }
}

/**
 * Escucha notificaciones que llegan mientras la pestaña está ABIERTA y EN
 * PRIMER PLANO (las que llegan con la pestaña cerrada o en segundo plano las
 * maneja directamente el service worker). Útil para, por ejemplo, mostrar un
 * toast dentro de la app además de la notificación del sistema operativo.
 */
export async function listenForegroundMessages(onMessageReceived) {
  try {
    if (typeof window === 'undefined' || !(await isSupported())) return;
    const app = getFirebaseApp();
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      onMessageReceived && onMessageReceived(payload);
    });
  } catch (e) {
    console.error('No se pudo escuchar mensajes en primer plano', e);
  }
}
