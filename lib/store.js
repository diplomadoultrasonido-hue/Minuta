import { getClient } from './redis';
import { getAssignableUsers, getUser, getCustomTipos } from './users';

// Estructura guardada en Redis:
//   'compromisos'  -> string JSON con el array de TODOS los compromisos del sistema
//   'next_id'      -> contador global para asignar ids

export const CATALOGO_BASE = {
  areas: ['Operativo', 'Proyectos Especiales y Formación', 'Entrenamiento continuo', 'Soporte Clínico', 'Analista', 'Todos'],
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
/**
 * Puede AGREGAR AVANCES cualquiera que pueda ver el compromiso (quien lo creó
 * o cualquiera de los asignados).
 */
function canAddAvance(c, username) {
  return canSee(c, username);
}
/**
 * Puede MODIFICAR el compromiso (estado, prioridad, tipo, fecha, reasignar):
 * solo quien lo creó, o un administrador que supervise a quien lo creó o a
 * alguno de los asignados (es decir, alguien de su propio equipo).
 */
async function canModify(c, username) {
  if (c.assignedBy === username) return true;
  const asignables = await getAssignableUsers(username);
  const set = new Set(asignables.map((a) => a.username));
  if (set.has(c.assignedBy)) return true;
  if ((c.assignedTo || []).some((u) => set.has(u))) return true;
  return false;
}

async function namesFor(usernames) {
  const users = await Promise.all((usernames || []).map((u) => getUser(u)));
  return users.filter(Boolean).map((u) => u.name);
}

export async function getData(username) {
  const all = await readAll();
  const visible = all.filter((c) => canSee(c, username));

  const withExtras = await Promise.all(
    visible.map(async (c) => {
      const historial = await Promise.all(
        (c.historial || []).map(async (h) => ({
          ...h,
          byName: h.by ? (await namesFor([h.by]))[0] || h.by : '',
        }))
      );
      const puedeModificar = await canModify(c, username);
      return { ...c, historial, canModify: puedeModificar };
    })
  );

  const compromisos = withExtras.map(withComputedFields).sort((a, b) => b.id - a.id);

  const asignables = await getAssignableUsers(username);
  const responsablesSet = new Set(asignables.map((a) => a.name));
  visible.forEach((c) => {
    if (c.responsable) c.responsable.split(', ').forEach((n) => n && responsablesSet.add(n));
  });

  const catalogo = {
    ...CATALOGO_BASE,
    responsables: Array.from(responsablesSet),
    asignables, // [{username, name}] — para las casillas de "Asignado a"
    tipos: await getTiposFor(username),
  };

  return { compromisos, catalogo };
}

const PRIORIDADES_VALIDAS = ['Alta', 'Media', 'Baja'];
const TIPOS_VALIDOS = ['1:1', 'General'];

async function getTiposFor(username) {
  const custom = await getCustomTipos(username);
  const combinados = [...TIPOS_VALIDOS];
  custom.forEach((t) => {
    if (!combinados.includes(t)) combinados.push(t);
  });
  return combinados;
}

function esFechaPasada(ddmmyyyy) {
  const d = parseDdmmyyyy(ddmmyyyy);
  if (!d) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return d < hoy;
}

export async function addCompromiso(username, data) {
  const asignables = await getAssignableUsers(username);
  const validUsernames = new Set(asignables.map((a) => a.username));

  let assignedTo = Array.isArray(data.assignedTo) ? data.assignedTo.filter((u) => validUsernames.has(u)) : [];

  const solicitadoPorUsernames = Array.isArray(data.solicitadoPor)
    ? data.solicitadoPor.filter((u) => validUsernames.has(u))
    : [];
  solicitadoPorUsernames.forEach((u) => {
    if (!assignedTo.includes(u)) assignedTo.push(u);
  });

  if (assignedTo.length === 0) assignedTo = [username]; // por defecto, a ti mismo

  if (!PRIORIDADES_VALIDAS.includes(data.prioridad)) {
    throw new Error('Elige una prioridad (Alta, Media o Baja)');
  }
  const tiposDisponibles = await getTiposFor(username);
  const tipo = tiposDisponibles.includes(data.tipo) ? data.tipo : 'General';

  if (data.promesaCierre && esFechaPasada(data.promesaCierre)) {
    throw new Error('La promesa de cierre no puede ser una fecha que ya pasó');
  }

  const responsableNames = await namesFor(assignedTo);
  const solicitadoPorNombre = (await namesFor(solicitadoPorUsernames)).join(', ');

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
    solicitadoPorUsernames,
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
  const puedeModificar = await canModify(all[idx], username);
  if (!puedeModificar) {
    throw new Error('Solo quien creó este compromiso o su administrador pueden modificarlo. Tú puedes agregar avances.');
  }

  if (updates.promesaCierre !== undefined && updates.promesaCierre !== all[idx].promesaCierre) {
    if (updates.promesaCierre && esFechaPasada(updates.promesaCierre)) {
      throw new Error('La promesa de cierre no puede ser una fecha que ya pasó');
    }
  }

  const allowed = ['status', 'promesaCierre', 'comentarios'];
  allowed.forEach((key) => {
    if (updates[key] !== undefined) all[idx][key] = updates[key];
  });

  if (updates.prioridad !== undefined) {
    if (!PRIORIDADES_VALIDAS.includes(updates.prioridad)) throw new Error('Prioridad inválida');
    all[idx].prioridad = updates.prioridad;
  }
  if (updates.tipo !== undefined) {
    const tiposDisponibles = await getTiposFor(username);
    all[idx].tipo = tiposDisponibles.includes(updates.tipo) ? updates.tipo : 'General';
  }

  // Reasignar o cambiar quién lo solicitó: mismo permiso que modificar en general.
  if (Array.isArray(updates.assignedTo) || Array.isArray(updates.solicitadoPor)) {
    const asignables = await getAssignableUsers(username);
    const validUsernames = new Set(asignables.map((a) => a.username));

    let assignedTo = Array.isArray(updates.assignedTo)
      ? updates.assignedTo.filter((u) => validUsernames.has(u))
      : all[idx].assignedTo || [];

    let solicitadoPorUsernames = Array.isArray(updates.solicitadoPor)
      ? updates.solicitadoPor.filter((u) => validUsernames.has(u))
      : all[idx].solicitadoPorUsernames || [];
    solicitadoPorUsernames.forEach((u) => {
      if (!assignedTo.includes(u)) assignedTo.push(u);
    });

    if (assignedTo.length > 0) {
      all[idx].assignedTo = assignedTo;
      all[idx].responsable = (await namesFor(assignedTo)).join(', ');
    }
    all[idx].solicitadoPorUsernames = solicitadoPorUsernames;
    all[idx].solicitadoPor = (await namesFor(solicitadoPorUsernames)).join(', ');
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
  if (!canAddAvance(all[idx], username)) throw new Error('No tienes permiso para agregar avances a este compromiso');

  if (!Array.isArray(all[idx].historial)) all[idx].historial = [];
  all[idx].historial.unshift({ fecha: fmt(new Date()), avance: texto, by: username });

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
export async function migrateLegacyDataToUser(usernameRaw, force) {
  const username = String(usernameRaw || '').toLowerCase().trim();
  const user = await getUser(username);
  if (!user) {
    throw new Error(`El usuario "${username}" no existe — créalo primero en el paso 1 o 2.`);
  }
  const all = await readAll();
  let migrados = 0;
  const dueñosAntes = {};
  all.forEach((c) => {
    dueñosAntes[c.assignedBy || '(sin dueño)'] = (dueñosAntes[c.assignedBy || '(sin dueño)'] || 0) + 1;
    if (!c.assignedBy || force) {
      c.assignedBy = username;
      c.assignedTo = [username];
      migrados++;
    }
  });
  await writeAll(all);
  return { migrados, total: all.length, yaAsignados: all.length - migrados, dueñosAntes };
}
