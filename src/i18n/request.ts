import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const SUPPORTED_LOCALES = ['ar', 'en', 'fr'] as const;
export type SiteLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SiteLocale = 'ar';

const NAMESPACES = [
  'about',
  'contact',
  'cookies',
  'home',
  'plans',
  'privacy',
  'terms',
  'nav',
  'footer',
] as const;

function isSupportedLocale(value: string | undefined): value is SiteLocale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get('NEXT_LOCALE')?.value;
  const locale: SiteLocale = isSupportedLocale(raw) ? raw : DEFAULT_LOCALE;

  const entries = await Promise.all(
    NAMESPACES.map(
      async (ns) => [ns, (await import(`../messages/${locale}/${ns}.json`)).default] as const,
    ),
  );

  return {
    locale,
    messages: Object.fromEntries(entries),
  };
});
