import type { APIRoute } from 'astro';
import { db, schema } from '../../../lib/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { generateId, slugify } from '../../../lib/slug';

export const GET: APIRoute = async () => {
  const items = db.select().from(schema.categories).all();
  return new Response(JSON.stringify({ data: items }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi'),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: 'Validasi gagal',
          details: parsed.error.flatten().fieldErrors,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const data = parsed.data;
    let slug = slugify(data.name);

    const existing = db.select().from(schema.categories).where(eq(schema.categories.slug, slug)).get();
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const id = generateId();

    db.insert(schema.categories)
      .values({
        id,
        name: data.name,
        slug,
        description: data.description || null,
        image: data.image || null,
        isActive: data.isActive ?? true,
      })
      .run();

    return new Response(
      JSON.stringify({ success: true, id, slug }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Create category error:', error);
    return new Response(
      JSON.stringify({ error: 'Terjadi kesalahan server' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
