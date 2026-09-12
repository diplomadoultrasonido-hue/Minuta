import { getClient } from './redis';
import { getAssignableUsers, getUser } from './users';

// Estructura guardada en Redis:
//   'compromisos'  -> string JSON con el array de TODOS los compromisos del sistema
//   'next_id'      -> contador global para asignar ids

export const CATALOGO_BASE = {
  areas: ['Operaciones', 'Diplomados y Proyectos', 'Entrenamiento continuo', 'Soporte', 'Analista', 'Todos'],
  status: ['Nuevo', 'Abierto', 'Acuerdo', 'Vencido', 'Cerrado'],
};

const KEY_COMPROMISOS = 'compromisos';
const KEY_NEXT_ID = 'next_id';

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

function canSee(c, username) {
  return c.assignedBy === username || (Array.isArray(c.assignedTo) && c.assignedTo.includes(username));
}
function canEdit(c, username) {
  return canSee(c, username);
}

async function namesFor(usernames) {
  const users = await Promise.all((usernames || []).map((u) => getUser(u)));
  return users.filter(Boolean).map((u) => u.name);
}

export async function getData(username) {
  const all = await readAll();
  const visible = all.filter((c) => canSee(c, username));
  const compromisos = visible.map(withComputedFields).sort((a, b) => b.id - a.id);

  const asignables = await getAssignableUsers(username);
  const responsablesSet = new Set(asignables.map((a) => a.name));
  visible.forEach((c) => {
    if (c.responsable) c.responsable.split(', ').forEach((n) => n && responsablesSet.add(n));
  });

  const catalogo = {
    ...CATALOGO_BASE,
    responsables: Array.from(responsablesSet),
    asignables, // [{username, name}] — para las casillas de "Asignado a"
  };

  return { compromisos, catalogo };
}

const PRIORIDADES_VALIDAS = ['Alta', 'Media', 'Baja'];
const TIPOS_VALIDOS = ['1:1', 'General'];

export async function addCompromiso(username, data) {
  const asignables = await getAssignableUsers(username);
  const validUsernames = new Set(asignables.map((a) => a.username));

  let assignedTo = Array.isArray(data.assignedTo) ? data.assignedTo.filter((u) => validUsernames.has(u)) : [];

  let solicitadoPorUsername = '';
  if (data.solicitadoPor) {
    if (!validUsernames.has(data.solicitadoPor)) {
      throw new Error('"Solicitado por" debe ser alguien de tu equipo');
    }
    solicitadoPorUsername = data.solicitadoPor;
    if (!assignedTo.includes(solicitadoPorUsername)) assignedTo.push(solicitadoPorUsername);
  }

  if (assignedTo.length === 0) assignedTo = [username]; // por defecto, a ti mismo

  if (!PRIORIDADES_VALIDAS.includes(data.prioridad)) {
    throw new Error('Elige una prioridad (Alta, Media o Baja)');
  }
  const tipo = TIPOS_VALIDOS.includes(data.tipo) ? data.tipo : 'General';

  const responsableNames = await namesFor(assignedTo);
  const solicitadoPorNombre = solicitadoPorUsername ? (await namesFor([solicitadoPorUsername]))[0] : '';

  const all = await readAll();
  const id = await nextId();
  const nuevo = {
    id,
    fecha: data.fecha || fmt(new Date()),
    area: data.area || '',
    tema: data.tema || '',
    compromiso: data.compromiso || '',
    responsable: responsableNames.join(', '),
    assignedBy: username,
    assignedTo,
    solicitadoPor: solicitadoPorNombre,
    solicitadoPorUsername,
    prioridad: data.prioridad,
    tipo,
    promesaCierre: data.promesaCierre || '',
    status: data.status || 'Nuevo',
    comentarios: data.comentarios || '',
    historial: [],
  };
  all.push(nuevo);
  await writeAll(all);
  return getData(username);
}

export async function updateCompromiso(username, id, updates) {
  const all = await readAll();
  const idx = all.findIndex((c) => String(c.id) === String(id));
  if (idx === -1) throw new Error('Compromiso no encontrado');
  if (!canEdit(all[idx], username)) throw new Error('No tienes permiso para editar este compromiso');

  const allowed = ['status', 'promesaCierre', 'comentarios'];
  allowed.forEach((key) => {
    if (updates[key] !== undefined) all[idx][key] = updates[key];
  });

  if (updates.prioridad !== undefined) {
    if (!PRIORIDADES_VALIDAS.includes(updates.prioridad)) throw new Error('Prioridad inválida');
    all[idx].prioridad = updates.prioridad;
  }
  if (updates.tipo !== undefined) {
    all[idx].tipo = TIPOS_VALIDOS.includes(updates.tipo) ? updates.tipo : 'General';
  }

  // Solo quien creó el compromiso puede reasignarlo o cambiar quién lo solicitó.
  if ((Array.isArray(updates.assignedTo) || updates.solicitadoPor !== undefined) && all[idx].assignedBy === username) {
    const asignables = await getAssignableUsers(username);
    const validUsernames = new Set(asignables.map((a) => a.username));

    let assignedTo = Array.isArray(updates.assignedTo)
      ? updates.assignedTo.filter((u) => validUsernames.has(u))
      : all[idx].assignedTo || [];

    let solicitadoPorUsername = all[idx].solicitadoPorUsername || '';
    if (updates.solicitadoPor !== undefined) {
      if (updates.solicitadoPor && !validUsernames.has(updates.solicitadoPor)) {
        throw new Error('"Solicitado por" debe ser alguien de tu equipo');
      }
      solicitadoPorUsername = updates.solicitadoPor || '';
      if (solicitadoPorUsername && !assignedTo.includes(solicitadoPorUsername)) assignedTo.push(solicitadoPorUsername);
    }

    if (assignedTo.length > 0) {
      all[idx].assignedTo = assignedTo;
      all[idx].responsable = (await namesFor(assignedTo)).join(', ');
    }
    all[idx].solicitadoPorUsername = solicitadoPorUsername;
    all[idx].solicitadoPor = solicitadoPorUsername ? (await namesFor([solicitadoPorUsername]))[0] : '';
  }

  await writeAll(all);
  return getData(username);
}

export async function addAvance(username, id, avanceTexto) {
  const texto = String(avanceTexto || '').trim();
  if (!texto) throw new Error('El avance no puede estar vacío');

  const all = await readAll();
  const idx = all.findIndex((c) => String(c.id) === String(id));
  if (idx === -1) throw new Error('Compromiso no encontrado');
  if (!canEdit(all[idx], username)) throw new Error('No tienes permiso para editar este compromiso');

  if (!Array.isArray(all[idx].historial)) all[idx].historial = [];
  all[idx].historial.unshift({ fecha: fmt(new Date()), avance: texto });

  await writeAll(all);
  return getData(username);
}

/**
 * Importación única de datos iniciales, asignados directamente a `username`
 * (el admin que hace la migración). Se niega si ya hay compromisos en el sistema.
 */
export async function importIfEmpty(username, compromisosIniciales) {
  const existentes = await readAll();
  if (existentes.length > 0) {
    throw new Error('Ya hay compromisos guardados en el sistema — no se importó nada para evitar duplicar.');
  }
  const conAsignacion = compromisosIniciales.map((c) => ({
    ...c,
    assignedBy: username,
    assignedTo: [username],
  }));
  const client = await getClient();
  await client.set(KEY_COMPROMISOS, JSON.stringify(conAsignacion));
  const maxId = conAsignacion.reduce((max, c) => Math.max(max, c.id), 0);
  await client.set(KEY_NEXT_ID, maxId);
  return getData(username);
}

/**
 * Migra los compromisos que ya existían en el sistema (de antes de este
 * cambio) para que queden asignados a `username`. Se usa una sola vez desde
 * /setup.
 */
export async function migrateLegacyDataToUser(usernameRaw) {
  const username = String(usernameRaw || '').toLowerCase().trim();
  const user = await getUser(username);
  if (!user) {
    throw new Error(`El usuario "${username}" no existe — créalo primero en el paso 1 o 2.`);
  }
  const all = await readAll();
  let migrados = 0;
  all.forEach((c) => {
    if (!c.assignedBy) {
      c.assignedBy = username;
      c.assignedTo = [username];
      migrados++;
    }
  });
  await writeAll(all);
  return { migrados, total: all.length };
}
