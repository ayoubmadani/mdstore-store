import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import SiteNavbar from '@/components/site/SiteNavbar';
import SiteFooter from '@/components/site/SiteFooter';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mdstore.top';

export const metadata: Metadata = {
  title: {
    default: 'MdStore',
    template: '%s | MdStore',
  },
  description: 'MdStore — the leading e-commerce platform for merchants in North Africa and the Arab world.',
  metadataBase: new URL(APP_URL),
};

const THEME_INIT_SCRIPT = `
(function() {
  try {
    var saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [messages, locale] = await Promise.all([getMessages(), getLocale()]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MdStore',
    url: APP_URL,
    logo: `${APP_URL}/og/mdstore-default.png`,
  };

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen flex flex-col bg-white dark:bg-brand-dark transition-colors duration-500">
        <SiteNavbar />
        <main className="flex-grow w-full">
          <div className="transition-opacity duration-700 ease-in">{children}</div>
        </main>
        <SiteFooter />
      </div>
    </NextIntlClientProvider>
  );
}
