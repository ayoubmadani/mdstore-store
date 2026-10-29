// غلاف الهاتف: زائر الهاتف يرى hero.mobileImageUrl مكان imageUrl — يعمل مع كل الثيمات بلا تعديلها

const PHONE = /Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i;

export const isPhoneUA = (ua?: string | null) => !!ua && PHONE.test(ua);

type HeroStore = { hero?: { imageUrl?: string | null; mobileImageUrl?: string | null } | null };

/** نسخة من المتجر بغلاف الهاتف إن كان الزائر على هاتف وللمتجر غلاف هاتف */
export function heroForDevice<T extends HeroStore>(store: T, ua?: string | null): T {
  const mobile = store?.hero?.mobileImageUrl;
  if (!mobile || !isPhoneUA(ua)) return store;
  return { ...store, hero: { ...store.hero, imageUrl: mobile } };
}
