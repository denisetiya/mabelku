import type { APIRoute } from 'astro';
import { db, schema } from '../../../../../lib/db';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'completed', 'cancelled']),
});

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID pesanan wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const parsed = statusSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Status tidak valid' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
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

    if (parsed.data.status === 'cancelled' && order.status !== 'cancelled') {
      const items = db
        .select()
        .from(schema.orderItems)
        .where(eq(schema.orderItems.orderId, id))
        .all();

      for (const item of items) {
        db.update(schema.products)
          .set({
            stock: sql`${schema.products.stock} + ${item.quantity}`,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(schema.products.id, item.productId))
          .run();
      }
    }

    db.update(schema.orders)
      .set({
        status: parsed.data.status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.orders.id, id))
      .run();

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Update order status error:', error);
    return new Response(
      JSON.stringify({ error: 'Terjadi kesalahan server' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
