import { checkSetupSecret } from '../../../lib/setupAuth';
import { migrateLegacyDataToTeam } from '../../../lib/store';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  try {
    const { setupSecret, teamId } = req.body || {};
    checkSetupSecret(setupSecret);
    const result = await migrateLegacyDataToTeam(teamId);
    res.status(200).json({ ok: true, total: result.compromisos.length });
  } catch (e) {
    console.error(e);
    res.status(e.statusCode || 400).json({ error: e.message || 'Error al migrar los datos' });
  }
}
