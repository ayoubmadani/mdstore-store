import { redirect } from 'next/navigation'

export default async function SuccessfullyRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string }>
  searchParams: Promise<{ productId?: string }>
}) {
  const sp = await searchParams
  const productId = sp.productId || ''
  redirect(`/success${productId ? `?product=${productId}` : ''}`)
}
