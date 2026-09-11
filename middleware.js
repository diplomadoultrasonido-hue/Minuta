import { NextResponse } from 'next/server';

// El middleware corre en el Edge Runtime, donde el módulo `crypto` de Node no
// está disponible igual que en lib/auth.js, así que aquí verificamos la firma
// con la Web Crypto API (subtle) en vez de importar lib/auth.js directamente.

const SESSION_COOKIE = 'minuta_session';

async function hmacHex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verify(token, secret) {
  if (!token || !token.includes('.')) return null;
  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return null;
  const expected = await hmacHex(secret, payloadB64);
  if (expected !== signature) return null;
  try {
    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json);
    if (!payload.username || !payload.teamId || (payload.role !== 'admin' && payload.role !== 'member')) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verify(token, process.env.SESSION_SECRET || '');

  if (session) {
    return NextResponse.next();
  }

  // No autenticado: a las páginas normales las mandamos a /login,
  // a las llamadas de API les respondemos 401 en JSON.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const loginUrl = new URL('/login', req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/',
    '/dashboard',
    '/api/data',
    '/api/compromiso',
    '/api/compromiso-update',
    '/api/compromiso-avance',
    '/api/import-once',
    '/api/export',
    '/api/profile',
  ],
};
