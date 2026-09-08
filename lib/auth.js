import crypto from 'crypto';

const SESSION_COOKIE = 'minuta_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 días

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('Falta la variable de entorno SESSION_SECRET');
  }
  return secret;
}

function sign(payloadB64) {
  return crypto.createHmac('sha256', getSecret()).update(payloadB64).digest('hex');
}

/**
 * Crea el valor de cookie firmado a partir de un rol ('viewer' | 'editor').
 */
export function createSessionToken(role) {
  const payload = JSON.stringify({ role, iat: Date.now() });
  const payloadB64 = Buffer.from(payload, 'utf8').toString('base64url');
  const signature = sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

/**
 * Verifica un token de cookie. Regresa { role } si es válido, o null si no lo es
 * (falsificado, corrupto, o no existe).
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return null;

  let expected;
  try {
    expected = sign(payloadB64);
  } catch (e) {
    return null;
  }

  const sigBuf = Buffer.from(signature, 'hex');
  const expBuf = Buffer.from(expected, 'hex');
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.role !== 'viewer' && payload.role !== 'editor') return null;
    return { role: payload.role };
  } catch (e) {
    return null;
  }
}

export function sessionCookieHeader(token) {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
  ];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  return parts.join('; ');
}

export function clearSessionCookieHeader() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function getSessionFromRequestCookies(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  if (!match) return null;
  const token = match.slice(SESSION_COOKIE.length + 1);
  return verifySessionToken(token);
}

export { SESSION_COOKIE };
