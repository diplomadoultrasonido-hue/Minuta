import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const PAGE_STYLES = `
  :root{
    --paper:#F7F7F4; --ink:#1E2A28; --ink-soft:#5B655F; --line:#E1DFD9; --card:#FFFFFF;
    --teal:#23616B; --teal-soft:#E7EFEF; --slate:#6B7AA1; --slate-soft:#EAEDF4;
    --amber:#C2872F; --amber-soft:#F6EBD9; --brick:#B23A32; --brick-soft:#F7E4E1;
    --sage:#5F8B62; --sage-soft:#E9F0E9;
  }
  *{box-sizing:border-box;}
  body{margin:0;background:var(--paper);color:var(--ink);font-family:'IBM Plex Sans', sans-serif;-webkit-font-smoothing:antialiased;}
  .wrap{max-width:1040px;margin:0 auto;padding:32px 24px 80px;}
  header.top{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;border-bottom:1px solid var(--line);padding-bottom:20px;margin-bottom:28px;flex-wrap:wrap;}
  h1{font-family:'Fraunces', serif;font-weight:500;font-size:30px;margin:0 0 4px;letter-spacing:-0.01em;}
  .subtitle{color:var(--ink-soft);font-size:14px;margin:0;}
  .header-right{display:flex;align-items:center;gap:10px;}
  .meeting-chip{font-family:'IBM Plex Mono', monospace;font-size:12.5px;color:var(--teal);background:var(--teal-soft);border-radius:3px;padding:6px 10px;white-space:nowrap;}
  .stats{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:28px;}
  .stat{background:var(--card);border:1px solid var(--line);border-radius:6px;padding:14px 14px 12px;cursor:pointer;transition:border-color .15s ease;}
  .stat:hover{border-color:var(--ink-soft);}
  .stat.active{border-color:var(--ink);}
  .stat .n{font-family:'Fraunces', serif;font-size:26px;font-weight:500;line-height:1;}
  .stat .l{font-size:12px;color:var(--ink-soft);margin-top:4px;}
  .stat.nuevo .n{color:var(--slate);}
  .stat.abierto .n{color:var(--teal);}
  .stat.acuerdo .n{color:var(--amber);}
  .stat.vencido .n{color:var(--brick);}
  .stat.cerrado .n{color:var(--sage);}
  .toolbar{display:flex;gap:10px;align-items:center;margin-bottom:18px;flex-wrap:wrap;}
  select, input[type=text], input[type=date], textarea{font-family:'IBM Plex Sans', sans-serif;font-size:13.5px;border:1px solid var(--line);border-radius:5px;padding:8px 10px;background:var(--card);color:var(--ink);}
  .toolbar select{min-width:150px;}
  .search-box{position:relative;flex:1;min-width:200px;}
  .search-box input{width:100%;padding-left:30px;}
  .search-box svg{position:absolute;left:9px;top:50%;transform:translateY(-50%);width:14px;height:14px;opacity:.45;}
  button{font-family:'IBM Plex Sans', sans-serif;font-size:13.5px;font-weight:500;border:none;border-radius:5px;padding:9px 16px;cursor:pointer;transition:opacity .15s ease;}
  button:hover{opacity:.88;}
  .btn-primary{background:var(--ink);color:var(--paper);}
  .btn-ghost{background:transparent;color:var(--ink);border:1px solid var(--line);}
  .btn-sm{padding:6px 12px;font-size:12.5px;}
  .list{display:flex;flex-direction:column;gap:8px;}
  .item{background:var(--card);border:1px solid var(--line);border-left:3px solid var(--slate);border-radius:6px;padding:14px 16px;display:grid;grid-template-columns:1fr auto;gap:12px;align-items:start;}
  .item.status-abierto{border-left-color:var(--teal);}
  .item.status-acuerdo{border-left-color:var(--amber);}
  .item.status-vencido{border-left-color:var(--brick);}
  .item.status-cerrado{border-left-color:var(--sage);opacity:.72;}
  .item .compromiso{font-size:14.5px;line-height:1.45;margin:0 0 8px;}
  .meta{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:12px;color:var(--ink-soft);}
  .meta b{color:var(--ink);font-weight:500;}
  .badge{display:inline-block;font-size:11px;font-weight:500;padding:3px 9px;border-radius:20px;white-space:nowrap;}
  .badge.nuevo{background:var(--slate-soft);color:var(--slate);}
  .badge.abierto{background:var(--teal-soft);color:var(--teal);}
  .badge.acuerdo{background:var(--amber-soft);color:var(--amber);}
  .badge.vencido{background:var(--brick-soft);color:var(--brick);}
  .badge.cerrado{background:var(--sage-soft);color:var(--sage);}
  .vencido-tag{font-size:11px;color:var(--brick);font-weight:500;}
  .avance-count{font-size:11px;color:var(--teal);}
  .item-actions{display:flex;flex-direction:column;gap:6px;align-items:flex-end;}
  .empty{text-align:center;padding:60px 20px;color:var(--ink-soft);font-size:14px;}
  .overlay{position:fixed;inset:0;background:rgba(30,42,40,.35);display:none;align-items:center;justify-content:center;padding:20px;z-index:10;}
  .overlay.show{display:flex;}
  .modal{background:var(--card);border-radius:8px;width:100%;max-width:520px;padding:24px;max-height:88vh;overflow-y:auto;}
  .modal h2{font-family:'Fraunces', serif;font-weight:500;font-size:20px;margin:0 0 4px;}
  .field{margin-bottom:12px;display:flex;flex-direction:column;gap:5px;}
  .field label{font-size:12px;color:var(--ink-soft);}
  .field select, .field input, .field textarea{width:100%;}
  .field textarea{resize:vertical;min-height:64px;font-family:inherit;}
  .modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px;}
  .row2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .section-divider{border-top:1px solid var(--line);margin:20px 0 14px;padding-top:16px;}
  .section-divider h3{font-family:'Fraunces', serif;font-weight:500;font-size:15.5px;margin:0 0 10px;}
  .timeline{display:flex;flex-direction:column;gap:10px;margin-bottom:14px;max-height:220px;overflow-y:auto;}
  .timeline-item{border-left:2px solid var(--line);padding-left:12px;position:relative;}
  .timeline-item::before{content:'';position:absolute;left:-5px;top:3px;width:8px;height:8px;border-radius:50%;background:var(--teal);}
  .timeline-item .t-fecha{font-family:'IBM Plex Mono', monospace;font-size:11px;color:var(--ink-soft);}
  .timeline-item .t-texto{font-size:13.5px;margin-top:2px;line-height:1.4;}
  .timeline-empty{font-size:13px;color:var(--ink-soft);font-style:italic;margin-bottom:14px;}
  .fab{position:fixed;bottom:28px;right:28px;width:52px;height:52px;border-radius:50%;background:var(--ink);color:var(--paper);font-size:26px;line-height:1;display:none;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.18);cursor:pointer;}
  .toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:var(--ink);color:var(--paper);padding:10px 18px;border-radius:6px;font-size:13px;opacity:0;pointer-events:none;transition:opacity .2s ease;}
  .toast.show{opacity:1;}
  @media (max-width:720px){
    .stats{grid-template-columns:repeat(2,1fr);}
    .item{grid-template-columns:1fr;}
    .item-actions{flex-direction:row;align-items:center;}
    .row2{grid-template-columns:1fr;}
  }
`;

const BODY_HTML = `
<div class="wrap">
  <header class="top">
    <div>
      <h1>Minuta Ultrasonido</h1>
      <p class="subtitle">Seguimiento de compromisos — Reunión de gerencia (Jefes)</p>
    </div>
    <div class="header-right">
      <div class="meeting-chip" id="meetingChip">cargando…</div>
      <button class="btn-ghost btn-sm" id="btnLogout">Salir</button>
    </div>
  </header>

  <div id="readOnlyBanner" style="display:none;font-size:12.5px;color:var(--ink-soft);margin:-18px 0 20px;">
    👁 Estás viendo esta minuta en modo solo lectura — no puedes agregar ni editar compromisos.
  </div>

  <div class="stats" id="stats"></div>

  <div class="toolbar">
    <select id="fResponsable"><option value="">Responsable: todos</option></select>
    <select id="fArea"><option value="">Área: todas</option></select>
    <select id="fStatus"><option value="">Estado: todos</option></select>
    <div class="search-box">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" id="fBuscar" placeholder="Buscar compromiso, área, responsable o comentario…">
    </div>
    <button class="btn-ghost" id="btnLimpiar">Limpiar filtros</button>
  </div>

  <div class="list" id="list"><div class="empty">Cargando compromisos…</div></div>
</div>

<div class="fab" id="fabAdd" title="Nuevo compromiso">+</div>

<div class="overlay" id="overlayAdd">
  <div class="modal">
    <h2>Nuevo compromiso</h2>
    <div class="field">
      <label>Compromiso / actividad</label>
      <textarea id="nCompromiso" placeholder="Describe el compromiso acordado en la reunión"></textarea>
    </div>
    <div class="row2">
      <div class="field">
        <label>Área</label>
        <select id="nArea"></select>
      </div>
      <div class="field">
        <label>Responsable</label>
        <select id="nResponsable"></select>
      </div>
    </div>
    <div class="row2">
      <div class="field">
        <label>Solicitado por</label>
        <input type="text" id="nSolicitadoPor" placeholder="Ej. Dr.Jhovan">
      </div>
      <div class="field">
        <label>Promesa de cierre</label>
        <input type="date" id="nPromesa">
      </div>
    </div>
    <div class="field">
      <label>Comentarios (opcional)</label>
      <textarea id="nComentarios"></textarea>
    </div>
    <div class="modal-actions">
      <button class="btn-ghost" id="btnCancelAdd">Cancelar</button>
      <button class="btn-primary" id="btnSaveAdd">Guardar compromiso</button>
    </div>
  </div>
</div>

<div class="overlay" id="overlayEdit">
  <div class="modal">
    <h2>Seguimiento del compromiso</h2>
    <p class="subtitle" id="editCompromisoTexto" style="margin-bottom:14px;"></p>

    <div class="row2">
      <div class="field">
        <label>Estado</label>
        <select id="eStatus"></select>
      </div>
      <div class="field">
        <label>Promesa de cierre</label>
        <input type="date" id="ePromesa">
      </div>
    </div>
    <div class="modal-actions" style="margin-top:2px;">
      <button class="btn-primary btn-sm" id="btnSaveEdit">Guardar estado</button>
    </div>

    <div class="section-divider">
      <h3>Historial de avances</h3>
      <div class="timeline" id="timeline"></div>
      <div class="field">
        <label>Agregar avance de esta reunión</label>
        <textarea id="eAvance" placeholder="Ej. 60% completado, falta validar con RH…"></textarea>
      </div>
      <div class="modal-actions" style="margin-top:0;">
        <button class="btn-ghost" id="btnCancelEdit">Cerrar</button>
        <button class="btn-primary" id="btnSaveAvance">Agregar avance</button>
      </div>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>
`;

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    let ALL = [];
    let editingId = null;
    let activeStatFilter = '';
    let IS_EDITOR = false;

    const STATUS_ORDER = ['Nuevo', 'Abierto', 'Acuerdo', 'Vencido', 'Cerrado'];

    function slug(s) {
      return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function toast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2200);
    }

    function isoToday() {
      return new Date().toISOString().slice(0, 10);
    }

    function ddmmyyyyToIso(s) {
      if (!s) return '';
      const p = s.split('/');
      if (p.length !== 3) return '';
      return p[2] + '-' + p[1].padStart(2, '0') + '-' + p[0].padStart(2, '0');
    }
    function isoToDdmmyyyy(s) {
      if (!s) return '';
      const p = s.split('-');
      if (p.length !== 3) return '';
      return p[2] + '/' + p[1] + '/' + p[0];
    }

    function fillSelect(sel, options, withEmpty, emptyLabel) {
      sel.innerHTML = '';
      if (withEmpty) {
        const o = document.createElement('option');
        o.value = '';
        o.textContent = emptyLabel;
        sel.appendChild(o);
      }
      options.forEach((v) => {
        const o = document.createElement('option');
        o.value = v;
        o.textContent = v;
        sel.appendChild(o);
      });
    }

    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    }

    function render() {
      const fr = document.getElementById('fResponsable').value;
      const fa = document.getElementById('fArea').value;
      const fs = document.getElementById('fStatus').value || activeStatFilter;
      const fb = document.getElementById('fBuscar').value.trim().toLowerCase();

      let filtered = ALL.filter((c) => {
        if (fr && c.responsable !== fr) return false;
        if (fa && c.area !== fa) return false;
        if (fs && c.status !== fs) return false;
        if (fb) {
          const haystack = [c.compromiso, c.area, c.responsable, c.solicitadoPor, c.comentarios, ...(c.historial || []).map((h) => h.avance)]
            .join(' ')
            .toLowerCase();
          if (!haystack.includes(fb)) return false;
        }
        return true;
      });

      const list = document.getElementById('list');
      list.innerHTML = '';
      if (filtered.length === 0) {
        list.innerHTML = '<div class="empty">No hay compromisos con estos filtros.</div>';
        return;
      }

      filtered.forEach((c) => {
        const div = document.createElement('div');
        div.className = 'item status-' + slug(c.status);
        const vencidoTag = c.diasVencido ? `<span class="vencido-tag">${c.diasVencido} día(s) vencido</span>` : '';
        const nAvances = (c.historial || []).length;
        const avanceTag = nAvances ? `<span class="avance-count">${nAvances} avance(s) registrados</span>` : '';
        div.innerHTML = `
          <div>
            <p class="compromiso">${escapeHtml(c.compromiso)}</p>
            <div class="meta">
              <span class="badge ${slug(c.status)}">${c.status}</span>
              <span><b>${escapeHtml(c.responsable || '—')}</b> · ${escapeHtml(c.area || 'Sin área')}</span>
              <span>Reunión: ${c.fecha || '—'}</span>
              <span>Cierre prometido: ${c.promesaCierre || 'sin fecha'}</span>
              ${vencidoTag}
              ${avanceTag}
            </div>
          </div>
          <div class="item-actions">
            <button class="btn-ghost btn-sm" data-edit="${c.id}">${IS_EDITOR ? 'Dar seguimiento' : 'Ver seguimiento'}</button>
          </div>
        `;
        list.appendChild(div);
      });

      list.querySelectorAll('[data-edit]').forEach((btn) => {
        btn.addEventListener('click', () => openEdit(btn.getAttribute('data-edit')));
      });
    }

    function renderStats() {
      const counts = { Nuevo: 0, Abierto: 0, Acuerdo: 0, Vencido: 0, Cerrado: 0 };
      ALL.forEach((c) => {
        if (counts[c.status] !== undefined) counts[c.status]++;
      });
      const box = document.getElementById('stats');
      box.innerHTML = '';
      STATUS_ORDER.forEach((st) => {
        const el = document.createElement('div');
        el.className = 'stat ' + slug(st) + (activeStatFilter === st ? ' active' : '');
        el.innerHTML = `<div class="n">${counts[st]}</div><div class="l">${st}</div>`;
        el.addEventListener('click', () => {
          activeStatFilter = activeStatFilter === st ? '' : st;
          document.getElementById('fStatus').value = '';
          renderStats();
          render();
        });
        box.appendChild(el);
      });
    }

    async function apiGet(url) {
      const res = await fetch(url);
      if (res.status === 401) {
        router.push('/login');
        throw new Error('No autenticado');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      return data;
    }

    async function apiSend(url, method, body) {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body || {}),
      });
      if (res.status === 401) {
        router.push('/login');
        throw new Error('No autenticado');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      return data;
    }

    function onData(res) {
      ALL = res.compromisos;
      const catalogo = res.catalogo;

      fillSelect(document.getElementById('fResponsable'), catalogo.responsables, true, 'Responsable: todos');
      fillSelect(document.getElementById('fArea'), catalogo.areas, true, 'Área: todas');
      fillSelect(document.getElementById('fStatus'), STATUS_ORDER, true, 'Estado: todos');
      fillSelect(document.getElementById('nArea'), catalogo.areas, false);
      fillSelect(document.getElementById('nResponsable'), catalogo.responsables, false);
      fillSelect(document.getElementById('eStatus'), STATUS_ORDER, false);

      const abiertos = ALL.filter((c) => c.status !== 'Cerrado').length;
      document.getElementById('meetingChip').textContent = abiertos + ' compromiso(s) abiertos para la próxima reunión';

      renderStats();
      render();

      if (editingId) {
        const c = ALL.find((x) => String(x.id) === String(editingId));
        if (c) renderTimeline(c.historial || []);
      }
    }

    function onErrorMsg(err) {
      document.getElementById('list').innerHTML = '<div class="empty">Error al cargar: ' + (err.message || err) + '</div>';
    }

    async function loadAll() {
      try {
        const me = await apiGet('/api/me');
        IS_EDITOR = !!me.isEditor;
        document.getElementById('fabAdd').style.display = IS_EDITOR ? 'flex' : 'none';
        document.getElementById('readOnlyBanner').style.display = IS_EDITOR ? 'none' : 'block';
      } catch (e) {
        return;
      }
      try {
        const data = await apiGet('/api/data');
        onData(data);
      } catch (e) {
        onErrorMsg(e);
      }
    }

    function openAdd() {
      document.getElementById('nCompromiso').value = '';
      document.getElementById('nSolicitadoPor').value = '';
      document.getElementById('nPromesa').value = '';
      document.getElementById('nComentarios').value = '';
      document.getElementById('overlayAdd').classList.add('show');
    }
    function closeAdd() {
      document.getElementById('overlayAdd').classList.remove('show');
    }

    async function saveAdd() {
      const compromiso = document.getElementById('nCompromiso').value.trim();
      if (!compromiso) {
        toast('Escribe el compromiso');
        return;
      }
      const payload = {
        fecha: isoToDdmmyyyy(isoToday()),
        area: document.getElementById('nArea').value,
        tema: '',
        compromiso,
        responsable: document.getElementById('nResponsable').value,
        solicitadoPor: document.getElementById('nSolicitadoPor').value,
        promesaCierre: isoToDdmmyyyy(document.getElementById('nPromesa').value),
        status: 'Nuevo',
        comentarios: document.getElementById('nComentarios').value,
      };
      try {
        const res = await apiSend('/api/compromiso', 'POST', payload);
        onData(res);
        closeAdd();
        toast('Compromiso agregado');
      } catch (e) {
        toast(e.message || 'No se pudo guardar');
      }
    }

    function renderTimeline(historial) {
      const box = document.getElementById('timeline');
      if (!historial || historial.length === 0) {
        box.innerHTML = '<div class="timeline-empty">Aún no hay avances registrados para este compromiso.</div>';
        return;
      }
      box.innerHTML = historial
        .map(
          (h) => `
        <div class="timeline-item">
          <div class="t-fecha">${h.fecha}</div>
          <div class="t-texto">${escapeHtml(h.avance)}</div>
        </div>
      `
        )
        .join('');
    }

    function openEdit(id) {
      const c = ALL.find((x) => String(x.id) === String(id));
      if (!c) return;
      editingId = id;
      document.getElementById('editCompromisoTexto').textContent = c.compromiso;
      document.getElementById('eStatus').value = c.status;
      document.getElementById('ePromesa').value = ddmmyyyyToIso(c.promesaCierre);
      document.getElementById('eAvance').value = '';
      renderTimeline(c.historial || []);

      document.getElementById('eStatus').disabled = !IS_EDITOR;
      document.getElementById('ePromesa').disabled = !IS_EDITOR;
      document.getElementById('btnSaveEdit').style.display = IS_EDITOR ? 'inline-block' : 'none';
      document.getElementById('eAvance').style.display = IS_EDITOR ? 'block' : 'none';
      document.getElementById('eAvance').previousElementSibling.style.display = IS_EDITOR ? 'block' : 'none';
      document.getElementById('btnSaveAvance').style.display = IS_EDITOR ? 'inline-block' : 'none';

      document.getElementById('overlayEdit').classList.add('show');
    }
    function closeEdit() {
      document.getElementById('overlayEdit').classList.remove('show');
      editingId = null;
    }

    async function saveEdit() {
      if (!editingId) return;
      const updates = {
        status: document.getElementById('eStatus').value,
        promesaCierre: isoToDdmmyyyy(document.getElementById('ePromesa').value),
      };
      try {
        const res = await apiSend(`/api/compromiso/${editingId}`, 'PUT', updates);
        onData(res);
        toast('Estado actualizado');
      } catch (e) {
        toast(e.message || 'No se pudo actualizar');
      }
    }

    async function saveAvance() {
      if (!editingId) return;
      const texto = document.getElementById('eAvance').value.trim();
      if (!texto) {
        toast('Escribe el avance antes de guardar');
        return;
      }
      try {
        const res = await apiSend(`/api/compromiso/${editingId}/avance`, 'POST', { avance: texto });
        onData(res);
        document.getElementById('eAvance').value = '';
        toast('Avance agregado');
      } catch (e) {
        toast(e.message || 'No se pudo agregar el avance');
      }
    }

    async function logout() {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login');
    }

    document.getElementById('fResponsable').addEventListener('change', render);
    document.getElementById('fArea').addEventListener('change', render);
    document.getElementById('fStatus').addEventListener('change', () => {
      activeStatFilter = '';
      renderStats();
      render();
    });
    document.getElementById('fBuscar').addEventListener('input', render);
    document.getElementById('btnLimpiar').addEventListener('click', () => {
      document.getElementById('fResponsable').value = '';
      document.getElementById('fArea').value = '';
      document.getElementById('fStatus').value = '';
      document.getElementById('fBuscar').value = '';
      activeStatFilter = '';
      renderStats();
      render();
    });

    document.getElementById('fabAdd').addEventListener('click', openAdd);
    document.getElementById('btnCancelAdd').addEventListener('click', closeAdd);
    document.getElementById('btnSaveAdd').addEventListener('click', saveAdd);
    document.getElementById('btnCancelEdit').addEventListener('click', closeEdit);
    document.getElementById('btnSaveEdit').addEventListener('click', saveEdit);
    document.getElementById('btnSaveAvance').addEventListener('click', saveAvance);
    document.getElementById('btnLogout').addEventListener('click', logout);

    loadAll();
    // No cleanup needed: this page is not remounted while navigating within itself.
  }, [router]);

  return (
    <>
      <Head>
        <title>Minuta Ultrasonido — Seguimiento de Compromisos</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <style>{PAGE_STYLES}</style>
      </Head>
      <div dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
    </>
  );
}
