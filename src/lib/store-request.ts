import { cache } from 'react'
import { getStoreByDomain } from './api'
import { storeArgs } from './store-args'

const load = cache(async (domain: string, category: string, search: string, page: string) =>
  getStoreByDomain(domain, category || undefined, search || undefined, page || undefined),
)

/**
 * متجر هذا الطلب. الـ layout والصفحة (وصفحة المنتج) يستعملون هذه الدالة نفسها،
 * فيُستدعى الـ API مرة واحدة لكل فتح صفحة بدل مرتين.
 */
export function getStoreForRequest(domain: string, category?: string, search?: string, page?: string) {
  return load(domain, ...storeArgs(category, search, page))
}
