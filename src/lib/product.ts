export function getEffectivePrice(price: number, discountPrice: number | null | undefined): number {
  if (discountPrice && discountPrice > 0 && discountPrice < price) {
    return discountPrice;
  }
  return price;
}

export function getDiscountPercent(price: number, discountPrice: number | null | undefined): number {
  if (!discountPrice || discountPrice <= 0 || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

export function parseImages(images: string | null | undefined): string[] {
  if (!images) return [];
  try {
    return JSON.parse(images) as string[];
  } catch {
    return [];
  }
}

export function serializeImages(images: string[]): string {
  return JSON.stringify(images);
}
