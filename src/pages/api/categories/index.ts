import type { APIRoute } from 'astro';
import { db, schema } from '../../../lib/db';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async () => {
  const items = db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.isActive, true))
    .all();

  return new Response(JSON.stringify({ data: items }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
