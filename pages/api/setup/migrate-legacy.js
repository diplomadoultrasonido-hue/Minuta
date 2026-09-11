import { checkSetupSecret } from '../../../lib/setupAuth';
import { migrateLegacyDataToUser } from '../../../lib/store';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  try {
    const { setupSecret, username } = req.body || {};
    checkSetupSecret(setupSecret);
    if (!username) throw new Error('Falta el usuario destino');
    const result = await migrateLegacyDataToUser(username);
    res.status(200).json({ ok: true, ...result });
  } catch (e) {
    console.error(e);
    res.status(e.statusCode || 400).json({ error: e.message || 'Error al migrar los datos' });
  }
}
