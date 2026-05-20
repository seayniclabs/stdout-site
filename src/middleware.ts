import { defineMiddleware } from 'astro:middleware';
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;
  if (path.startsWith('/admin') && path !== '/admin/login' && !path.startsWith('/admin/api/login')) {
    const session = context.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!verifyAdminSession(session)) {
      if (path.startsWith('/admin/api/')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return context.redirect('/admin/login');
    }
  }
  return next();
});
