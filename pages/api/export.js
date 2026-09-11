import { getSessionFromRequestCookies } from '../../lib/auth';
import { getData } from '../../lib/store';
import * as XLSX from 'xlsx';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  const session = getSessionFromRequestCookies(req.headers.cookie);
  if (!session) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }

  try {
    const { compromisos } = await getData(session.teamId);
    const ordenados = compromisos.slice().sort((a, b) => a.id - b.id);

    const filasPrincipales = ordenados.map((c) => ({
      'FECHA JUNTA': c.fecha,
      ÁREA: c.area,
      TEMA: c.tema,
      'ACTIVIDAD/COMPROMISO': c.compromiso,
      RESPONSABLE: c.responsable,
      'SOLICITADO POR': c.solicitadoPor,
      'PROMESA CIERRE': c.promesaCierre,
      'DIAS VENCIDO': c.diasVencido,
      STATUS: c.status,
      COMENTARIOS: c.comentarios,
    }));

    const filasHistorial = [];
    ordenados.forEach((c) => {
      (c.historial || [])
        .slice()
        .reverse()
        .forEach((h) => {
          filasHistorial.push({ ID_COMPROMISO: c.id, FECHA: h.fecha, AVANCE: h.avance });
        });
    });

    const wb = XLSX.utils.book_new();
    const wsPrincipal = XLSX.utils.json_to_sheet(filasPrincipales);
    XLSX.utils.book_append_sheet(wb, wsPrincipal, 'Compromisos');

    const wsHistorial = XLSX.utils.json_to_sheet(
      filasHistorial.length ? filasHistorial : [{ ID_COMPROMISO: '', FECHA: '', AVANCE: '' }]
    );
    XLSX.utils.book_append_sheet(wb, wsHistorial, 'Historial');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const fecha = new Date().toISOString().slice(0, 10);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="minuta-ultrasonido-${fecha}.xlsx"`);
    res.status(200).send(buffer);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Error al exportar' });
  }
}
