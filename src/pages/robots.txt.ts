import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = (site?.toString() ?? 'http://localhost:4321').replace(/\/$/, '');

  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /keranjang
Disallow: /checkout

Sitemap: ${baseUrl}/sitemap.xml`;

  return new Response(robots, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
