import type { APIRoute } from 'astro';
import { db, schema } from '../../../lib/db';
import { eq, and } from 'drizzle-orm';
import { getEffectivePrice, parseImages } from '../../../lib/product';

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Slug produk wajib diisi' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const product = db
    .select()
    .from(schema.products)
    .where(and(eq(schema.products.slug, slug), eq(schema.products.isActive, true)))
    .get();

  if (!product) {
    return new Response(JSON.stringify({ error: 'Produk tidak ditemukan' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const category = db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.id, product.categoryId))
    .get();

  const effectivePrice = getEffectivePrice(product.price, product.discountPrice);
  const images = parseImages(product.images);

  return new Response(
    JSON.stringify({
      ...product,
      category,
      effectivePrice,
      images,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
};
