import type { APIRoute } from 'astro';
import { ADMIN_SESSION_COOKIE } from '../../../lib/auth';

export const POST: APIRoute = async ({ cookies }) => {
  cookies.delete(ADMIN_SESSION_COOKIE, { path: '/' });
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
};
