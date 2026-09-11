import { checkSetupSecret } from '../../../lib/setupAuth';
import { resetPassword } from '../../../lib/users';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  try {
    const { setupSecret, username, newPassword } = req.body || {};
    checkSetupSecret(setupSecret);
    if (!newPassword || String(newPassword).length < 6) {
      throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
    }
    await resetPassword(username, newPassword);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(e.statusCode || 400).json({ error: e.message || 'Error al restablecer la contraseña' });
  }
}
