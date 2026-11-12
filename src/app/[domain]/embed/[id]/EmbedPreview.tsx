'use client'

import { useEffect } from 'react'
import ThemeProductBlock from '@/components/builderPages/ThemeProductBlock'

// يرسل ارتفاعه للمحرر ليأخذ الإطار ارتفاع الصفحة كاملة (بلا تمرير داخلي)
export default function EmbedPreview({ product, store, maxWidth, backgroundColor }: { product: any; store: any; maxWidth: number; backgroundColor?: string }) {
  useEffect(() => {
    const send = () => window.parent?.postMessage({ type: 'mds-embed-height', productId: product.id, height: document.documentElement.scrollHeight }, '*')
    send()
    const ro = new ResizeObserver(send)
    ro.observe(document.body)
    return () => ro.disconnect()
  }, [product.id])

  return (
    <div style={{ maxWidth, margin: '0 auto', background: backgroundColor }}>
      {/* خلفية الإطار شفافة: تظهر خلفية صفحة المحرر تحته */}
      <style>{'html,body{background:transparent!important;margin:0}'}</style>
      <ThemeProductBlock productId={product.id} builderPageId="" product={product} store={store} maxWidth={maxWidth} backgroundColor={backgroundColor} preview />
    </div>
  )
}
