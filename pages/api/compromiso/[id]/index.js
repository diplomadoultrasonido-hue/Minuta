import { getSessionFromRequestCookies } from '../../../../lib/auth';
import { updateCompromiso } from '../../../../lib/store';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const session = getSessionFromRequestCookies(req.headers.cookie);
  if (!session || session.role !== 'editor') {
    res.status(403).json({ error: 'No tienes permiso para editar este compromiso' });
    return;
  }

  const { id } = req.query;

  try {
    const result = await updateCompromiso(id, req.body || {});
    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Error al actualizar el compromiso' });
  }
}
