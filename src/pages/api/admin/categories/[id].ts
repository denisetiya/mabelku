import type { APIRoute } from 'astro';
import { db, schema } from '../../../../lib/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { slugify } from '../../../../lib/slug';
import { deleteFile } from '../../../../lib/upload';

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const data = parsed.data;
    const slug = slugify(data.name);

    db.update(schema.categories)
      .set({
        name: data.name,
        slug,
        description: data.description || null,
        image: data.image || null,
        isActive: data.isActive ?? true,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.categories.id, params.id))
      .run();

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Update category error:', error);
    return new Response(
      JSON.stringify({ error: 'Terjadi kesalahan server' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const category = db.select().from(schema.categories).where(eq(schema.categories.id, params.id)).get();

    if (!category) {
      return new Response(JSON.stringify({ error: 'Kategori tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const productCount = db
      .select({ count: sql<number>`count(*)` })
      .from(schema.products)
      .where(eq(schema.products.categoryId, params.id))
      .get()?.count ?? 0;

    if (productCount > 0) {
      return new Response(
        JSON.stringify({ error: `Tidak bisa hapus. Masih ada ${productCount} produk di kategori ini.` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (category.image) {
      deleteFile(category.image);
    }

    db.delete(schema.categories).where(eq(schema.categories.id, params.id)).run();

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Delete category error:', error);
    return new Response(
      JSON.stringify({ error: 'Terjadi kesalahan server' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

import { sql } from 'drizzle-orm';
