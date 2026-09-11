import bcrypt from 'bcryptjs';
import { getClient } from './redis';

// Estructura en Redis:
//   'user:{username}'         -> JSON { username, passwordHash, name, photo, canCreateGroups }
//   'user:{username}:groups'  -> JSON array [{ groupId, role }]  (una persona puede estar en varios grupos)
//   'group:{groupId}:meta'    -> JSON { groupId, name, ownerUsername, createdAt }
//   'group:{groupId}:members' -> JSON array [{ username, role }]
//   'groups:index'            -> JSON array de groupIds (para el panel de /setup)

function keyUser(username) {
  return `user:${username.toLowerCase()}`;
}
function keyUserGroups(username) {
  return `user:${username.toLowerCase()}:groups`;
}
function keyGroupMeta(groupId) {
  return `group:${groupId}:meta`;
}
function keyGroupMembers(groupId) {
  return `group:${groupId}:members`;
}
const KEY_GROUPS_INDEX = 'groups:index';

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function hashPassword(password) {
  return bcrypt.hash(String(password), 10);
}
export async function verifyPassword(password, hash) {
  if (!hash) return false;
  return bcrypt.compare(String(password), hash);
}

export async function getUser(username) {
  if (!username) return null;
  const client = await getClient();
  const raw = await client.get(keyUser(username));
  return raw ? JSON.parse(raw) : null;
}

async function saveUser(user) {
  const client = await getClient();
  await client.set(keyUser(user.username), JSON.stringify(user));
}

export async function getUserGroups(username) {
  const client = await getClient();
  const raw = await client.get(keyUserGroups(username));
  return raw ? JSON.parse(raw) : [];
}

async function setUserGroups(username, groups) {
  const client = await getClient();
  await client.set(keyUserGroups(username), JSON.stringify(groups));
}

export async function getGroupMeta(groupId) {
  const client = await getClient();
  const raw = await client.get(keyGroupMeta(groupId));
  return raw ? JSON.parse(raw) : null;
}

export async function getGroupMembers(groupId) {
  const client = await getClient();
  const raw = await client.get(keyGroupMembers(groupId));
  const members = raw ? JSON.parse(raw) : [];
  const withNames = await Promise.all(
    members.map(async (m) => {
      const u = await getUser(m.username);
      return { username: m.username, role: m.role, name: u ? u.name : m.username };
    })
  );
  return withNames;
}

async function addGroupToIndex(groupId) {
  const client = await getClient();
  const raw = await client.get(KEY_GROUPS_INDEX);
  const ids = raw ? JSON.parse(raw) : [];
  if (!ids.includes(groupId)) {
    ids.push(groupId);
    await client.set(KEY_GROUPS_INDEX, JSON.stringify(ids));
  }
}

export async function listGroups() {
  const client = await getClient();
  const raw = await client.get(KEY_GROUPS_INDEX);
  const ids = raw ? JSON.parse(raw) : [];
  const metas = await Promise.all(ids.map((id) => getGroupMeta(id)));
  return metas.filter(Boolean);
}

async function addMembership(username, groupId, role) {
  const groups = await getUserGroups(username);
  const idx = groups.findIndex((g) => g.groupId === groupId);
  if (idx === -1) {
    groups.push({ groupId, role });
  } else {
    groups[idx].role = role;
  }
  await setUserGroups(username, groups);

  const client = await getClient();
  const raw = await client.get(keyGroupMembers(groupId));
  const members = raw ? JSON.parse(raw) : [];
  const mIdx = members.findIndex((m) => m.username === username);
  if (mIdx === -1) {
    members.push({ username, role });
  } else {
    members[mIdx].role = role;
  }
  await client.set(keyGroupMembers(groupId), JSON.stringify(members));
}

/**
 * Crea un grupo nuevo. `ownerUsername` puede ser un usuario ya existente
 * (cuando alguien crea su propio grupo desde la app) o uno nuevo que se crea
 * junto con el grupo (flujo de /setup).
 */
export async function createGroupWithAdmin({ groupName, ownerUsername, ownerPassword, ownerName, grantCanCreateGroups }) {
  if (!groupName) throw new Error('Falta el nombre del grupo');
  const client = await getClient();

  let groupId = slugify(groupName) || 'grupo';
  let suffix = 1;
  while (await client.get(keyGroupMeta(groupId))) {
    suffix += 1;
    groupId = `${slugify(groupName)}-${suffix}`;
  }

  let username = String(ownerUsername).toLowerCase().trim();
  let existing = await getUser(username);
  if (!existing) {
    if (!ownerPassword || !ownerName) throw new Error('Faltan datos del administrador (usuario nuevo)');
    const passwordHash = await hashPassword(ownerPassword);
    await saveUser({
      username,
      passwordHash,
      name: ownerName,
      photo: '',
      canCreateGroups: !!grantCanCreateGroups,
    });
  }

  await client.set(
    keyGroupMeta(groupId),
    JSON.stringify({ groupId, name: groupName, ownerUsername: username, createdAt: new Date().toISOString() })
  );
  await addGroupToIndex(groupId);
  await addMembership(username, groupId, 'admin');

  return { groupId };
}

/**
 * Agrega un miembro a un grupo. Si el usuario ya existe en el sistema
 * (puede ser de otro grupo), solo se agrega la membresía; si no existe, se
 * crea la cuenta.
 */
export async function addMemberToGroup({ groupId, username, password, name, role }) {
  const group = await getGroupMeta(groupId);
  if (!group) throw new Error('Ese grupo no existe');

  const uname = String(username).toLowerCase().trim();
  if (!uname) throw new Error('Falta el usuario');

  let user = await getUser(uname);
  if (!user) {
    if (!password || !name) throw new Error('Faltan datos para crear la cuenta nueva');
    const passwordHash = await hashPassword(password);
    user = { username: uname, passwordHash, name, photo: '', canCreateGroups: false };
    await saveUser(user);
  }

  await addMembership(uname, groupId, role === 'admin' ? 'admin' : 'member');
  return { username: uname, groupId };
}

export async function setCanCreateGroups(username, value) {
  const user = await getUser(username);
  if (!user) throw new Error('Usuario no encontrado');
  user.canCreateGroups = !!value;
  await saveUser(user);
}

export async function resetPassword(username, newPassword) {
  const user = await getUser(username);
  if (!user) throw new Error('Usuario no encontrado');
  user.passwordHash = await hashPassword(newPassword);
  await saveUser(user);
}

export async function updateOwnProfile(username, { name, photo, currentPassword, newPassword }) {
  const user = await getUser(username);
  if (!user) throw new Error('Usuario no encontrado');

  if (newPassword) {
    const ok = await verifyPassword(currentPassword || '', user.passwordHash);
    if (!ok) throw new Error('La contraseña actual no es correcta');
    user.passwordHash = await hashPassword(newPassword);
  }
  if (typeof name === 'string' && name.trim()) {
    user.name = name.trim();
  }
  if (typeof photo === 'string') {
    user.photo = photo;
  }
  await saveUser(user);
  return { username: user.username, name: user.name, photo: user.photo, canCreateGroups: user.canCreateGroups };
}

/**
 * Grupos donde este usuario es administrador (puede agregar gente y
 * asignarles compromisos).
 */
export async function getGroupsWhereAdmin(username) {
  const groups = await getUserGroups(username);
  const adminGroupIds = groups.filter((g) => g.role === 'admin').map((g) => g.groupId);
  const metas = await Promise.all(adminGroupIds.map((id) => getGroupMeta(id)));
  return metas.filter(Boolean);
}

/**
 * Lista de personas que este usuario puede elegir como "asignado a" al crear
 * un compromiso: él mismo, más todos los miembros de los grupos que administra.
 */
export async function getAssignableUsers(username) {
  const user = await getUser(username);
  const map = new Map();
  if (user) map.set(username, { username, name: user.name });

  const adminGroups = await getGroupsWhereAdmin(username);
  for (const g of adminGroups) {
    const members = await getGroupMembers(g.groupId);
    members.forEach((m) => map.set(m.username, { username: m.username, name: m.name }));
  }
  return Array.from(map.values());
}
