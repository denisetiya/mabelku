import type { APIRoute } from 'astro';
import { saveFile } from '../../../lib/upload';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: 'File tidak ditemukan' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await saveFile(file);

    return new Response(JSON.stringify({ success: true, url: result.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
