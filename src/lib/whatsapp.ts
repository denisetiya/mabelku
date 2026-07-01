export function buildWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function buildOrderConfirmationMessage(
  orderCode: string,
  total: number,
  customerName: string,
): string {
  return `Halo, saya ${customerName} ingin konfirmasi pesanan #${orderCode} dengan total Rp${total.toLocaleString('id-ID')}. Mohon konfirmasi ketersediaan dan pengiriman. Terima kasih.`;
}

export function buildProductInquiryMessage(
  productName: string,
  slug: string,
  price: number,
): string {
  return `Halo, saya tertarik dengan produk "${productName}" (harga Rp${price.toLocaleString('id-ID')}). Apakah masih tersedia?`;
}
