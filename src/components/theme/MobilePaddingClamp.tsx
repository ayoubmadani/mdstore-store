'use client'

import { useEffect, useRef } from 'react'

const MAX_WIDTH = 640 // الهاتف فقط
const MAX_PAD = 14    // أي حافة جانبية أكبر من هذا تُصغَّر
const PAD = 12
const TAGS = new Set(['DIV', 'SECTION', 'FORM', 'MAIN', 'ARTICLE', 'ASIDE'])

// الثيمات تكتب الحواف inline بقيم مختلفة ومتداخلة (صفحة → بطاقة → صندوق الطلب)، فتتراكم
// على الهاتف وتضيّق المحتوى. هذا المكوّن المشترك يصغّر الحواف الجانبية للحاويات العريضة فقط
// (≥ 60% من عرض الشاشة) داخل صفحة المنتج، على الشاشات الصغيرة — يعمل مع كل الثيمات.
export default function MobilePaddingClamp({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    let frame = 0
    const touched = new Set<HTMLElement>()

    const apply = () => {
      frame = 0
      const vw = window.innerWidth
      if (vw > MAX_WIDTH) {
        touched.forEach((el) => { el.style.removeProperty('padding-left'); el.style.removeProperty('padding-right') })
        touched.clear()
        return
      }
      root.querySelectorAll<HTMLElement>('*').forEach((el) => {
        if (!TAGS.has(el.tagName) || touched.has(el)) return
        const w = el.getBoundingClientRect().width
        if (w < vw * 0.6) return
        const cs = getComputedStyle(el)
        if (parseFloat(cs.paddingLeft) > MAX_PAD || parseFloat(cs.paddingRight) > MAX_PAD) {
          el.style.setProperty('padding-left', `${PAD}px`, 'important')
          el.style.setProperty('padding-right', `${PAD}px`, 'important')
          touched.add(el)
        }
      })
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(apply) }

    schedule()
    const mo = new MutationObserver(schedule)
    mo.observe(root, { childList: true, subtree: true })
    window.addEventListener('resize', schedule)
    return () => {
      mo.disconnect()
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return <div ref={ref}>{children}</div>
}
