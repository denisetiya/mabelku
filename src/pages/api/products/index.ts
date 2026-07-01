import type { APIRoute } from 'astro';
import { db, schema } from '../../../lib/db';
import { eq, desc, asc, like, and, sql } from 'drizzle-orm';
import { getEffectivePrice } from '../../../lib/product';

export const GET: APIRoute = async ({ url }) => {
  const searchParams = url.searchParams;
  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';
  const sort = searchParams.get('sort') ?? 'newest';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(60, Math.max(1, parseInt(searchParams.get('limit') ?? '12', 10)));
  const offset = (page - 1) * limit;

  const conditions = [eq(schema.products.isActive, true)];

  if (search) {
    conditions.push(like(schema.products.name, `%${search}%`));
  }

  if (category) {
    conditions.push(eq(schema.categories.slug, category));
  }

  const where = and(...conditions);

  const orderClause = {
    newest: desc(schema.products.createdAt),
    'price-asc': asc(schema.products.price),
    'price-desc': desc(schema.products.price),
    'name-asc': asc(schema.products.name),
  };

  const orderBy = orderClause[sort as keyof typeof orderClause] ?? desc(schema.products.createdAt);

  const items = db
    .select({
      id: schema.products.id,
      name: schema.products.name,
      slug: schema.products.slug,
      shortDescription: schema.products.shortDescription,
      price: schema.products.price,
      discountPrice: schema.products.discountPrice,
      stock: schema.products.stock,
      mainImage: schema.products.mainImage,
      images: schema.products.images,
      isFeatured: schema.products.isFeatured,
      categoryId: schema.products.categoryId,
      categoryName: schema.categories.name,
      categorySlug: schema.categories.slug,
      createdAt: schema.products.createdAt,
    })
    .from(schema.products)
    .innerJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
    .where(where)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset)
    .all();

  const totalResult = db
    .select({ count: sql<number>`count(*)` })
    .from(schema.products)
    .innerJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
    .where(where)
    .get();

  const total = totalResult?.count ?? 0;

  return new Response(
    JSON.stringify({
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
};
