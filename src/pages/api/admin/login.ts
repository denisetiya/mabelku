import type { APIRoute } from 'astro';
import { z } from 'zod';
import { loginAdmin } from '../../../lib/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Email dan password wajib diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const success = await loginAdmin(parsed.data.email, parsed.data.password, cookies);

    if (!success) {
      return new Response(
        JSON.stringify({ error: 'Email atau password salah' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, redirect: '/admin' }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Terjadi kesalahan server' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
