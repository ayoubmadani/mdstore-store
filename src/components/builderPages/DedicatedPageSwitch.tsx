'use client'

import { usePathname } from 'next/navigation'

// دومين مخصص لصفحة هبوط: كل المسارات تعرض الصفحة، ما عدا /success (صفحة "شكراً" بعد الطلب)
export default function DedicatedPageSwitch({ page, success }: { page: React.ReactNode; success: React.ReactNode }) {
  const pathname = usePathname() || ''
  return <>{/\/success\/?$/.test(pathname) ? success : page}</>
}
