import { createClient } from 'redis';

// Estructura guardada en Redis:
//   'compromisos'  -> string JSON con el array de compromisos (incluye su propio "historial")
//   'next_id'      -> contador para asignar ids nuevos

export const CATALOGO = {
  areas: ['Operaciones', 'Diplomados y Proyectos', 'Entrenamiento continuo', 'Soporte', 'Analista', 'Todos'],
  status: ['Nuevo', 'Abierto', 'Acuerdo', 'Vencido', 'Cerrado'],
  responsables: ['Katia', 'Elvia', 'Luis Enrique', 'Ernesto', 'Brenda', 'Miguel', 'Todos'],
};

const KEY_COMPROMISOS = 'compromisos';
const KEY_NEXT_ID = 'next_id';

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

async function getClient() {
  if (!clientPromise) {
    const client = createClient({ url: getRedisUrl() });
    client.on('error', (err) => {
      console.error('Redis Client Error', err);
    });
    clientPromise = client.connect().then(() => client);
  }
  return clientPromise;
}

function fmt(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function parseDdmmyyyy(s) {
  if (!s) return null;
  const parts = String(s).split('/');
  if (parts.length !== 3) return null;
  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const y = parseInt(parts[2], 10);
  const dt = new Date(y, m, d);
  return isNaN(dt.getTime()) ? null : dt;
}

async function readAll() {
  const client = await getClient();
  const raw = await client.get(KEY_COMPROMISOS);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

async function writeAll(list) {
  const client = await getClient();
  await client.set(KEY_COMPROMISOS, JSON.stringify(list));
}

async function nextId() {
  const client = await getClient();
  return client.incr(KEY_NEXT_ID);
}

function withComputedFields(c) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let status = c.status || 'Nuevo';
  let diasVencido = '';

  const promesa = parseDdmmyyyy(c.promesaCierre);
  if (promesa && status !== 'Cerrado') {
    const diff = Math.floor((today - promesa) / 86400000);
    if (diff > 0) {
      diasVencido = diff;
      status = 'Vencido';
    }
  }

  return { ...c, status, diasVencido };
}

export async function getData() {
  const all = await readAll();
  const compromisos = all.map(withComputedFields).sort((a, b) => b.id - a.id);
  return { compromisos, catalogo: CATALOGO };
}

export async function addCompromiso(data) {
  const all = await readAll();
  const id = await nextId();
  const nuevo = {
    id,
    fecha: data.fecha || fmt(new Date()),
    area: data.area || '',
    tema: data.tema || '',
    compromiso: data.compromiso || '',
    responsable: data.responsable || '',
    solicitadoPor: data.solicitadoPor || '',
    promesaCierre: data.promesaCierre || '',
    status: data.status || 'Nuevo',
    comentarios: data.comentarios || '',
    historial: [],
  };
  all.push(nuevo);
  await writeAll(all);
  return getData();
}

export async function updateCompromiso(id, updates) {
  const all = await readAll();
  const idx = all.findIndex((c) => String(c.id) === String(id));
  if (idx === -1) throw new Error('Compromiso no encontrado');

  const allowed = ['status', 'promesaCierre', 'comentarios', 'responsable'];
  allowed.forEach((key) => {
    if (updates[key] !== undefined) all[idx][key] = updates[key];
  });

  await writeAll(all);
  return getData();
}

export async function addAvance(id, avanceTexto) {
  const texto = String(avanceTexto || '').trim();
  if (!texto) throw new Error('El avance no puede estar vacío');

  const all = await readAll();
  const idx = all.findIndex((c) => String(c.id) === String(id));
  if (idx === -1) throw new Error('Compromiso no encontrado');

  if (!Array.isArray(all[idx].historial)) all[idx].historial = [];
  all[idx].historial.unshift({ fecha: fmt(new Date()), avance: texto });

  await writeAll(all);
  return getData();
}
