// أدوات تواصل مشتركة لكل الثيمات (تُدمج في bundle كل ثيم):
// «سيتوفر لاحقاً» لجهات التواصل الناقصة في Footer، أيقونة واتساب، وزر «استفسر عبر واتساب» في صفحة المنتج.
import type { CSSProperties, SVGProps } from 'react';
import { whatsappHref } from '@/components/builderPages/buttonLinks';

export { whatsappHref };

type StoreLike = { language?: string | null; contact?: { whatsapp?: string | null } | null } | null | undefined;
type ProductLike = { name?: string; whatsappEnabled?: boolean; whatsappNumber?: string | null };

const lang = (store: StoreLike) => (store?.language === 'fr' ? 'fr' : store?.language === 'en' ? 'en' : 'ar');

const STRINGS = {
  ar: { comingSoon: 'سيتوفر لاحقاً', orderViaWhatsapp: 'استفسر عبر واتساب', waOrderMsg: 'مرحباً، لدي استفسار حول:' },
  fr: { comingSoon: 'Bientôt disponible', orderViaWhatsapp: 'Une question ? WhatsApp', waOrderMsg: "Bonjour, j'ai une question sur :" },
  en: { comingSoon: 'Coming soon', orderViaWhatsapp: 'Ask on WhatsApp', waOrderMsg: 'Hello, I have a question about:' },
};

/** نص «سيتوفر لاحقاً» بلغة المتجر */
export const comingSoon = (store: StoreLike) => STRINGS[lang(store)].comingSoon;

/** رابط واتساب المتجر أو undefined إذا لا يوجد رقم صالح */
export const storeWhatsappHref = (store: StoreLike) => {
  const href = whatsappHref(store?.contact?.whatsapp ?? undefined);
  return href === '#' ? undefined : href;
};

/** شعار واتساب (lucide لا يحتوي عليه) — نفس واجهة أيقونات lucide: size/color/style */
export function WhatsAppGlyph({ size = 16, color = 'currentColor', style, ...rest }: { size?: number | string; color?: string; style?: CSSProperties } & Omit<SVGProps<SVGSVGElement>, 'color' | 'style'>) {
  return (
    <svg aria-hidden="true" {...rest} width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0, ...style }}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm4.52 11.99c-.25-.12-1.47-.72-1.69-.8-.22-.08-.38-.12-.55.13-.17.25-.63.8-.77.97-.14.16-.28.18-.53.06-.25-.12-1.05-.39-2-1.24a7.5 7.5 0 0 1-1.38-1.74c-.14-.25-.02-.38.11-.5.11-.11.25-.28.36-.42.11-.14.15-.24.23-.41.08-.17.04-.31-.02-.44-.06-.12-.55-1.34-.75-1.83-.2-.48-.4-.41-.55-.42h-.46c-.16 0-.42.06-.64.31-.22.25-.84.83-.84 2.02s.86 2.35.98 2.51c.12.16 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.5.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.06.14-1.16-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}

/**
 * زر «استفسر عبر واتساب» (للاستفسار لا للطلب) تحت أزرار الطلب في ProductForm.
 * يظهر فقط إذا فعّله التاجر للمنتج ووُجد رقم صالح (رقم المنتج ثم رقم المتجر).
 */
export function WhatsAppOrderButton({ product, store, style }: { product: ProductLike; store?: StoreLike; style?: CSSProperties }) {
  const number = product?.whatsappNumber || store?.contact?.whatsapp || undefined;
  if (!product?.whatsappEnabled || whatsappHref(number) === '#') return null;
  const t = STRINGS[lang(store)];
  const message = `${t.waOrderMsg} ${product.name ?? ''}${typeof window !== 'undefined' ? `\n${window.location.href}` : ''}`;
  return (
    <a
      href={whatsappHref(number, message)}
      target="_blank"
      rel="noreferrer"
      style={{
        marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', boxSizing: 'border-box', padding: '0.85rem 1rem', borderRadius: 8,
        backgroundColor: '#25D366', color: '#ffffff', fontWeight: 700, textDecoration: 'none',
        ...style,
      }}
    >
      <WhatsAppGlyph size={20} />
      {t.orderViaWhatsapp}
    </a>
  );
}
