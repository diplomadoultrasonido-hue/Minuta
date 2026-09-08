import { getSessionFromRequestCookies } from '../../lib/auth';
import { importIfEmpty } from '../../lib/store';
import compromisosIniciales from '../../scripts/import-data.json';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const session = getSessionFromRequestCookies(req.headers.cookie);
  if (!session || session.role !== 'editor') {
    res.status(403).json({ error: 'No tienes permiso para importar datos' });
    return;
  }

  try {
    const result = await importIfEmpty(compromisosIniciales);
    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Error al importar los compromisos' });
  }
}
