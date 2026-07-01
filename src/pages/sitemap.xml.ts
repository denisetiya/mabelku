import type { APIRoute } from 'astro';
import { db, schema } from '../lib/db';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = (site?.toString() ?? 'http://localhost:4321').replace(/\/$/, '');

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/produk', priority: '0.9', changefreq: 'daily' },
    { url: '/tentang', priority: '0.5', changefreq: 'monthly' },
    { url: '/kontak', priority: '0.5', changefreq: 'monthly' },
    { url: '/keranjang', priority: '0.3', changefreq: 'monthly' },
    { url: '/checkout', priority: '0.3', changefreq: 'monthly' },
  ];

  const products = db
    .select({ slug: schema.products.slug, updatedAt: schema.products.updatedAt })
    .from(schema.products)
    .where(eq(schema.products.isActive, true))
    .all();

  const categories = db
    .select({ slug: schema.categories.slug, updatedAt: schema.categories.updatedAt })
    .from(schema.categories)
    .where(eq(schema.categories.isActive, true))
    .all();

  const urls = [
    ...staticPages.map((p) => `  <url>
    <loc>${baseUrl}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),
    ...products.map((p) => `  <url>
    <loc>${baseUrl}/produk/${p.slug}</loc>
    <lastmod>${new Date(p.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`),
    ...categories.map((c) => `  <url>
    <loc>${baseUrl}/kategori/${c.slug}</loc>
    <lastmod>${new Date(c.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
