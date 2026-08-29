'use client'

import { useEffect, useState } from 'react'
import { loadThemeModule } from '@/components/ThemeRunner'
import PreviewContent, { type PreviewPage } from './PreviewContent'
import type { PreviewLang } from '@/lib/mock-preview-store'

interface AdditionalPage {
  name_ar: string
  name_fr: string
  name_en: string
  link: string
}

const LANGS: { code: PreviewLang; label: string }[] = [
  { code: 'ar', label: 'AR' },
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
]

type ViewMode = 'desktop' | 'mobile'
const MOBILE_WIDTH = 380
const MOBILE_HEIGHT = 700

// iframe بعرض ثابت حقيقي — الحل الوحيد لتفعيل media queries الفعلية للثيم بدل عرض
// المتصفح الكامل الذي يبقى واسعاً حتى لو صندوق العرض ضيّق بصرياً.
function MobileFrame({ theme, lang, page }: { theme: string; lang: PreviewLang; page: PreviewPage }) {
  return (
    <iframe
      src={`/show/${theme}/embed?lang=${lang}&page=${page}`}
      title="معاينة الموبايل"
      style={{ width: MOBILE_WIDTH - 20, height: MOBILE_HEIGHT, border: 'none', display: 'block' }}
    />
  )
}

const PAGES: Record<PreviewLang, { code: PreviewPage; label: string }[]> = {
  ar: [
    { code: 'home', label: 'الرئيسية' },
    { code: 'product', label: 'صفحة المنتج' },
    { code: 'cart', label: 'السلة' },
    { code: 'success', label: 'نجاح الطلب' },
    { code: 'contact', label: 'اتصل بنا' },
    { code: 'privacy', label: 'الخصوصية' },
    { code: 'terms', label: 'الشروط' },
    { code: 'cookies', label: 'الكوكيز' },
  ],
  fr: [
    { code: 'home', label: 'Accueil' },
    { code: 'product', label: 'Page produit' },
    { code: 'cart', label: 'Panier' },
    { code: 'success', label: 'Commande réussie' },
    { code: 'contact', label: 'Contact' },
    { code: 'privacy', label: 'Confidentialité' },
    { code: 'terms', label: 'Conditions' },
    { code: 'cookies', label: 'Cookies' },
  ],
  en: [
    { code: 'home', label: 'Home' },
    { code: 'product', label: 'Product page' },
    { code: 'cart', label: 'Cart' },
    { code: 'success', label: 'Order success' },
    { code: 'contact', label: 'Contact' },
    { code: 'privacy', label: 'Privacy' },
    { code: 'terms', label: 'Terms' },
    { code: 'cookies', label: 'Cookies' },
  ],
}

const SIDEBAR_WIDTH = 208

function PreviewSidebar({
  lang, onLangChange, page, onPageChange, collapsed, onToggle, viewMode, onViewModeChange, additionalPages,
}: {
  lang: PreviewLang
  onLangChange: (l: PreviewLang) => void
  page: PreviewPage
  onPageChange: (p: PreviewPage) => void
  collapsed: boolean
  onToggle: () => void
  viewMode: ViewMode
  onViewModeChange: (v: ViewMode) => void
  additionalPages: AdditionalPage[]
}) {
  return (
    <>
      <div
        dir="ltr"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 1000000,
          width: SIDEBAR_WIDTH,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(17,17,17,0.95)',
          backdropFilter: 'blur(6px)',
          boxShadow: '2px 0 12px rgba(0,0,0,0.25)',
          transform: collapsed ? `translateX(-${SIDEBAR_WIDTH}px)` : 'translateX(0)',
          transition: 'transform 0.2s ease',
        }}
      >
        <div style={{ padding: '18px 14px 10px', fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          معاينة الثيم
        </div>

        <div style={{ display: 'flex', gap: 6, padding: '0 10px 12px' }}>
          {(['desktop', 'mobile'] as ViewMode[]).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => onViewModeChange(v)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 0',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.12)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                background: viewMode === v ? '#fff' : 'transparent',
                color: viewMode === v ? '#111' : '#fff',
              }}
            >
              {v === 'desktop' ? '🖥️' : '📱'} {v === 'desktop' ? 'Desktop' : 'Mobile'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 10px', overflowY: 'auto', minHeight: 0 }}>
          {PAGES[lang].map(p => (
            <button
              key={p.code}
              type="button"
              onClick={() => onPageChange(p.code)}
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                borderRadius: 8,
                border: 'none',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                background: page === p.code ? '#fff' : 'transparent',
                color: page === p.code ? '#111' : '#fff',
              }}
            >
              {p.label}
            </button>
          ))}

          {additionalPages.length > 0 && (
            <>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '10px 2px 2px' }}>
                صفحات إضافية
              </p>
              {additionalPages.map(ap => {
                const slug = ap.link.replace(/^\//, '')
                const name = lang === 'ar' ? ap.name_ar : lang === 'fr' ? ap.name_fr : ap.name_en
                return (
                  <button
                    key={ap.link}
                    type="button"
                    onClick={() => onPageChange(slug)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: 'none',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: page === slug ? '#fff' : 'transparent',
                      color: page === slug ? '#111' : '#fff',
                    }}
                  >
                    {name}
                  </button>
                )
              })}
            </>
          )}
        </div>

        <div style={{ marginTop: 'auto', padding: 10, display: 'flex', gap: 6, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          {LANGS.map(l => (
            <button
              key={l.code}
              type="button"
              onClick={() => onLangChange(l.code)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 6,
                border: 'none',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                background: lang === l.code ? '#fff' : 'transparent',
                color: lang === l.code ? '#111' : '#fff',
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? 'فتح لوحة المعاينة' : 'طي لوحة المعاينة'}
        style={{
          position: 'fixed',
          top: 200,
          left: collapsed ? 0 : SIDEBAR_WIDTH -0,
          transform: 'translateY(-50%)',
          zIndex: 1000001,
          width: 15,
          height: 80,
          borderRadius: '0 10px 10px 0',
          border: '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer',
          background: 'rgba(17,17,17,0.92)',
          color: '#fff',
          fontSize: 16,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          transition: 'left 0.2s ease',
        }}
      >
        {collapsed ? '›' : '‹'}
      </button>
    </>
  )
}

export default function PreviewClient({ theme }: { theme: string }) {
  const [lang, setLang] = useState<PreviewLang>('fr')
  const [page, setPage] = useState<PreviewPage>('home')
  const [collapsed, setCollapsed] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('desktop')
  const [additionalPages, setAdditionalPages] = useState<AdditionalPage[]>([])

  // يقرأ export اختياري باسم additionalPages من حزمة الثيم نفسها (name/link لكل صفحة
  // إضافية غير الأربع المعروفة) ليضيفها كروابط في الـ sidebar تلقائياً — بدون أي إدخال يدوي.
  useEffect(() => {
    let cancelled = false
    loadThemeModule(`/api/themes/${theme}`)
      .then((exports) => {
        if (cancelled) return
        setAdditionalPages(Array.isArray(exports.additionalPages) ? exports.additionalPages : [])
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [theme])

  return (
    <>
      {viewMode === 'mobile' ? (
        <div
          style={{
            minHeight: '100vh',
            background: '#e5e7eb',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: 32,
            paddingBottom: 32,
          }}
        >
          <div
            style={{
              width: MOBILE_WIDTH,
              maxWidth: '100%',
              background: '#111',
              borderRadius: 32,
              border: '10px solid #111',
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
              flexShrink: 0,
            }}
          >
            <MobileFrame theme={theme} lang={lang} page={page} />
          </div>
        </div>
      ) : (
        <div style={{ paddingLeft: collapsed ? 0 : SIDEBAR_WIDTH, transition: 'padding-left 0.2s ease' }}>
          <PreviewContent theme={theme} lang={lang} page={page} />
        </div>
      )}

      <PreviewSidebar
        lang={lang}
        onLangChange={setLang}
        page={page}
        onPageChange={setPage}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        additionalPages={additionalPages}
      />
    </>
  )
}
