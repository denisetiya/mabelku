import type { APIRoute } from 'astro';
import { db, schema } from '../../../../lib/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const GET: APIRoute = async ({ params }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID pesanan wajib diisi' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const order = db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.id, id))
    .get();

  if (!order) {
    return new Response(JSON.stringify({ error: 'Pesanan tidak ditemukan' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const items = db
    .select()
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, id))
    .all();

  return new Response(
    JSON.stringify({ ...order, items }),
    { headers: { 'Content-Type': 'application/json' } },
  );
};
