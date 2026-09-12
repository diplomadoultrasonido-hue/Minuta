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
  const [users, setUsers] = useState([]);

  const [teamForm, setTeamForm] = useState({ teamName: '', adminUsername: '', adminPassword: '', adminName: '', grantCanCreateGroups: true });
  const [memberForm, setMemberForm] = useState({ teamId: '', username: '', password: '', name: '', role: 'member' });
  const [resetForm, setResetForm] = useState({ username: '', newPassword: '' });
  const [migrateUsername, setMigrateUsername] = useState('');
  const [permForm, setPermForm] = useState({ username: '', value: true });
  const [addToGroupForm, setAddToGroupForm] = useState({ username: '', groupId: '', role: 'member' });
  const [renameForm, setRenameForm] = useState({ username: '', name: '' });

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

  async function loadUsers() {
    try {
      const data = await call('/api/setup/list-users', {});
      setUsers(data.users || []);
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
      loadUsers();
    } catch (e) {
      showMsg('err', 'Clave incorrecta o no configurada en el servidor.');
    }
  }

  async function submitCreateTeam(e) {
    e.preventDefault();
    try {
      const r = await call('/api/setup/create-team', teamForm);
      showMsg('ok', `Equipo creado: "${teamForm.teamName}" (id: ${r.teamId}). Ya puede iniciar sesión con el usuario "${teamForm.adminUsername}".`);
      setTeamForm({ teamName: '', adminUsername: '', adminPassword: '', adminName: '', grantCanCreateGroups: true });
      loadTeams();
      loadUsers();
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
      loadUsers();
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
      const r = await call('/api/setup/migrate-legacy', { username: migrateUsername });
      if (r.total === 0) {
        showMsg('err', `No se encontró NINGÚN compromiso en el sistema (total: 0). No hay nada que migrar todavía.`);
      } else if (r.migrados === 0) {
        showMsg('err', `Hay ${r.total} compromiso(s) en el sistema, pero los ${r.yaAsignados} ya tenían dueño asignado (probablemente ya migraste antes). No se movió nada nuevo.`);
      } else {
        showMsg('ok', `Listo: ${r.migrados} de ${r.total} compromiso(s) quedaron asignados a "${migrateUsername}".`);
      }
    } catch (e) {
      showMsg('err', e.message);
    }
  }

  async function submitPermission(e) {
    e.preventDefault();
    try {
      await call('/api/setup/grant-permission', permForm);
      showMsg('ok', `Permiso ${permForm.value ? 'otorgado' : 'quitado'} a "${permForm.username}".`);
      setPermForm({ username: '', value: true });
      loadUsers();
    } catch (e) {
      showMsg('err', e.message);
    }
  }

  async function submitAddToGroup(e) {
    e.preventDefault();
    try {
      await call('/api/setup/add-member', { teamId: addToGroupForm.groupId, username: addToGroupForm.username, role: addToGroupForm.role });
      showMsg('ok', `"${addToGroupForm.username}" agregado al equipo seleccionado.`);
      setAddToGroupForm({ username: '', groupId: '', role: 'member' });
      loadTeams();
      loadUsers();
    } catch (e) {
      showMsg('err', e.message);
    }
  }

  async function handleRemoveMember(groupId, username) {
    if (!confirm(`¿Quitar a "${username}" de este equipo? No perderá acceso a lo que ya se le asignó, solo no se le podrán asignar cosas nuevas de ahí.`)) return;
    try {
      await call('/api/setup/remove-member', { groupId, username });
      showMsg('ok', `"${username}" fue quitado del equipo.`);
      loadTeams();
      loadUsers();
    } catch (e) {
      showMsg('err', e.message);
    }
  }

  async function submitRename(e) {
    e.preventDefault();
    try {
      await call('/api/setup/rename-user', renameForm);
      showMsg('ok', `Nombre actualizado para "${renameForm.username}".`);
      setRenameForm({ username: '', name: '' });
      loadUsers();
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
              <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <input type="checkbox" checked={teamForm.grantCanCreateGroups} onChange={(e) => setTeamForm({ ...teamForm, grantCanCreateGroups: e.target.checked })} />
                Puede crear y administrar su propio equipo desde la app
              </label>
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
            <h2 style={styles.h2}>4. Migrar los compromisos antiguos a una persona (una sola vez)</h2>
            <p style={{ ...styles.sub, marginBottom: 10 }}>
              Usa esto solo una vez, para que los compromisos que ya existían en el sistema (de antes de este cambio) queden asignados a la cuenta que tú controles.
            </p>
            <form onSubmit={submitMigrate} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Field label="Usuario destino" value={migrateUsername} onChange={(e) => setMigrateUsername(e.target.value)} required />
              </div>
              <button style={styles.btn} type="submit">Migrar</button>
            </form>
          </div>

          <div style={styles.card}>
            <h2 style={styles.h2}>5. Dar o quitar el permiso de crear equipo</h2>
            <p style={{ ...styles.sub, marginBottom: 10 }}>
              Para que alguien que ya tiene cuenta pueda armar y administrar su propio equipo desde la app (sin pasar por aquí).
            </p>
            <form onSubmit={submitPermission}>
              <div style={styles.row}>
                <Field label="Usuario" value={permForm.username} onChange={(e) => setPermForm({ ...permForm, username: e.target.value })} required />
                <div>
                  <label style={styles.label}>Permiso</label>
                  <select style={styles.select} value={permForm.value ? '1' : '0'} onChange={(e) => setPermForm({ ...permForm, value: e.target.value === '1' })}>
                    <option value="1">Otorgar</option>
                    <option value="0">Quitar</option>
                  </select>
                </div>
              </div>
              <button style={styles.btn} type="submit">Guardar</button>
            </form>
          </div>

          <div style={styles.card}>
            <h2 style={styles.h2}>6. Agregar una persona existente a otro equipo</h2>
            <form onSubmit={submitAddToGroup}>
              <div style={styles.row}>
                <Field label="Usuario existente" value={addToGroupForm.username} onChange={(e) => setAddToGroupForm({ ...addToGroupForm, username: e.target.value })} required />
                <div>
                  <label style={styles.label}>Equipo destino</label>
                  <select style={styles.select} value={addToGroupForm.groupId} onChange={(e) => setAddToGroupForm({ ...addToGroupForm, groupId: e.target.value })} required>
                    <option value="">Selecciona un equipo…</option>
                    {teams.map((t) => (
                      <option key={t.teamId} value={t.teamId}>{t.name} ({t.teamId})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ maxWidth: 220 }}>
                <label style={styles.label}>Rol en ese equipo</label>
                <select style={styles.select} value={addToGroupForm.role} onChange={(e) => setAddToGroupForm({ ...addToGroupForm, role: e.target.value })}>
                  <option value="member">Miembro</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <button style={styles.btn} type="submit">Agregar</button>
            </form>
          </div>

          <div style={styles.card}>
            <h2 style={styles.h2}>7. Cambiar el nombre de una persona</h2>
            <form onSubmit={submitRename}>
              <div style={styles.row}>
                <Field label="Usuario" value={renameForm.username} onChange={(e) => setRenameForm({ ...renameForm, username: e.target.value })} required />
                <Field label="Nuevo nombre" value={renameForm.name} onChange={(e) => setRenameForm({ ...renameForm, name: e.target.value })} required />
              </div>
              <button style={styles.btn} type="submit">Guardar</button>
            </form>
          </div>

          <div style={styles.card}>
            <h2 style={styles.h2}>Todos los usuarios y sus equipos</h2>
            {users.length === 0 && <p style={styles.sub}>Aún no hay usuarios.</p>}
            {users.map((u) => (
              <div key={u.username} style={styles.teamBlock}>
                <strong>{u.name}</strong> <span style={{ color: '#9C9DAD', fontSize: 11.5 }}>({u.username})</span>
                {u.canCreateGroups && <span style={{ marginLeft: 8, fontSize: 11, color: '#23616B' }}>· puede crear equipo</span>}
                {u.groups.length === 0 && <div style={styles.memberRow}>Sin equipos.</div>}
                {u.groups.map((g) => (
                  <div key={g.groupId} style={{ ...styles.memberRow, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>· {g.groupName} — {g.role === 'admin' ? 'Administrador' : 'Miembro'}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(g.groupId, u.username)}
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#B23A32', fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Quitar de este equipo
                    </button>
                  </div>
                ))}
              </div>
            ))}
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
