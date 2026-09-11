import { getClient } from './redis';
import { getTeamMembers } from './users';

// Estructura guardada en Redis (todo separado por equipo, para aislamiento total):
//   'team:{teamId}:compromisos'  -> string JSON con el array de compromisos
//   'team:{teamId}:next_id'      -> contador para asignar ids nuevos dentro de ese equipo

export const CATALOGO_BASE = {
  areas: ['Operaciones', 'Diplomados y Proyectos', 'Entrenamiento continuo', 'Soporte', 'Analista', 'Todos'],
  status: ['Nuevo', 'Abierto', 'Acuerdo', 'Vencido', 'Cerrado'],
};

function keyCompromisos(teamId) {
  return `team:${teamId}:compromisos`;
}
function keyNextId(teamId) {
  return `team:${teamId}:next_id`;
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

async function readAll(teamId) {
  const client = await getClient();
  const raw = await client.get(keyCompromisos(teamId));
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

async function writeAll(teamId, list) {
  const client = await getClient();
  await client.set(keyCompromisos(teamId), JSON.stringify(list));
}

async function nextId(teamId) {
  const client = await getClient();
  return client.incr(keyNextId(teamId));
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

async function getCatalogo(teamId) {
  const members = await getTeamMembers(teamId);
  const responsables = members.map((m) => m.name).filter(Boolean);
  if (!responsables.includes('Todos')) responsables.push('Todos');
  return { ...CATALOGO_BASE, responsables };
}

export async function getData(teamId) {
  const all = await readAll(teamId);
  const compromisos = all.map(withComputedFields).sort((a, b) => b.id - a.id);
  const catalogo = await getCatalogo(teamId);
  return { compromisos, catalogo };
}

export async function addCompromiso(teamId, data) {
  const all = await readAll(teamId);
  const id = await nextId(teamId);
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
  await writeAll(teamId, all);
  return getData(teamId);
}

export async function updateCompromiso(teamId, id, updates) {
  const all = await readAll(teamId);
  const idx = all.findIndex((c) => String(c.id) === String(id));
  if (idx === -1) throw new Error('Compromiso no encontrado');

  const allowed = ['status', 'promesaCierre', 'comentarios', 'responsable'];
  allowed.forEach((key) => {
    if (updates[key] !== undefined) all[idx][key] = updates[key];
  });

  await writeAll(teamId, all);
  return getData(teamId);
}

export async function addAvance(teamId, id, avanceTexto) {
  const texto = String(avanceTexto || '').trim();
  if (!texto) throw new Error('El avance no puede estar vacío');

  const all = await readAll(teamId);
  const idx = all.findIndex((c) => String(c.id) === String(id));
  if (idx === -1) throw new Error('Compromiso no encontrado');

  if (!Array.isArray(all[idx].historial)) all[idx].historial = [];
  all[idx].historial.unshift({ fecha: fmt(new Date()), avance: texto });

  await writeAll(teamId, all);
  return getData(teamId);
}

/**
 * Importación única de datos iniciales. Por seguridad, se niega a hacer nada
 * si ya hay compromisos guardados en ese equipo.
 */
export async function importIfEmpty(teamId, compromisosIniciales) {
  const existentes = await readAll(teamId);
  if (existentes.length > 0) {
    throw new Error(
      `Ya hay ${existentes.length} compromiso(s) guardados. No se importó nada para evitar duplicar.`
    );
  }
  const client = await getClient();
  await client.set(keyCompromisos(teamId), JSON.stringify(compromisosIniciales));
  const maxId = compromisosIniciales.reduce((max, c) => Math.max(max, c.id), 0);
  await client.set(keyNextId(teamId), maxId);
  return getData(teamId);
}

/**
 * Migra los datos "planos" (de antes de que existieran equipos) hacia un
 * equipo específico. Se usa una sola vez, desde /setup.
 */
export async function migrateLegacyDataToTeam(teamId) {
  const client = await getClient();
  const existentesEnEquipo = await readAll(teamId);
  if (existentesEnEquipo.length > 0) {
    throw new Error('Ese equipo ya tiene compromisos — no se migró nada para evitar duplicar.');
  }
  const raw = await client.get('compromisos');
  if (!raw) throw new Error('No se encontraron datos antiguos ("compromisos") para migrar.');
  const list = JSON.parse(raw);
  await client.set(keyCompromisos(teamId), JSON.stringify(list));
  const rawNextId = await client.get('next_id');
  if (rawNextId) await client.set(keyNextId(teamId), rawNextId);
  return getData(teamId);
}
