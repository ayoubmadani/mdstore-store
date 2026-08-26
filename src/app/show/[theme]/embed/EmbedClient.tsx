'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import PreviewContent, { type PreviewPage } from '../PreviewContent'
import type { PreviewLang } from '@/lib/mock-preview-store'

const VALID_LANGS: PreviewLang[] = ['ar', 'fr', 'en']

// نسخة "عارية" من صفحة المعاينة — بدون sidebar أو أي واجهة تحكّم — تُحمَّل داخل iframe
// بعرض ثابت (وضع الموبايل في PreviewClient) حتى تستجيب media queries الحقيقية لعرض
// الـ iframe الضيق نفسه بدل عرض نافذة المتصفح الكامل (الذي يبقى واسعاً دائماً).
export default function EmbedClient({ theme }: { theme: string }) {
  const searchParams = useSearchParams()
  const langParam = searchParams.get('lang') as PreviewLang | null
  const pageParam = searchParams.get('page')

  const lang: PreviewLang = langParam && VALID_LANGS.includes(langParam) ? langParam : 'ar'
  const page: PreviewPage = pageParam || 'home'
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  // <html dir> يأتي من ملف layout.tsx المشترك للموقع كله (locale المتصفح/الكوكي)،
  // وهو غير مرتبط إطلاقاً بلغة الثيم المعروضة هنا — فيحدث تعارض BiDi بين اتجاه
  // المستند الفعلي واتجاه محتوى الثيم يكسر التخطيط (محتوى يزيح لليسار/يمين خطأ).
  // نفرض اتجاه مستند هذا الـ iframe نفسه ليطابق لغة المعاينة، دون المساس بأي صفحة أخرى.
  useEffect(() => {
    document.documentElement.dir = dir
    document.documentElement.lang = lang
  }, [dir, lang])

  return <PreviewContent theme={theme} lang={lang} page={page} />
}
