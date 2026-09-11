import { getSessionFromRequestCookies } from '../../../lib/auth';
import { getUser, createGroupWithAdmin } from '../../../lib/users';

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
  try {
    const user = await getUser(session.username);
    if (!user || !user.canCreateGroups) {
      res.status(403).json({ error: 'No tienes permiso para crear un equipo. Pide al operador de la app que te lo habilite.' });
      return;
    }
    const { groupName } = req.body || {};
    if (!groupName) {
      res.status(400).json({ error: 'Falta el nombre del equipo' });
      return;
    }
    const result = await createGroupWithAdmin({ groupName, ownerUsername: session.username });
    res.status(200).json({ ok: true, ...result });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message || 'Error al crear el equipo' });
  }
}
