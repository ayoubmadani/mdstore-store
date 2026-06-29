'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/Hook/store-provider'
import ThemeRunner from '@/components/ThemeRunner'

export default function DynamicPage() {
  const params = useParams()
  const { store, theme: slug } = useStore()

  const pageSlug  = (params?.page as string) || ''
  const language  = store?.language || 'ar'
  const bundleUrl = `/api/themes/${language}/${slug}`

  return (
    <ThemeRunner
      bundleUrl={bundleUrl}
      exportName="StaticPage"
      themeProps={{ store, page: pageSlug, staticPage: pageSlug }}
    />
  )
}
