import { createSessionToken, sessionCookieHeader } from '../../lib/auth';
import { getUser, verifyPassword } from '../../lib/users';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      res.status(400).json({ error: 'Falta usuario o contraseña' });
      return;
    }
    if (!process.env.SESSION_SECRET) {
      res.status(500).json({ error: 'El servidor no tiene configurada SESSION_SECRET' });
      return;
    }

    const user = await getUser(String(username).toLowerCase().trim());
    if (!user) {
      res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
      return;
    }
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
      return;
    }

    const token = createSessionToken({ username: user.username });
    res.setHeader('Set-Cookie', sessionCookieHeader(token));
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Error inesperado al iniciar sesión' });
  }
}
