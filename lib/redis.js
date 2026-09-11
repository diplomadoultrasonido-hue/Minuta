import { createClient } from 'redis';

function getRedisUrl() {
  // Distintas integraciones de Vercel nombran esta variable distinto según
  // el proveedor (Redis Cloud, Upstash, etc.) — probamos las más comunes.
  const url =
    process.env.KV_REDIS_URL ||
    process.env.REDIS_URL ||
    process.env.KV_URL ||
    process.env.REDIS_CONNECTION_STRING;
  if (!url) {
    throw new Error(
      'Falta la variable de entorno con la URL de Redis (se buscó KV_REDIS_URL, REDIS_URL o KV_URL)'
    );
  }
  return url;
}

// Reutilizamos la conexión entre invocaciones "calientes" de la función
// serverless en vez de abrir una nueva cada vez.
let clientPromise = null;

export async function getClient() {
  if (!clientPromise) {
    const client = createClient({ url: getRedisUrl() });
    client.on('error', (err) => {
      console.error('Redis Client Error', err);
    });
    clientPromise = client.connect().then(() => client);
  }
  return clientPromise;
}
