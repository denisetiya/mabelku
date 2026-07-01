import type { APIRoute } from 'astro';
import { db, schema } from '../../../../lib/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { slugify } from '../../../../lib/slug';
import { serializeImages } from '../../../../lib/product';
import { deleteFile } from '../../../../lib/upload';

export const GET: APIRoute = async ({ params }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID produk wajib diisi' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const product = db
    .select()
    .from(schema.products)
    .where(eq(schema.products.id, id))
    .get();

  if (!product) {
    return new Response(JSON.stringify({ error: 'Produk tidak ditemukan' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(product), {
    headers: { 'Content-Type': 'application/json' },
  });
};

const updateSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  price: z.number().int().min(1),
  discountPrice: z.number().int().optional().nullable(),
  stock: z.number().int().min(0),
  material: z.string().optional(),
  color: z.string().optional(),
  dimension: z.string().optional(),
  weight: z.number().int().optional(),
  categoryId: z.string().min(1),
  mainImage: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID produk wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

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
    const slug = slugify(data.name);

    db.update(schema.products)
      .set({
        name: data.name,
        slug,
        sku: data.sku || null,
        shortDescription: data.shortDescription || null,
        description: data.description || null,
        price: data.price,
        discountPrice: data.discountPrice ?? null,
        stock: data.stock,
        material: data.material || null,
        color: data.color || null,
        dimension: data.dimension || null,
        weight: data.weight ?? null,
        categoryId: data.categoryId,
        mainImage: data.mainImage || null,
        images: data.images ? serializeImages(data.images) : null,
        isFeatured: data.isFeatured ?? false,
        isActive: data.isActive ?? true,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.products.id, id))
      .run();

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Update product error:', error);
    return new Response(
      JSON.stringify({ error: 'Terjadi kesalahan server' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID produk wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const product = db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, id))
      .get();

    if (!product) {
      return new Response(JSON.stringify({ error: 'Produk tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (product.mainImage) {
      deleteFile(product.mainImage);
    }

    db.delete(schema.products).where(eq(schema.products.id, id)).run();

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Delete product error:', error);
    return new Response(
      JSON.stringify({ error: 'Terjadi kesalahan server' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
