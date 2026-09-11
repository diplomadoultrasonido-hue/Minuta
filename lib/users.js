import bcrypt from 'bcryptjs';
import { getClient } from './redis';

// Estructura en Redis:
//   'user:{username}'        -> JSON { username, passwordHash, name, photo, role, teamId }
//   'team:{teamId}:meta'     -> JSON { teamId, name, createdAt }
//   'team:{teamId}:members'  -> JSON array de usernames
//   'teams:index'            -> JSON array de teamIds (para el panel de /setup)

function keyUser(username) {
  return `user:${username.toLowerCase()}`;
}
function keyTeamMeta(teamId) {
  return `team:${teamId}:meta`;
}
function keyTeamMembers(teamId) {
  return `team:${teamId}:members`;
}
const KEY_TEAMS_INDEX = 'teams:index';

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

export async function getTeamMeta(teamId) {
  const client = await getClient();
  const raw = await client.get(keyTeamMeta(teamId));
  return raw ? JSON.parse(raw) : null;
}

export async function getTeamMemberUsernames(teamId) {
  const client = await getClient();
  const raw = await client.get(keyTeamMembers(teamId));
  return raw ? JSON.parse(raw) : [];
}

export async function getTeamMembers(teamId) {
  const usernames = await getTeamMemberUsernames(teamId);
  const users = await Promise.all(usernames.map((u) => getUser(u)));
  return users.filter(Boolean).map((u) => ({ username: u.username, name: u.name, role: u.role }));
}

export async function listTeams() {
  const client = await getClient();
  const raw = await client.get(KEY_TEAMS_INDEX);
  const ids = raw ? JSON.parse(raw) : [];
  const metas = await Promise.all(ids.map((id) => getTeamMeta(id)));
  return metas.filter(Boolean);
}

async function addTeamToIndex(teamId) {
  const client = await getClient();
  const raw = await client.get(KEY_TEAMS_INDEX);
  const ids = raw ? JSON.parse(raw) : [];
  if (!ids.includes(teamId)) {
    ids.push(teamId);
    await client.set(KEY_TEAMS_INDEX, JSON.stringify(ids));
  }
}

async function addUserToTeam(teamId, username) {
  const client = await getClient();
  const raw = await client.get(keyTeamMembers(teamId));
  const usernames = raw ? JSON.parse(raw) : [];
  if (!usernames.includes(username)) {
    usernames.push(username);
    await client.set(keyTeamMembers(teamId), JSON.stringify(usernames));
  }
}

/**
 * Crea un equipo nuevo junto con su primer usuario administrador.
 */
export async function createTeam({ teamName, adminUsername, adminPassword, adminName }) {
  const username = String(adminUsername).toLowerCase().trim();
  if (!username || !adminPassword || !adminName || !teamName) {
    throw new Error('Faltan datos para crear el equipo');
  }
  const existing = await getUser(username);
  if (existing) throw new Error(`El usuario "${username}" ya existe`);

  let teamId = slugify(teamName) || 'equipo';
  const client = await getClient();
  let suffix = 1;
  while (await client.get(keyTeamMeta(teamId))) {
    suffix += 1;
    teamId = `${slugify(teamName)}-${suffix}`;
  }

  await client.set(
    keyTeamMeta(teamId),
    JSON.stringify({ teamId, name: teamName, createdAt: new Date().toISOString() })
  );
  await addTeamToIndex(teamId);

  const passwordHash = await hashPassword(adminPassword);
  await saveUser({ username, passwordHash, name: adminName, photo: '', role: 'admin', teamId });
  await addUserToTeam(teamId, username);

  return { teamId };
}

/**
 * Agrega un miembro (subordinado) a un equipo ya existente.
 */
export async function addTeamMember({ teamId, username, password, name, role }) {
  const uname = String(username).toLowerCase().trim();
  if (!uname || !password || !name || !teamId) {
    throw new Error('Faltan datos para crear la cuenta');
  }
  const team = await getTeamMeta(teamId);
  if (!team) throw new Error('Ese equipo no existe');

  const existing = await getUser(uname);
  if (existing) throw new Error(`El usuario "${uname}" ya existe`);

  const passwordHash = await hashPassword(password);
  await saveUser({ username: uname, passwordHash, name, photo: '', role: role === 'admin' ? 'admin' : 'member', teamId });
  await addUserToTeam(teamId, uname);
  return { username: uname, teamId };
}

/**
 * Restablece la contraseña de un usuario existente (uso del operador vía /setup).
 */
export async function resetPassword(username, newPassword) {
  const user = await getUser(username);
  if (!user) throw new Error('Usuario no encontrado');
  user.passwordHash = await hashPassword(newPassword);
  await saveUser(user);
}

/**
 * El propio usuario actualiza su nombre, foto y/o contraseña.
 */
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
  return { username: user.username, name: user.name, photo: user.photo, role: user.role, teamId: user.teamId };
}
