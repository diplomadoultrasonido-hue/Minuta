import { getSessionFromRequestCookies } from '../../lib/auth';
import { importIfEmpty } from '../../lib/store';
import compromisosIniciales from '../../scripts/import-data.json';

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
  if (!process.env.LEGACY_ADMIN_USERNAME || session.username !== process.env.LEGACY_ADMIN_USERNAME) {
    res.status(403).json({ error: 'Esta importación solo aplica a la cuenta original' });
    return;
  }
  try {
    const result = await importIfEmpty(session.username, compromisosIniciales);
    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Error al importar los compromisos' });
  }
}
