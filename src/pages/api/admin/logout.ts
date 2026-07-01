import type { APIRoute } from 'astro';
import { destroySession } from '../../../lib/auth';

export const POST: APIRoute = async ({ cookies }) => {
  destroySession(cookies);
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { 'Content-Type': 'application/json' } },
  );
};

export const GET: APIRoute = async ({ cookies }) => {
  destroySession(cookies);
  return Response.redirect(new URL('/admin/login', import.meta.env.SITE ?? 'http://localhost:4321').toString(), 302);
};
