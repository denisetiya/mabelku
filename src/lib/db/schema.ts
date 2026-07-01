import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const adminUsers = sqliteTable('admin_users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('admin'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  image: text('image'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  sku: text('sku'),
  shortDescription: text('short_description'),
  description: text('description'),
  price: integer('price').notNull(),
  discountPrice: integer('discount_price'),
  stock: integer('stock').notNull().default(0),
  material: text('material'),
  color: text('color'),
  dimension: text('dimension'),
  weight: integer('weight'),
  categoryId: text('category_id').notNull().references(() => categories.id),
  mainImage: text('main_image'),
  images: text('images'),
  isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  orderCode: text('order_code').notNull().unique(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerEmail: text('customer_email'),
  address: text('address').notNull(),
  city: text('city'),
  note: text('note'),
  subtotal: integer('subtotal').notNull(),
  shippingCost: integer('shipping_cost').notNull().default(0),
  total: integer('total').notNull(),
  paymentMethod: text('payment_method').notNull(),
  shippingMethod: text('shipping_method'),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id),
  productId: text('product_id').notNull(),
  productName: text('product_name').notNull(),
  productPrice: integer('product_price').notNull(),
  quantity: integer('quantity').notNull(),
  total: integer('total').notNull(),
});

export const storeSettings = sqliteTable('store_settings', {
  id: text('id').primaryKey(),
  storeName: text('store_name').notNull().default('MebelKu'),
  logo: text('logo'),
  whatsappNumber: text('whatsapp_number').notNull().default('628123456789'),
  email: text('email'),
  address: text('address'),
  googleMapsUrl: text('google_maps_url'),
  openingHours: text('opening_hours'),
  bankAccount: text('bank_account'),
  heroTitle: text('hero_title'),
  heroSubtitle: text('hero_subtitle'),
  heroImage: text('hero_image'),
  instagramUrl: text('instagram_url'),
  facebookUrl: text('facebook_url'),
  tiktokUrl: text('tiktok_url'),
  aboutText: text('about_text'),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type StoreSetting = typeof storeSettings.$inferSelect;
