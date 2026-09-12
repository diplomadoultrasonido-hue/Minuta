import { checkSetupSecret } from '../../../lib/setupAuth';
import { removeMemberFromGroup } from '../../../lib/users';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  try {
    const { setupSecret, groupId, username } = req.body || {};
    checkSetupSecret(setupSecret);
    if (!groupId || !username) throw new Error('Falta el grupo o el usuario');
    await removeMemberFromGroup({ groupId, username });
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(e.statusCode || 400).json({ error: e.message || 'Error al quitar a la persona' });
  }
}
