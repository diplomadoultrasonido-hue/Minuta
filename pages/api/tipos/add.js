import { getSessionFromRequestCookies } from '../../../lib/auth';
import { getGroupsWhereAdmin, addCustomTipo } from '../../../lib/users';
import { getData } from '../../../lib/store';

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
    const adminGroups = await getGroupsWhereAdmin(session.username);
    if (adminGroups.length === 0) {
      res.status(403).json({ error: 'Solo un administrador de equipo puede agregar nuevos tipos' });
      return;
    }
    const { tipo } = req.body || {};
    await addCustomTipo(session.username, tipo);
    const data = await getData(session.username);
    res.status(200).json(data);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message || 'Error al agregar el tipo' });
  }
}
