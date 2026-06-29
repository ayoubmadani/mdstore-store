import { notFound } from 'next/navigation'
import { cache } from 'react'
import { getStoreByDomain, getProduct } from '@/lib/api'
import ProductClient from './ProductClient'

const getStoreCached = cache(async (domain: string) => getStoreByDomain(domain))

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

  return <ProductClient product={product} store={store} domain={domain} />
}
