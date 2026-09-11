import { checkSetupSecret } from '../../../lib/setupAuth';
import { listTeams, getTeamMembers } from '../../../lib/users';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  try {
    const { setupSecret } = req.body || {};
    checkSetupSecret(setupSecret);
    const teams = await listTeams();
    const withMembers = await Promise.all(
      teams.map(async (t) => ({ ...t, members: await getTeamMembers(t.teamId) }))
    );
    res.status(200).json({ teams: withMembers });
  } catch (e) {
    console.error(e);
    res.status(e.statusCode || 400).json({ error: e.message || 'Error al listar equipos' });
  }
}
