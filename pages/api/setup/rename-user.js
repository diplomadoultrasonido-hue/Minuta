import { checkSetupSecret } from '../../../lib/setupAuth';
import { renameUser } from '../../../lib/users';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  try {
    const { setupSecret, username, name } = req.body || {};
    checkSetupSecret(setupSecret);
    if (!username) throw new Error('Falta el usuario');
    await renameUser(username, name);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(e.statusCode || 400).json({ error: e.message || 'Error al renombrar' });
  }
}
