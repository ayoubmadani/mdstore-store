'use client'

import { useEffect, useMemo, useState, type SyntheticEvent } from 'react'
import ThemeRunner from '@/components/ThemeRunner'
import { buildPreviewStore, PREVIEW_DOMAIN } from '@/lib/mock-preview-store'
import { installPreviewMockApi } from '@/lib/preview-mock-api'
import type { Store } from '@/types/store'

type PreviewLang = 'ar' | 'fr' | 'en'
const LANGS: { code: PreviewLang; label: string }[] = [
  { code: 'ar', label: 'AR' },
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
]

// يمنع أي تفاعل (نقر/سحب) عبر كامل الموقع — هذه صفحة عرض بصري فقط، لا تنقّل حقيقي متاح
function blockInteraction(e: SyntheticEvent) {
  e.preventDefault()
  e.stopPropagation()
}

function LangSwitcher({ lang, onChange }: { lang: PreviewLang; onChange: (l: PreviewLang) => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000000,
        display: 'flex',
        gap: 4,
        padding: 4,
        borderRadius: 999,
        background: 'rgba(17,17,17,0.85)',
        backdropFilter: 'blur(6px)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
      }}
    >
      {LANGS.map(l => (
        <button
          key={l.code}
          type="button"
          onClick={() => onChange(l.code)}
          style={{
            padding: '6px 14px',
            borderRadius: 999,
            border: 'none',
            fontSize: 12,
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
  )
}

export default function PreviewClient({ theme }: { theme: string }) {
  const [lang, setLang] = useState<PreviewLang>('fr')
  useEffect(() => installPreviewMockApi(), [])

  const store: Store = useMemo(() => buildPreviewStore(theme, lang), [theme, lang])
  const bundleUrl = `/api/themes/${theme}`
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  return (
    <>
      <div dir={dir}>
        <ThemeRunner
          bundleUrl={bundleUrl}
          exportName="default"
          themeProps={{ store, domain: PREVIEW_DOMAIN }}
          fallback={<p style={{ padding: 40, textAlign: 'center' }}>...جاري تحميل الثيم</p>}
        >
          <ThemeRunner
            bundleUrl={bundleUrl}
            exportName="Home"
            themeProps={{ store, domain: PREVIEW_DOMAIN, page: 1 }}
          />
        </ThemeRunner>
      </div>

      <div
        aria-hidden
        onClick={blockInteraction}
        onMouseDown={blockInteraction}
        onContextMenu={blockInteraction}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999999,
          background: 'transparent',
          cursor: 'default',
        }}
      />

      <LangSwitcher lang={lang} onChange={setLang} />
    </>
  )
}
