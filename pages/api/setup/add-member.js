import { checkSetupSecret } from '../../../lib/setupAuth';
import { addTeamMember } from '../../../lib/users';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  try {
    const { setupSecret, teamId, username, password, name, role } = req.body || {};
    checkSetupSecret(setupSecret);
    const result = await addTeamMember({ teamId, username, password, name, role });
    res.status(200).json({ ok: true, ...result });
  } catch (e) {
    console.error(e);
    res.status(e.statusCode || 400).json({ error: e.message || 'Error al agregar el miembro' });
  }
}
