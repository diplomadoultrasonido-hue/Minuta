import { getSessionFromRequestCookies } from '../../../lib/auth';
import { getGroupsWhereAdmin, removeMemberFromGroup } from '../../../lib/users';

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
    const { groupId, username } = req.body || {};
    const adminGroups = await getGroupsWhereAdmin(session.username);
    if (!adminGroups.some((g) => g.groupId === groupId)) {
      res.status(403).json({ error: 'No administras ese equipo' });
      return;
    }
    await removeMemberFromGroup({ groupId, username });
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message || 'Error al quitar a la persona' });
  }
}
