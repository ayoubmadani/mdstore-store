'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { useStore } from '@/Hook/store-provider'
import ThemeRunner from '@/components/ThemeRunner'

export default function CartPage() {
  const params = useParams()
  const { store, theme: slug } = useStore()
  const [hover, setHover] = useState(false)

  const domain   = (params?.domain as string) || ''
  const language = store?.language || 'ar'
  const isRTL    = language === 'ar'
  const bundleUrl = `/api/themes/${language}/${slug}`

  if (store?.cart === false) {
    return (
      <div dir="rtl" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#F8F8F6' }}>
        <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '2px dashed #E8E8E8', borderRadius: 24, maxWidth: 440, width: '100%', background: '#fff' }}>
          <div style={{ width: 80, height: 80, background: '#F9FAFB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <ShoppingBag size={40} style={{ color: '#D1D5DB' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111', marginBottom: '0.5rem' }}>السلة غير مفعلة</h2>
          <p style={{ color: '#6B7280', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            نعتذر، هذا المتجر لا يدعم نظام سلة المشتريات حالياً.
          </p>
          <Link
            href={`/${domain}`}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: hover ? '#111' : '#555', padding: '0.9rem 2.5rem', borderRadius: 12, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}
          >
            <span>العودة إلى الرئيسية</span>
            <ArrowLeft size={16} style={{ transform: hover ? 'translateX(-4px)' : 'none', transition: 'transform 0.3s' }} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'}>
      <ThemeRunner bundleUrl={bundleUrl} exportName="Cart" themeProps={{ domain, store }} />
    </main>
  )
}
