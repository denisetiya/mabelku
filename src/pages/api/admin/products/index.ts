import type { APIRoute } from 'astro';
import { db, schema } from '../../../../lib/db';
import { eq, desc, like, and } from 'drizzle-orm';
import { z } from 'zod';
import { generateId, slugify } from '../../../../lib/slug';
import { serializeImages } from '../../../../lib/product';

export const GET: APIRoute = async ({ url }) => {
  const search = url.searchParams.get('search') ?? '';
  const conditions = [];

  if (search) {
    conditions.push(like(schema.products.name, `%${search}%`));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const items = db
    .select({
      id: schema.products.id,
      name: schema.products.name,
      slug: schema.products.slug,
      sku: schema.products.sku,
      price: schema.products.price,
      discountPrice: schema.products.discountPrice,
      stock: schema.products.stock,
      mainImage: schema.products.mainImage,
      isFeatured: schema.products.isFeatured,
      isActive: schema.products.isActive,
      categoryName: schema.categories.name,
      createdAt: schema.products.createdAt,
    })
    .from(schema.products)
    .innerJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
    .where(where)
    .orderBy(desc(schema.products.createdAt))
    .all();

  return new Response(JSON.stringify({ data: items }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

const productSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  sku: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  price: z.number().int().min(1, 'Harga harus lebih dari 0'),
  discountPrice: z.number().int().optional().nullable(),
  stock: z.number().int().min(0, 'Stok tidak boleh minus'),
  material: z.string().optional(),
  color: z.string().optional(),
  dimension: z.string().optional(),
  weight: z.number().int().optional(),
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  mainImage: z.string().optional(),
  images: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const parsed = productSchema.safeParse(body);

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

    const existing = db.select().from(schema.products).where(eq(schema.products.slug, slug)).get();
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const id = generateId();

    db.insert(schema.products)
      .values({
        id,
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
      })
      .run();

    return new Response(
      JSON.stringify({ success: true, id, slug }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Create product error:', error);
    return new Response(
      JSON.stringify({ error: 'Terjadi kesalahan server' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
