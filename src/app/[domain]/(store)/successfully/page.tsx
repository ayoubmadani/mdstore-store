import { redirect } from 'next/navigation'

export default async function SuccessfullyRedirect({
  params,
}: {
  params: Promise<{ domain: string }>
}) {
  const { domain } = await params
  redirect(`/success`)
}
