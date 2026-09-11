import { getSessionFromRequestCookies } from '../../lib/auth';
import { getUser, getGroupsWhereAdmin } from '../../lib/users';

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
    const adminGroups = await getGroupsWhereAdmin(session.username);

    res.status(200).json({
      authenticated: true,
      username: user.username,
      name: user.name,
      photo: user.photo || '',
      canCreateGroups: !!user.canCreateGroups,
      isAdmin: adminGroups.length > 0,
      adminGroups, // [{groupId, name, ownerUsername, createdAt}]
      isEditor: true,
      canImportLegacy: !!process.env.LEGACY_ADMIN_USERNAME && user.username === process.env.LEGACY_ADMIN_USERNAME,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ authenticated: false, error: e.message });
  }
}
