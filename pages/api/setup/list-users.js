import { checkSetupSecret } from '../../../lib/setupAuth';
import { listAllUsers } from '../../../lib/users';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  try {
    const { setupSecret } = req.body || {};
    checkSetupSecret(setupSecret);
    const users = await listAllUsers();
    res.status(200).json({ users });
  } catch (e) {
    console.error(e);
    res.status(e.statusCode || 400).json({ error: e.message || 'Error al listar usuarios' });
  }
}
