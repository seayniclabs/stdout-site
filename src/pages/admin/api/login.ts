import type { APIRoute } from 'astro';
import { verifyAdminCredentials, createAdminSession, ADMIN_SESSION_COOKIE, sessionCookieOptions } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  if (!verifyAdminCredentials(body.email || '', body.password || '')) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
  }

  cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(), sessionCookieOptions());
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
};
