// Converts a Kenyan local number (07XXXXXXXX / 01XXXXXXXX) to international format (254XXXXXXXXX)
export function toKenyanInternational(localNumber) {
  const digits = String(localNumber).replace(/\D/g, '');
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  return digits;
}

const PRIMARY_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || toKenyanInternational('0719215341');

export function buildWhatsAppLink(message, number = PRIMARY_NUMBER) {
  const phone = toKenyanInternational(number);
  const text = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${text}`;
}

// options: { size, sku, imageUrl }
// wa.me links can only pre-fill text, not attach an image file directly - including
// the image URL lets WhatsApp auto-generate a link preview thumbnail once sent.
export function productWhatsAppMessage(productName, options = {}) {
  const { size, sku, imageUrl } = options;

  let message = `Hello Mecca City Boutique, I am interested in ${productName}`;
  if (sku) message += ` (SKU: ${sku})`;
  if (size) message += ` (size ${size})`;
  message += '. Is it available?';
  if (imageUrl) message += `\n\nPhoto: ${imageUrl}`;

  return message;
}

export function generalWhatsAppMessage() {
  return 'Hello Mecca City Boutique, I would like to know more about your products.';
}
