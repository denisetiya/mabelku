import type { APIRoute } from 'astro';
import { z } from 'zod';
import { updateStoreSettings } from '../../../lib/store';

const settingsSchema = z.object({
  storeName: z.string().min(1),
  logo: z.string().optional().nullable(),
  whatsappNumber: z.string().min(1),
  email: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  googleMapsUrl: z.string().optional().nullable(),
  openingHours: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  heroTitle: z.string().optional().nullable(),
  heroSubtitle: z.string().optional().nullable(),
  heroImage: z.string().optional().nullable(),
  instagramUrl: z.string().optional().nullable(),
  facebookUrl: z.string().optional().nullable(),
  tiktokUrl: z.string().optional().nullable(),
  aboutText: z.string().optional().nullable(),
});

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const updated = updateStoreSettings(parsed.data);

    return new Response(
      JSON.stringify({ success: true, settings: updated }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Update settings error:', error);
    return new Response(
      JSON.stringify({ error: 'Terjadi kesalahan server' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
