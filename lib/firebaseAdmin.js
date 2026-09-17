import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// La cuenta de servicio se guarda completa (el JSON que descargas de Firebase
// Console) en UNA sola variable de entorno, como string.
//   Firebase Console -> Configuración del proyecto -> Cuentas de servicio ->
//   Generar nueva clave privada -> pega el contenido del .json en
//   FIREBASE_SERVICE_ACCOUNT (en Vercel: Project Settings -> Environment
//   Variables).
function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error(
      'Falta la variable de entorno FIREBASE_SERVICE_ACCOUNT (el JSON de la cuenta de servicio de Firebase)'
    );
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT no contiene un JSON válido');
  }
}

let app;
function getFirebaseAdminApp() {
  if (!app) {
    const apps = getApps();
    app = apps.length ? apps[0] : initializeApp({ credential: cert(getServiceAccount()) });
  }
  return app;
}

export function getFcmMessaging() {
  return getMessaging(getFirebaseAdminApp());
}
