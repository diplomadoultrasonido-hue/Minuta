import {
  getComprosisosPorVencerManana,
  yaSeEnvioRecordatorio,
  marcarRecordatorioEnviado,
} from '../../../lib/store';
import { getFcmTokens, removeFcmToken } from '../../../lib/users';
import { getFcmMessaging } from '../../../lib/firebaseAdmin';

const TOKEN_INVALIDO = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
]);

// Este endpoint lo llama Vercel Cron una vez al día (ver vercel.json). Vercel
// manda automáticamente `Authorization: Bearer <CRON_SECRET>` cuando existe
// esa variable de entorno en el proyecto — así nos aseguramos de que nadie
// más pueda disparar notificaciones llamando a esta URL directamente.
export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  try {
    const compromisos = await getComprosisosPorVencerManana();
    const messaging = getFcmMessaging();
    let notificacionesEnviadas = 0;

    for (const c of compromisos) {
      const yaEnviado = await yaSeEnvioRecordatorio(c.id, c.promesaCierre);
      if (yaEnviado) continue;

      const usernames = Array.from(new Set(c.assignedTo || []));
      for (const username of usernames) {
        const tokens = await getFcmTokens(username);
        if (tokens.length === 0) continue;

        const response = await messaging.sendEachForMulticast({
          tokens,
          notification: {
            title: 'Compromiso por vencer mañana',
            body: `${c.compromiso} · vence el ${c.promesaCierre}`,
          },
          data: { url: '/dashboard', compromisoId: String(c.id) },
          webpush: { fcmOptions: { link: '/dashboard' } },
        });

        response.responses.forEach((r, i) => {
          if (!r.success && TOKEN_INVALIDO.has(r.error?.code)) {
            removeFcmToken(username, tokens[i]).catch(() => {});
          }
        });
        notificacionesEnviadas += response.successCount;
      }

      await marcarRecordatorioEnviado(c.id, c.promesaCierre);
    }

    res.status(200).json({
      ok: true,
      compromisosRevisados: compromisos.length,
      notificacionesEnviadas,
    });
  } catch (e) {
    console.error('Error en cron de vencimientos:', e);
    res.status(500).json({ error: e.message });
  }
}
