import { checkSetupSecret } from '../../../lib/setupAuth';
import { createTeam } from '../../../lib/users';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  try {
    const { setupSecret, teamName, adminUsername, adminPassword, adminName } = req.body || {};
    checkSetupSecret(setupSecret);
    const result = await createTeam({ teamName, adminUsername, adminPassword, adminName });
    res.status(200).json({ ok: true, ...result });
  } catch (e) {
    console.error(e);
    res.status(e.statusCode || 400).json({ error: e.message || 'Error al crear el equipo' });
  }
}
