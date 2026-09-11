import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No se pudo iniciar sesión');
        setLoading(false);
        return;
      }
      router.push('/dashboard');
    } catch (err) {
      setError('Error de conexión, intenta de nuevo');
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Minuta Ultrasonido — Acceso</title>
      </Head>
      <div style={styles.page}>
        <form style={styles.card} onSubmit={handleSubmit}>
          <h1 style={styles.h1}>Minuta Ultrasonido</h1>
          <p style={styles.subtitle}>Ingresa con tu usuario y contraseña.</p>

          <label style={styles.label}>Usuario</label>
          <input
            style={styles.input}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            autoCapitalize="none"
            required
          />

          <label style={styles.label}>Contraseña</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.submit} disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F7F7F4',
    fontFamily: 'IBM Plex Sans, sans-serif',
    padding: 20,
  },
  card: {
    background: '#fff',
    border: '1px solid #E1DFD9',
    borderRadius: 8,
    padding: 32,
    width: '100%',
    maxWidth: 360,
  },
  h1: { fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 24, margin: '0 0 4px', color: '#1E2A28' },
  subtitle: { color: '#5B655F', fontSize: 13.5, margin: '0 0 20px' },
  label: { display: 'block', fontSize: 12, color: '#5B655F', margin: '10px 0 4px' },
  input: {
    width: '100%',
    padding: '9px 10px',
    fontSize: 14,
    border: '1px solid #E1DFD9',
    borderRadius: 5,
    boxSizing: 'border-box',
  },
  submit: {
    marginTop: 20,
    width: '100%',
    padding: '10px 16px',
    background: '#1E2A28',
    color: '#F7F7F4',
    border: 'none',
    borderRadius: 5,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  error: { color: '#B23A32', fontSize: 13, marginTop: 10 },
};
