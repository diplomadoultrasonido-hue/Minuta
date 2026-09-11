import { getSessionFromRequestCookies } from '../../lib/auth';
import { getUser } from '../../lib/users';

export default async function handler(req, res) {
  const session = getSessionFromRequestCookies(req.headers.cookie);
  if (!session) {
    res.status(401).json({ authenticated: false });
    return;
  }
  try {
    const user = await getUser(session.username);
    if (!user) {
      res.status(401).json({ authenticated: false });
      return;
    }
    res.status(200).json({
      authenticated: true,
      username: user.username,
      name: user.name,
      photo: user.photo || '',
      role: user.role,
      teamId: user.teamId,
      isEditor: true, // tanto admin como miembro pueden agregar/editar
      isAdmin: user.role === 'admin',
      canImportLegacy: !!process.env.LEGACY_TEAM_ID && user.teamId === process.env.LEGACY_TEAM_ID,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ authenticated: false, error: e.message });
  }
}
