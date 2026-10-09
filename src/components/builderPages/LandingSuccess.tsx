'use client'

// صفحة "شكراً" موحدة لكل صفحات الهبوط — ألوانها تأتي من نموذج الطلب الذي أُرسل منه
// الطلب (محفوظة في last_order.landing داخل EditorProductFormBlock قبل الانتقال).
import { useEffect, useRef } from 'react'
import { Check, PhoneCall, Truck, PackageCheck, ArrowRight, ArrowLeft } from 'lucide-react'
import CustomerTracker from '@/components/CustomerTracker'
import type { Pixel } from '@/types/store'

export interface LandingOrderInfo {
  id?: string
  total?: number
  productName?: string
  landing: {
    builderPageId?: string
    backUrl?: string
    language?: 'ar' | 'fr' | 'en'
    productImage?: string
    quantity?: number
    customerName?: string
    customerPhone?: string
    pixels?: Pixel[]
    colors: {
      accent?: string
      accentText?: string
      container?: string
      section?: string
      text?: string
      border?: string
      radius?: number
    }
  }
}

const STRINGS = {
  ar: {
    title: 'تم استلام طلبك بنجاح!',
    subtitle: 'شكراً لثقتك. سنتصل بك قريباً لتأكيد الطلب.',
    order: 'ملخص الطلب',
    quantity: 'الكمية',
    total: 'المجموع',
    name: 'الاسم',
    phone: 'الهاتف',
    nextSteps: 'الخطوات القادمة',
    step1: 'مكالمة لتأكيد الطلب',
    step2: 'تجهيز الطلب وشحنه',
    step3: 'الاستلام والدفع عند الاستلام',
    keepPhone: 'يرجى إبقاء هاتفك مفتوحاً',
    back: 'العودة إلى الصفحة',
    currency: 'د.ج',
  },
  fr: {
    title: 'Commande reçue avec succès !',
    subtitle: 'Merci pour votre confiance. Nous vous appellerons bientôt pour confirmer.',
    order: 'Récapitulatif',
    quantity: 'Quantité',
    total: 'Total',
    name: 'Nom',
    phone: 'Téléphone',
    nextSteps: 'Prochaines étapes',
    step1: 'Appel de confirmation',
    step2: 'Préparation et expédition',
    step3: 'Réception et paiement à la livraison',
    keepPhone: 'Gardez votre téléphone allumé',
    back: 'Retour à la page',
    currency: 'DA',
  },
  en: {
    title: 'Your order has been received!',
    subtitle: 'Thank you for your trust. We will call you soon to confirm.',
    order: 'Order summary',
    quantity: 'Quantity',
    total: 'Total',
    name: 'Name',
    phone: 'Phone',
    nextSteps: 'Next steps',
    step1: 'Confirmation call',
    step2: 'Packing and shipping',
    step3: 'Delivery and cash on delivery',
    keepPhone: 'Please keep your phone on',
    back: 'Back to the page',
    currency: 'DZD',
  },
}

const SAFE_PIXEL_ID = /^[\w-]{1,64}$/

// حدث الشراء لبيكسلات الصفحة — بعد 1.5 ثانية حتى تكون سكربتات البيكسل قد حُمّلت
function firePurchasePixels(pixels: Pixel[] | undefined, order: { id: string; total: number }) {
  if (!pixels?.length) return
  const w = window as unknown as {
    fbq?: (...a: unknown[]) => void
    ttq?: { track: (...a: unknown[]) => void }
    gtag?: (...a: unknown[]) => void
  }
  setTimeout(() => {
    pixels.forEach((px) => {
      if (!px.isActive || !SAFE_PIXEL_ID.test(px.pixelId)) return
      if (px.type === 'facebook' && w.fbq) w.fbq('track', 'Purchase', { value: order.total, currency: 'DZD', order_id: order.id })
      if (px.type === 'tiktok' && w.ttq) w.ttq.track('CompletePayment', { value: order.total, currency: 'DZD', order_id: order.id })
      if (px.type === 'google' && w.gtag) w.gtag('event', 'purchase', { transaction_id: order.id, value: order.total, currency: 'DZD' })
    })
  }, 1500)
}

export default function LandingSuccess({ order }: { order: LandingOrderInfo }) {
  const { landing } = order
  const lang = landing.language && STRINGS[landing.language] ? landing.language : 'ar'
  const t = STRINGS[lang]
  const rtl = lang === 'ar'

  const accent = landing.colors.accent || '#10b981'
  const accentText = landing.colors.accentText || '#ffffff'
  const container = landing.colors.container || '#ffffff'
  const section = landing.colors.section || '#ffffff'
  const text = landing.colors.text || '#27272a'
  const border = landing.colors.border || '#e4e4e7'
  const radius = landing.colors.radius ?? 10

  const tracked = useRef(false)
  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    firePurchasePixels(landing.pixels, { id: order.id || 'NEW_ORDER', total: Number(order.total) || 0 })
  }, [landing.pixels, order.id, order.total])

  const price = (n?: number) => `${Number(n || 0).toLocaleString('ar-DZ')} ${t.currency}`
  const card = { backgroundColor: section, border: `1px solid ${border}`, borderRadius: radius, padding: 16 }
  const BackIcon = rtl ? ArrowRight : ArrowLeft
  const steps = [
    { icon: PhoneCall, label: t.step1 },
    { icon: Truck, label: t.step2 },
    { icon: PackageCheck, label: t.step3 },
  ]

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      style={{
        position: 'fixed', inset: 0, zIndex: 100, overflowY: 'auto',
        backgroundColor: `color-mix(in srgb, ${accent} 7%, ${container})`,
        color: text, fontFamily: 'inherit',
      }}
    >
      <CustomerTracker pixels={landing.pixels ?? []} pageType="landing_page" landingPageId={landing.builderPageId} />
      <style>{`@keyframes md-success-pop { 0% { transform: scale(.4); opacity: 0 } 70% { transform: scale(1.08) } 100% { transform: scale(1); opacity: 1 } }`}</style>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ backgroundColor: container, borderRadius: radius + 6, padding: '28px 20px', textAlign: 'center', boxShadow: '0 10px 30px -12px rgba(0,0,0,.18)' }}>
          <div
            style={{
              width: 76, height: 76, margin: '0 auto 16px', borderRadius: '50%',
              backgroundColor: accent, color: accentText,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 0 10px color-mix(in srgb, ${accent} 18%, transparent)`,
              animation: 'md-success-pop .5s ease-out both',
            }}
          >
            <Check size={40} strokeWidth={3} />
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{t.title}</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, opacity: 0.75, lineHeight: 1.6 }}>{t.subtitle}</p>
        </div>

        <div style={card}>
          <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, opacity: 0.6, textTransform: 'uppercase' }}>{t.order}</p>
          {order.productName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              {landing.productImage && (
                <img src={landing.productImage} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />
              )}
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{order.productName}</p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
            {landing.customerName && <Row label={t.name} value={landing.customerName} />}
            {landing.customerPhone && <Row label={t.phone} value={<span dir="ltr">{landing.customerPhone}</span>} />}
            {landing.quantity ? <Row label={t.quantity} value={landing.quantity} /> : null}
            <div style={{ borderTop: `1px dashed ${border}`, paddingTop: 10, marginTop: 2, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16 }}>
              <span>{t.total}</span>
              <span style={{ color: accent }}>{price(order.total)}</span>
            </div>
          </div>
        </div>

        <div style={card}>
          <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, opacity: 0.6, textTransform: 'uppercase' }}>{t.nextSteps}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {steps.map(({ icon: Icon, label }, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: i === 0 ? accent : `color-mix(in srgb, ${accent} 14%, transparent)`,
                    color: i === 0 ? accentText : accent,
                  }}
                >
                  <Icon size={18} />
                </span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>
          <p style={{ margin: '14px 0 0', fontSize: 13, fontWeight: 700, color: accent, textAlign: 'center' }}>{t.keepPhone}</p>
        </div>

        {landing.backUrl && (
          <a
            href={landing.backUrl}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              height: 48, borderRadius: radius, backgroundColor: accent, color: accentText,
              fontWeight: 700, fontSize: 15, textDecoration: 'none',
            }}
          >
            <BackIcon size={18} />{t.back}
          </a>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ opacity: 0.65 }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  )
}
