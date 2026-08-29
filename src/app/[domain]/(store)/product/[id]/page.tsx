import { notFound } from 'next/navigation'
import { cache } from 'react'
import { getStoreByDomain, getProduct } from '@/lib/api'
import ProductClient from './ProductClient'
import type { Metadata } from 'next'

const getStoreCached = cache(async (domain: string) => getStoreByDomain(domain))

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; id: string }>
}): Promise<Metadata> {
  const { domain, id } = await params
  const [product, store] = await Promise.all([
    getProduct(domain, id),
    getStoreCached(domain),
  ])

  if (!product || !store) return {}

  const image = product.productImage || product.imagesProduct?.[0]?.imageUrl || store.design?.logoUrl || ''
  const description = (product.desc || '').replace(/<[^>]+>/g, '').trim().slice(0, 160) || store.name

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
  }
}

function StoreNotFound({ domain }: { domain: string }) {
  return (
    <div className="absolute top-0 left-0 w-full z-[100] h-screen flex items-center justify-center bg-gray-50" >
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-5xl font-black mb-2 text-red-500">404</h1>
        <h2 className="text-xl text-gray-800 font-bold mb-4">المتجر غير موجود</h2>
        <p className="text-gray-400 font-mono text-sm">Domain: {domain}</p>
      </div>
    </div>
  )
}

function StoreInactive({ store }: { store: any }) {
  const isRTL = store.language === 'ar'
  return (
    <div className="absolute top-0 left-0 w-full z-[100] h-screen flex items-center justify-center bg-gray-100" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-center p-10 bg-white rounded-2xl shadow-2xl border-t-4" style={{ borderColor: store.design?.primaryColor , padding:100 }}>
        <h1 className="text-2xl font-bold mb-3">{isRTL ? 'المتجر غير نشط' : 'Store Inactive'}</h1>
        <p className="text-gray-600 italic">{store.name}</p>
      </div>
    </div>
  )
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ domain: string; id: string }>
}) {
  const { domain, id } = await params

  const [product, store] = await Promise.all([
    getProduct(domain, id),
    getStoreCached(domain),
  ])

  if (!product || !product.isActive || !store) notFound()

  if (!store) return <StoreNotFound domain={domain} />
  if (!store.isActive) return <StoreInactive store={store} />

  return <ProductClient product={product} store={store} domain={domain} />
}
