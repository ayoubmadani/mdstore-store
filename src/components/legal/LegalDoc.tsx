// عرض نص قانوني (عناوين، فقرات، قوائم، **غامق**، روابط) — نفس الشكل للصفحات الثلاث
import { getLocale } from 'next-intl/server';
import { LEGAL, type LegalDocKey, type LegalLocale } from './content';

export async function legalText(doc: LegalDocKey) {
  const raw = await getLocale().catch(() => 'ar');
  const locale: LegalLocale = raw === 'fr' || raw === 'en' ? raw : 'ar';
  return { locale, text: LEGAL[doc][locale] };
}

export const legalTitle = (text: string) => (text.match(/^# (.+)$/m)?.[1] ?? 'MdStore').trim();

// **غامق** وروابط https://
function inline(s: string) {
  return s.split(/(\*\*[^*]+\*\*|https?:\/\/\S+)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
    if (/^https?:\/\//.test(part)) return <a key={i} href={part} className="text-blue-600 dark:text-blue-400 underline break-all" dir="ltr">{part}</a>;
    return part;
  });
}

const NUMBERED = /^([0-9٠-٩]+)[.)]\s+(.*)$/;

export default async function LegalDoc({ doc }: { doc: LegalDocKey }) {
  const { locale, text } = await legalText(doc);
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flush = () => {
    if (!list) return;
    const Tag = list.ordered ? 'ol' : 'ul';
    blocks.push(
      <Tag key={blocks.length} className={`${list.ordered ? 'list-decimal' : 'list-disc'} ps-6 space-y-1.5 text-gray-700 dark:text-gray-300`}>
        {list.items.map((it, i) => <li key={i}>{inline(it)}</li>)}
      </Tag>,
    );
    list = null;
  };

  for (const line of text.split('\n')) {
    const l = line.trim();
    const num = l.match(NUMBERED);
    if (l.startsWith('- ') || num) {
      const ordered = !!num;
      if (list && list.ordered !== ordered) flush();
      list = list ?? { ordered, items: [] };
      list.items.push(num ? num[2] : l.slice(2));
      continue;
    }
    flush();
    if (!l || l === '---') continue;
    if (l.startsWith('# ')) blocks.push(<h1 key={blocks.length} className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">{l.slice(2)}</h1>);
    else if (l.startsWith('## ')) blocks.push(<h2 key={blocks.length} className="text-xl font-bold text-gray-900 dark:text-white pt-6">{l.slice(3)}</h2>);
    else blocks.push(<p key={blocks.length} className="text-gray-700 dark:text-gray-300 leading-relaxed">{inline(l)}</p>);
  }
  flush();

  return (
    <div className="py-14 bg-white dark:bg-brand-dark min-h-screen">
      <article dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale} className="container mx-auto px-6 max-w-3xl space-y-4 text-[15px]">
        {blocks}
      </article>
    </div>
  );
}
