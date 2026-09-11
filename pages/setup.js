import { useState } from 'react';
import Head from 'next/head';

const styles = {
  page: { minHeight: '100vh', background: '#F7F7F4', fontFamily: 'IBM Plex Sans, sans-serif', padding: '32px 16px' },
  wrap: { maxWidth: 720, margin: '0 auto' },
  h1: { fontSize: 24, fontWeight: 700, margin: '0 0 6px', color: '#1E2A28' },
  sub: { fontSize: 13.5, color: '#5B655F', margin: '0 0 24px' },
  card: { background: '#fff', border: '1px solid #E1DFD9', borderRadius: 10, padding: 22, marginBottom: 20 },
  h2: { fontSize: 15, fontWeight: 700, margin: '0 0 14px', color: '#1E2A28' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 },
  label: { fontSize: 11.5, color: '#5B655F', display: 'block', marginBottom: 4, fontWeight: 500 },
  input: { width: '100%', padding: '9px 10px', fontSize: 13.5, border: '1px solid #E1DFD9', borderRadius: 6, boxSizing: 'border-box' },
  select: { width: '100%', padding: '9px 10px', fontSize: 13.5, border: '1px solid #E1DFD9', borderRadius: 6, boxSizing: 'border-box', background: '#fff' },
  btn: { padding: '9px 16px', fontSize: 13.5, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer', background: '#23616B', color: '#fff', marginTop: 6 },
  msg: { fontSize: 12.5, marginTop: 10, padding: '8px 10px', borderRadius: 6 },
  msgOk: { background: '#E9F0E9', color: '#1E7A44' },
  msgErr: { background: '#F7E4E1', color: '#B23A32' },
  teamBlock: { border: '1px solid #E1DFD9', borderRadius: 8, padding: '10px 12px', marginBottom: 8 },
  memberRow: { fontSize: 12.5, color: '#5B655F', padding: '2px 0' },
};

function Field({ label, ...props }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <input style={styles.input} {...props} />
    </div>
  );
}

export default function Setup() {
  const [secret, setSecret] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'ok'|'err', text }
  const [teams, setTeams] = useState([]);

  const [teamForm, setTeamForm] = useState({ teamName: '', adminUsername: '', adminPassword: '', adminName: '' });
  const [memberForm, setMemberForm] = useState({ teamId: '', username: '', password: '', name: '', role: 'member' });
  const [resetForm, setResetForm] = useState({ username: '', newPassword: '' });
  const [migrateTeamId, setMigrateTeamId] = useState('');

  function showMsg(type, text) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 6000);
  }

  async function call(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setupSecret: secret, ...body }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error');
    return data;
  }

  async function loadTeams() {
    try {
      const data = await call('/api/setup/list-teams', {});
      setTeams(data.teams || []);
    } catch (e) {
      showMsg('err', e.message);
    }
  }

  async function unlock(e) {
    e.preventDefault();
    try {
      await call('/api/setup/list-teams', {});
      setUnlocked(true);
      loadTeams();
    } catch (e) {
      showMsg('err', 'Clave incorrecta o no configurada en el servidor.');
    }
  }

  async function submitCreateTeam(e) {
    e.preventDefault();
    try {
      const r = await call('/api/setup/create-team', teamForm);
      showMsg('ok', `Equipo creado: "${teamForm.teamName}" (id: ${r.teamId}). Ya puede iniciar sesión con el usuario "${teamForm.adminUsername}".`);
      setTeamForm({ teamName: '', adminUsername: '', adminPassword: '', adminName: '' });
      loadTeams();
    } catch (e) {
      showMsg('err', e.message);
    }
  }

  async function submitAddMember(e) {
    e.preventDefault();
    try {
      await call('/api/setup/add-member', memberForm);
      showMsg('ok', `Cuenta creada: "${memberForm.username}" en el equipo seleccionado.`);
      setMemberForm({ teamId: memberForm.teamId, username: '', password: '', name: '', role: 'member' });
      loadTeams();
    } catch (e) {
      showMsg('err', e.message);
    }
  }

  async function submitReset(e) {
    e.preventDefault();
    try {
      await call('/api/setup/reset-password', resetForm);
      showMsg('ok', `Contraseña actualizada para "${resetForm.username}".`);
      setResetForm({ username: '', newPassword: '' });
    } catch (e) {
      showMsg('err', e.message);
    }
  }

  async function submitMigrate(e) {
    e.preventDefault();
    try {
      const r = await call('/api/setup/migrate-legacy', { teamId: migrateTeamId });
      showMsg('ok', `Migración completa: ${r.total} compromiso(s) movidos al equipo "${migrateTeamId}".`);
    } catch (e) {
      showMsg('err', e.message);
    }
  }

  if (!unlocked) {
    return (
      <>
        <Head><title>Configuración — Minuta</title></Head>
        <div style={styles.page}>
          <div style={{ ...styles.wrap, maxWidth: 380 }}>
            <div style={styles.card}>
              <h2 style={styles.h2}>Panel de configuración</h2>
              <p style={{ ...styles.sub, marginBottom: 14 }}>Escribe la clave de configuración (SETUP_SECRET) para continuar.</p>
              <form onSubmit={unlock}>
                <Field label="Clave de configuración" type="password" value={secret} onChange={(e) => setSecret(e.target.value)} autoFocus required />
                <button style={styles.btn} type="submit">Entrar</button>
              </form>
              {msg && <div style={{ ...styles.msg, ...(msg.type === 'ok' ? styles.msgOk : styles.msgErr) }}>{msg.text}</div>}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>Configuración — Minuta</title></Head>
      <div style={styles.page}>
        <div style={styles.wrap}>
          <h1 style={styles.h1}>Panel de configuración</h1>
          <p style={styles.sub}>Aquí creas equipos nuevos, agregas personas, restableces contraseñas, y migras datos antiguos. Esta página no aparece en el menú de nadie — solo tú tienes la clave.</p>

          {msg && <div style={{ ...styles.msg, ...(msg.type === 'ok' ? styles.msgOk : styles.msgErr) }}>{msg.text}</div>}

          <div style={styles.card}>
            <h2 style={styles.h2}>1. Crear un equipo nuevo (con su administrador)</h2>
            <form onSubmit={submitCreateTeam}>
              <div style={styles.row}>
                <Field label="Nombre del equipo (ej. Equipo de Laura)" value={teamForm.teamName} onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })} required />
                <Field label="Nombre de la administradora" value={teamForm.adminName} onChange={(e) => setTeamForm({ ...teamForm, adminName: e.target.value })} required />
              </div>
              <div style={styles.row}>
                <Field label="Usuario de acceso" value={teamForm.adminUsername} onChange={(e) => setTeamForm({ ...teamForm, adminUsername: e.target.value })} required />
                <Field label="Contraseña" type="text" value={teamForm.adminPassword} onChange={(e) => setTeamForm({ ...teamForm, adminPassword: e.target.value })} required />
              </div>
              <button style={styles.btn} type="submit">Crear equipo</button>
            </form>
          </div>

          <div style={styles.card}>
            <h2 style={styles.h2}>2. Agregar una persona a un equipo existente</h2>
            <form onSubmit={submitAddMember}>
              <div style={styles.row}>
                <div>
                  <label style={styles.label}>Equipo</label>
                  <select style={styles.select} value={memberForm.teamId} onChange={(e) => setMemberForm({ ...memberForm, teamId: e.target.value })} required>
                    <option value="">Selecciona un equipo…</option>
                    {teams.map((t) => (
                      <option key={t.teamId} value={t.teamId}>{t.name} ({t.teamId})</option>
                    ))}
                  </select>
                </div>
                <Field label="Nombre de la persona" value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} required />
              </div>
              <div style={styles.row}>
                <Field label="Usuario de acceso" value={memberForm.username} onChange={(e) => setMemberForm({ ...memberForm, username: e.target.value })} required />
                <Field label="Contraseña" value={memberForm.password} onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })} required />
              </div>
              <div style={{ maxWidth: 220 }}>
                <label style={styles.label}>Rol</label>
                <select style={styles.select} value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}>
                  <option value="member">Miembro (agrega/edita)</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <button style={styles.btn} type="submit">Agregar persona</button>
            </form>
          </div>

          <div style={styles.card}>
            <h2 style={styles.h2}>3. Restablecer una contraseña</h2>
            <form onSubmit={submitReset}>
              <div style={styles.row}>
                <Field label="Usuario" value={resetForm.username} onChange={(e) => setResetForm({ ...resetForm, username: e.target.value })} required />
                <Field label="Nueva contraseña" value={resetForm.newPassword} onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })} required />
              </div>
              <button style={styles.btn} type="submit">Restablecer</button>
            </form>
          </div>

          <div style={styles.card}>
            <h2 style={styles.h2}>4. Migrar los compromisos antiguos a un equipo (una sola vez)</h2>
            <p style={{ ...styles.sub, marginBottom: 10 }}>
              Usa esto solo una vez, para mover tus 45 compromisos originales al equipo que tú controles.
            </p>
            <form onSubmit={submitMigrate} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Id del equipo destino</label>
                <select style={styles.select} value={migrateTeamId} onChange={(e) => setMigrateTeamId(e.target.value)} required>
                  <option value="">Selecciona un equipo…</option>
                  {teams.map((t) => (
                    <option key={t.teamId} value={t.teamId}>{t.name} ({t.teamId})</option>
                  ))}
                </select>
              </div>
              <button style={styles.btn} type="submit">Migrar</button>
            </form>
          </div>

          <div style={styles.card}>
            <h2 style={styles.h2}>Equipos existentes</h2>
            {teams.length === 0 && <p style={styles.sub}>Aún no hay equipos creados.</p>}
            {teams.map((t) => (
              <div key={t.teamId} style={styles.teamBlock}>
                <strong>{t.name}</strong> <span style={{ color: '#9C9DAD', fontSize: 11.5 }}>({t.teamId})</span>
                {t.members.map((m) => (
                  <div key={m.username} style={styles.memberRow}>
                    · {m.name} — <code>{m.username}</code> — {m.role === 'admin' ? 'Administrador' : 'Miembro'}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
