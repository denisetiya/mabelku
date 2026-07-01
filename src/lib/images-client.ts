function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h << 5) - h + slug.charCodeAt(i);
  return Math.abs(h);
}

function picsum(seed: string, w: number, h: number): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

const CATEGORY_KEYS = ['kursi', 'meja', 'lemari', 'sofa', 'rak', 'tempat-tidur'];

export function getProductFallback(slug: string): string {
  for (const key of CATEGORY_KEYS) {
    if (slug.includes(key)) return picsum(`${key}-${slug}`, 800, 800);
  }
  return picsum(`product-${slug}`, 800, 800);
}
