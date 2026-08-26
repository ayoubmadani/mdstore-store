import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function SuccessfullyRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string }>
  searchParams: Promise<{ productId?: string }>
}) {
  const { domain } = await params
  const sp = await searchParams
  const productId = sp.productId || ''

  // في الإنتاج، الـ middleware يعيد كتابة المسار تلقائياً بناءً على Host header
  // الحقيقي، فريدايركت نسبي (بدون الدومين) يكفي. لكن محلياً (Host === rootDomain،
  // مثل localhost:3000) يعتبر الـ middleware الطلب "الموقع الرئيسي" ولا يعيد أي
  // كتابة — فيجب إضافة الدومين هنا يدوياً (بنفس منطق middleware.ts بالضبط).
  const h = await headers()
  const hostname = (h.get('host') || '').toLowerCase()
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'mdstore.top').toLowerCase()
  const prefix = hostname === rootDomain ? `/${domain}` : ''

  redirect(`${prefix}/success${productId ? `?product=${productId}` : ''}`)
}
