const CATEGORY_IMAGES: Record<string, string[]> = {
  kursi: [
    'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80',
    'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80',
  ],
  meja: [
    'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&q=80',
    'https://images.unsplash.com/photo-1615875605825-5eb9bb5d52ac?w=800&q=80',
  ],
  lemari: [
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80',
    'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800&q=80',
  ],
  sofa: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80',
  ],
  rak: [
    'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
  ],
  'tempat-tidur': [
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
    'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=80',
  ],
  'kitchen-set': [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
  ],
  dekorasi: [
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
  ],
  interior: [
    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80',
  ],
};

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h << 5) - h + slug.charCodeAt(i);
  return Math.abs(h);
}

function picsum(seed: string, w: number, h: number): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

export function getCategoryFallbackImage(slug: string): string {
  const images = CATEGORY_IMAGES[slug];
  if (images && images.length > 0) return images[0];
  return picsum(`category-${slug}`, 800, 1000);
}

export function getProductFallbackImage(slug: string, categorySlug?: string | null): string {
  if (categorySlug && CATEGORY_IMAGES[categorySlug]) {
    const arr = CATEGORY_IMAGES[categorySlug];
    return arr[hashSlug(slug) % arr.length];
  }
  return picsum(`product-${slug}`, 800, 1000);
}

export function getCategoryCover(slug: string): string {
  const images = CATEGORY_IMAGES[slug];
  if (images && images.length > 0) return images[0];
  return picsum(`cover-${slug}`, 1600, 900);
}
