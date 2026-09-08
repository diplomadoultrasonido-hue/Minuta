import { getSessionFromRequestCookies } from '../../lib/auth';

export default function handler(req, res) {
  const session = getSessionFromRequestCookies(req.headers.cookie);
  if (!session) {
    res.status(401).json({ authenticated: false, isEditor: false });
    return;
  }
  res.status(200).json({ authenticated: true, isEditor: session.role === 'editor' });
}
