import { createSessionToken, sessionCookieHeader } from '../../lib/auth';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const { password, editPassword } = req.body || {};

  const viewPassword = process.env.VIEW_PASSWORD;
  const editPasswordEnv = process.env.EDIT_PASSWORD;

  if (!viewPassword) {
    res.status(500).json({ error: 'El servidor no tiene configurada VIEW_PASSWORD' });
    return;
  }

  if (password !== viewPassword) {
    res.status(401).json({ error: 'Contraseña incorrecta' });
    return;
  }

  const isEditor = !!editPasswordEnv && !!editPassword && editPassword === editPasswordEnv;
  const token = createSessionToken(isEditor ? 'editor' : 'viewer');

  res.setHeader('Set-Cookie', sessionCookieHeader(token));
  res.status(200).json({ ok: true, isEditor });
}
