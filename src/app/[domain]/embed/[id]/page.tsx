// معاينة «المنتج بثيم المتجر» داخل محرر الصفحات (إطار): نفس رسم الصفحة المنشورة، بلا إحصائيات
import { notFound } from 'next/navigation'
import { getProduct, getStoreByDomain } from '@/lib/api'
import EmbedPreview from './EmbedPreview'

export const metadata = { robots: { index: false, follow: false } }

export default async function EmbedPage({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string; id: string }>
  searchParams: Promise<{ w?: string; bg?: string }>
}) {
  const { domain, id } = await params
  const { w, bg } = await searchParams
  // من قاعدة البيانات مباشرة: المتجر برقمه المختصر (subdomain) والمنتج برقمه — لا يعتمد على الدومينات المربوطة
  const key = domain.replace(/\.mdstore\.top$/, '')
  const [store, product] = await Promise.all([getStoreByDomain(key), getProduct(key, id)])
  if (!store || !product) notFound()
  const maxWidth = Math.min(1600, Math.max(320, Number(w) || 720))
  const background = /^#[0-9a-f]{3,8}$/i.test(bg ?? '') ? bg : undefined
  return <EmbedPreview product={product} store={store} maxWidth={maxWidth} backgroundColor={background} />
}
