import type { APIRoute } from 'astro';
import { db, schema } from '../../../../lib/db';
import { eq, desc, like, and } from 'drizzle-orm';

export const GET: APIRoute = async ({ url }) => {
  const search = url.searchParams.get('search') ?? '';
  const status = url.searchParams.get('status') ?? '';

  const conditions = [];
  if (search) {
    conditions.push(
      like(schema.orders.customerName, `%${search}%`),
    );
  }
  if (status) {
    conditions.push(eq(schema.orders.status, status));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const items = db
    .select()
    .from(schema.orders)
    .where(where)
    .orderBy(desc(schema.orders.createdAt))
    .all();

  return new Response(JSON.stringify({ data: items }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
