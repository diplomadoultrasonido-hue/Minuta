import { getSessionFromRequestCookies } from '../../../lib/auth';
import { getGroupsWhereAdmin, addMemberToGroup } from '../../../lib/users';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  const session = getSessionFromRequestCookies(req.headers.cookie);
  if (!session) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }
  try {
    const { groupId, username, password, name, role } = req.body || {};
    const adminGroups = await getGroupsWhereAdmin(session.username);
    if (!adminGroups.some((g) => g.groupId === groupId)) {
      res.status(403).json({ error: 'No administras ese equipo' });
      return;
    }
    const result = await addMemberToGroup({ groupId, username, password, name, role });
    res.status(200).json({ ok: true, ...result });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message || 'Error al agregar a la persona' });
  }
}
