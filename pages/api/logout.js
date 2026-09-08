import { clearSessionCookieHeader } from '../../lib/auth';

export default function handler(req, res) {
  res.setHeader('Set-Cookie', clearSessionCookieHeader());
  res.status(200).json({ ok: true });
}
