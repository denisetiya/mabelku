import type { APIRoute } from 'astro';
import { db, schema } from '../../../lib/db';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { generateId, generateOrderCode } from '../../../lib/slug';
import { getEffectivePrice } from '../../../lib/product';

const orderSchema = z.object({
  customerName: z.string().min(1, 'Nama wajib diisi'),
  customerPhone: z.string().min(1, 'Nomor WhatsApp wajib diisi'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  address: z.string().min(1, 'Alamat wajib diisi'),
  city: z.string().optional(),
  note: z.string().optional(),
  paymentMethod: z.enum(['bank_transfer', 'cod', 'whatsapp_confirmation']),
  shippingMethod: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1, 'Minimal 1 produk'),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const parsed = orderSchema.safeParse(body);

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
    const orderItemsData: Array<{
      productId: string;
      productName: string;
      productPrice: number;
      quantity: number;
      total: number;
    }> = [];

    let subtotal = 0;

    for (const item of data.items) {
      const product = db
        .select()
        .from(schema.products)
        .where(eq(schema.products.id, item.productId))
        .get();

      if (!product) {
        return new Response(
          JSON.stringify({ error: `Produk tidak ditemukan: ${item.productId}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (!product.isActive) {
        return new Response(
          JSON.stringify({ error: `Produk tidak aktif: ${product.name}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (product.stock < item.quantity) {
        return new Response(
          JSON.stringify({
            error: `Stok tidak cukup untuk ${product.name}. Stok tersedia: ${product.stock}`,
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      const price = getEffectivePrice(product.price, product.discountPrice);
      const total = price * item.quantity;
      subtotal += total;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        productPrice: price,
        quantity: item.quantity,
        total,
      });
    }

    const orderId = generateId();
    const orderCode = generateOrderCode();
    const shippingCost = 0;
    const totalAmount = subtotal + shippingCost;

    db.insert(schema.orders)
      .values({
        id: orderId,
        orderCode,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || null,
        address: data.address,
        city: data.city || null,
        note: data.note || null,
        subtotal,
        shippingCost,
        total: totalAmount,
        paymentMethod: data.paymentMethod,
        shippingMethod: data.shippingMethod || null,
        status: 'pending',
      })
      .run();

    for (const item of orderItemsData) {
      db.insert(schema.orderItems)
        .values({
          id: generateId(),
          orderId,
          ...item,
        })
        .run();

      db.update(schema.products)
        .set({ stock: sql`${schema.products.stock} - ${item.quantity}` })
        .where(eq(schema.products.id, item.productId))
        .run();
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderCode,
        orderId,
        total: totalAmount,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Order creation error:', error);
    return new Response(
      JSON.stringify({ error: 'Terjadi kesalahan server' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
