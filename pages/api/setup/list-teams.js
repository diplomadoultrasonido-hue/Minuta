import { checkSetupSecret } from '../../../lib/setupAuth';
import { listGroups, getGroupMembers } from '../../../lib/users';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  try {
    const { setupSecret } = req.body || {};
    checkSetupSecret(setupSecret);
    const groups = await listGroups();
    const withMembers = await Promise.all(
      groups.map(async (g) => ({ ...g, teamId: g.groupId, members: await getGroupMembers(g.groupId) }))
    );
    res.status(200).json({ teams: withMembers });
  } catch (e) {
    console.error(e);
    res.status(e.statusCode || 400).json({ error: e.message || 'Error al listar equipos' });
  }
}
