// رابط زر صفحة الهبوط حسب نوعه: نموذج الطلب / رابط خارجي / واتساب
export type ButtonLinkType = 'external' | 'form' | 'whatsapp';

// رقم محلي جزائري (0XXXXXXXXX) → صيغة دولية لرابط wa.me (213XXXXXXXXX)
export function toWaNumber(raw: string) {
  const digits = raw.replace(/[^\d+]/g, '').replace(/^\+/, '').replace(/^00/, '');
  return /^0\d{9}$/.test(digits) ? `213${digits.slice(1)}` : digits;
}

export function whatsappHref(number?: string, message?: string) {
  const wa = number ? toWaNumber(number) : '';
  if (!/^\d{9,15}$/.test(wa)) return '#';
  return `https://wa.me/${wa}${message?.trim() ? `?text=${encodeURIComponent(message.trim())}` : ''}`;
}

export function buttonHref(b: { linkType?: ButtonLinkType; link?: string; whatsappNumber?: string; whatsappMessage?: string }) {
  if (b.linkType === 'form') return '#md-product-form';
  if (b.linkType === 'whatsapp') return whatsappHref(b.whatsappNumber, b.whatsappMessage);
  return b.link || '#';
}
