import { getSessionFromRequestCookies } from '../../lib/auth';
import { updateOwnProfile } from '../../lib/users';

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

  const { name, photo, currentPassword, newPassword } = req.body || {};

  if (photo && typeof photo === 'string' && photo.length > 900000) {
    res.status(400).json({ error: 'La foto es demasiado grande, intenta con una más pequeña' });
    return;
  }
  if (newPassword && String(newPassword).length < 6) {
    res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    return;
  }

  try {
    const updated = await updateOwnProfile(session.username, { name, photo, currentPassword, newPassword });
    res.status(200).json({ ok: true, ...updated });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message || 'No se pudo actualizar el perfil' });
  }
}
