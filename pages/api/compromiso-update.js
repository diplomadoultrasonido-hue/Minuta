import { getSessionFromRequestCookies } from '../../lib/auth';
import { updateCompromiso } from '../../lib/store';

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
  const { id, ...updates } = req.body || {};
  if (!id) {
    res.status(400).json({ error: 'Falta el id del compromiso' });
    return;
  }
  try {
    const result = await updateCompromiso(session.teamId, id, updates);
    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Error al actualizar el compromiso' });
  }
}
