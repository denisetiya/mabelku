import type { APIRoute } from 'astro';
import { db, schema } from '../../../lib/db';
import { sql, eq, desc, asc } from 'drizzle-orm';

export const GET: APIRoute = async () => {
  const totalProducts = db
    .select({ count: sql<number>`count(*)` })
    .from(schema.products)
    .get()?.count ?? 0;

  const totalOrders = db
    .select({ count: sql<number>`count(*)` })
    .from(schema.orders)
    .get()?.count ?? 0;

  const newOrders = db
    .select({ count: sql<number>`count(*)` })
    .from(schema.orders)
    .where(eq(schema.orders.status, 'pending'))
    .get()?.count ?? 0;

  const totalRevenue = db
    .select({ total: sql<number>`COALESCE(SUM(total), 0)` })
    .from(schema.orders)
    .where(eq(schema.orders.status, 'completed'))
    .get()?.total ?? 0;

  const lowStockProducts = db
    .select()
    .from(schema.products)
    .where(sql`${schema.products.stock} <= 5`)
    .orderBy(asc(schema.products.stock))
    .limit(5)
    .all();

  const bestSellers = db
    .select({
      id: schema.products.id,
      name: schema.products.name,
      mainImage: schema.products.mainImage,
      totalSold: sql<number>`COALESCE(SUM(${schema.orderItems.quantity}), 0)`,
    })
    .from(schema.products)
    .innerJoin(schema.orderItems, eq(schema.products.id, schema.orderItems.productId))
    .groupBy(schema.products.id, schema.products.name, schema.products.mainImage)
    .orderBy(desc(sql`COALESCE(SUM(${schema.orderItems.quantity}), 0)`))
    .limit(5)
    .all();

  const recentOrders = db
    .select({
      id: schema.orders.id,
      orderCode: schema.orders.orderCode,
      customerName: schema.orders.customerName,
      total: schema.orders.total,
      status: schema.orders.status,
      createdAt: schema.orders.createdAt,
    })
    .from(schema.orders)
    .orderBy(desc(schema.orders.createdAt))
    .limit(5)
    .all();

  return new Response(
    JSON.stringify({
      totalProducts,
      totalOrders,
      newOrders,
      totalRevenue,
      lowStockProducts,
      bestSellers,
      recentOrders,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
};
