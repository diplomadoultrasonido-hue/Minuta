import { getSessionFromRequestCookies } from '../../../lib/auth';
import { addFcmToken } from '../../../lib/users';

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

  const { token } = req.body || {};
  if (!token || typeof token !== 'string') {
    res.status(400).json({ error: 'Falta el token' });
    return;
  }

  try {
    await addFcmToken(session.username, token);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
