import { checkSetupSecret } from '../../../lib/setupAuth';
import { setCanCreateGroups } from '../../../lib/users';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  try {
    const { setupSecret, username, value } = req.body || {};
    checkSetupSecret(setupSecret);
    if (!username) throw new Error('Falta el usuario');
    await setCanCreateGroups(username, value !== false);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(e.statusCode || 400).json({ error: e.message || 'Error al actualizar el permiso' });
  }
}
