import { getSessionFromRequestCookies } from '../../../lib/auth';
import { getUser, getGroupsWhereAdmin, getGroupMembers } from '../../../lib/users';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  const session = getSessionFromRequestCookies(req.headers.cookie);
  if (!session) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }
  try {
    const user = await getUser(session.username);
    const groups = await getGroupsWhereAdmin(session.username);
    const withMembers = await Promise.all(
      groups.map(async (g) => ({ ...g, members: await getGroupMembers(g.groupId) }))
    );
    res.status(200).json({ canCreateGroups: !!(user && user.canCreateGroups), groups: withMembers });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Error al cargar tu equipo' });
  }
}
