import { defineMiddleware } from 'astro:middleware';
import { isAuthenticated } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi =
    (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/login')) ||
    pathname.startsWith('/api/categories') && pathname.includes('admin');

  if (isAdminPage || isAdminApi) {
    const authed = await isAuthenticated(context.cookies);
    if (!authed) {
      if (pathname.startsWith('/api/')) {
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
