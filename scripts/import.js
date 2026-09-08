/**
 * Importación única de los compromisos existentes (del Excel/Google Sheet
 * original) hacia la base de datos Redis del proyecto.
 *
 * CÓMO USARLO:
 *   1. Ya despliega la app en Vercel y conecta la base de datos Redis.
 *   2. En tu computadora, dentro de la carpeta del proyecto:
 *        npm install
 *        vercel link          (conecta esta carpeta con tu proyecto de Vercel)
 *        vercel env pull .env.local
 *   3. Corre:
 *        node scripts/import.js
 *
 * Es seguro correrlo una sola vez. Si lo corres dos veces, duplicará los
 * compromisos — si necesitas repetirlo, primero vacía la base de datos desde
 * el dashboard de Vercel/Redis (borra las claves "compromisos" y "next_id").
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('redis');

function getRedisUrl() {
  return (
    process.env.KV_REDIS_URL ||
    process.env.REDIS_URL ||
    process.env.KV_URL ||
    process.env.REDIS_CONNECTION_STRING
  );
}

async function main() {
  const url = getRedisUrl();
  if (!url) {
    console.error(
      'Falta la variable con la URL de Redis (KV_REDIS_URL / REDIS_URL / KV_URL). Corre "vercel env pull .env.local" primero.'
    );
    process.exit(1);
  }

  const client = createClient({ url });
  client.on('error', (err) => console.error('Redis Client Error', err));
  await client.connect();

  const dataPath = path.join(__dirname, 'import-data.json');
  const compromisos = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const existenteRaw = await client.get('compromisos');
  const existentes = existenteRaw ? JSON.parse(existenteRaw) : [];
  if (Array.isArray(existentes) && existentes.length > 0) {
    console.error(
      `Ya hay ${existentes.length} compromiso(s) guardados. Para evitar duplicar, este script no sobreescribe datos existentes.\n` +
        'Si de verdad quieres reimportar, borra primero las claves "compromisos" y "next_id" en el dashboard de la base de datos.'
    );
    await client.quit();
    process.exit(1);
  }

  await client.set('compromisos', JSON.stringify(compromisos));
  const maxId = compromisos.reduce((max, c) => Math.max(max, c.id), 0);
  await client.set('next_id', maxId);

  console.log(`Listo: se importaron ${compromisos.length} compromisos. next_id quedó en ${maxId}.`);
  await client.quit();
}

main().catch((err) => {
  console.error('Error durante la importación:', err);
  process.exit(1);
});
