import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'stdout_site_admin';

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function sessionSecret(): string {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'dev-secret-change-me';
}

export function createAdminSession(): string {
  const exp = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `admin:${exp}`;
  const sig = createHmac('sha256', sessionSecret()).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifyAdminSession(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = createHmac('sha256', sessionSecret()).update(payload).digest('hex');
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  } catch {
    return false;
  }
  const exp = parseInt(payload.split(':')[1] || '0', 10);
  return payload.startsWith('admin:') && exp > Date.now();
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL || '';
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  if (!adminEmail || !adminPassword) return false;
  const emailOk = timingSafeEqualStr(email.trim().toLowerCase(), adminEmail.trim().toLowerCase());
  const passOk = timingSafeEqualStr(password, adminPassword);
  return emailOk && passOk;
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function sessionCookieOptions() {
  const secure = (process.env.SITE_URL || '').startsWith('https://');
  return {
    path: '/',
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
    maxAge: SESSION_MAX_AGE,
  };
}
