'use client';

// سلايدر الأطقم المشترك للثيمات التي لا ترسم الأطقم بنفسها.
// لا يظهر قبل تحميل الثيم: ينتظر وحدة الثيم (نفس التحميل الذي يستعمله ThemeRunner)، ثم يظهر فقط
// إن لم يصدّر الثيم صفحة Bundle — الثيم الذي يصدّرها يرسم سلايدره تحت غلافه.

import { useEffect, useState } from 'react';
import { loadThemeModule } from '@/components/ThemeRunner';
import BundleSlider from './BundleSlider';
import type { BundleCard } from '@/lib/bundles';

interface Props {
  themeUrl: string;
  bundles: BundleCard[];
  accent: string;
  language?: string;
  title?: string | null;
  base: string;
}

export default function BundleSliderFallback({ themeUrl, ...slider }: Props) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let alive = true;
    loadThemeModule(themeUrl)
      .then((exports) => { if (alive) setShow(typeof exports?.Bundle !== 'function'); })
      .catch(() => { if (alive) setShow(true); });
    return () => { alive = false; };
  }, [themeUrl]);
  return show ? <BundleSlider {...slider} /> : null;
}
