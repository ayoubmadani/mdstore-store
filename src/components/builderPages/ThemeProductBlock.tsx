'use client';

// قسم «المنتج بثيم المتجر» في صفحة المحرر: صفحة المنتج كما يرسمها ثيم المتجر (صور، خيارات، نموذج طلب مباشر)
// والمنتج يبقى متصلاً (أي تعديل عليه يظهر هنا). يُحمَّل من الخادم مع الصفحة إن أمكن، وإلا من المتصفح
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import ThemeRunner from '@/components/ThemeRunner';
import { StoreProvider } from '@/Hook/store-provider';
import { getProduct, getStoreByDomain } from '@/lib/api';
import ProductClient from '@/app/[domain]/(store)/product/[id]/ProductClient';
import { BARE_CSS, capMediaQueries, cartOff, withPageAttribution } from './themeBare';

type Props = {
  productId?: string;
  builderPageId: string;
  splitTestId?: string | null;
  product?: any;
  store?: any;
  maxWidth?: number;
  backgroundColor?: string;
  // معاينة المحرر (إطار): بلا إحصائيات ولا نسب طلبات
  preview?: boolean;
};

export default function ThemeProductBlock({ productId, builderPageId, splitTestId, product: initialProduct, store: initialStore, maxWidth = 720, backgroundColor, preview = false }: Props) {
  const [product, setProduct] = useState<any>(initialProduct ?? null);
  const [store, setStore] = useState<any>(initialStore ?? null);
  const [domain, setDomain] = useState('');
  const root = useRef<HTMLDivElement>(null);

  // الأزرار «الانتقال إلى نموذج الطلب» تبحث عن #md-product-form ← نضعه على نموذج الثيم حين يُرسم
  // (إلا إذا كان في الصفحة قسم «نموذج طلب» يحمله)
  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    const mark = () => {
      if (document.getElementById('md-product-form')) return true;
      const input = el.querySelector('main input');
      if (!input) return false;
      const box = (input.closest('form') ?? input.parentElement?.parentElement ?? input) as HTMLElement;
      box.id = 'md-product-form';
      box.style.scrollMarginTop = '16px';
      return true;
    };
    if (mark()) return undefined;
    const mo = new MutationObserver(() => { if (mark()) mo.disconnect(); });
    mo.observe(el, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [product, store]);

  // الثيم يقرر عدد الأعمدة حسب عرض الشاشة ← داخل الصفحة (maxWidth) تُحسب قواعده كأن الشاشة بعرض الصفحة: عمود واحد
  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    const cap = () => el.querySelectorAll('style').forEach((st) => {
      if (st.dataset.capped === String(maxWidth)) return;
      const next = capMediaQueries(st.textContent ?? '', maxWidth);
      if (next !== st.textContent) st.textContent = next;
      st.dataset.capped = String(maxWidth);
    });
    // خلفية الثيم تتكرر على حاويات داخلية (لا الغلاف فقط) ← كل عنصر بلون خلفية الثيم نفسه يصير شفافاً
    // فيظهر لون القسم أو الصفحة؛ البطاقات والأزرار بألوان أخرى تبقى كما هي
    const clearThemeBg = () => {
      const shell = el.querySelector('main')?.parentElement;
      const themeBg = shell?.style.backgroundColor;
      if (!themeBg || themeBg === 'transparent') return;
      el.querySelectorAll<HTMLElement>('main, main *').forEach((n) => {
        if (n.dataset.bgCleared) return;
        if (getComputedStyle(n).backgroundColor === themeBg) {
          n.style.setProperty('background-color', 'transparent', 'important');
          n.dataset.bgCleared = '1';
        }
      });
    };
    const run = () => { cap(); clearThemeBg(); };
    run();
    const mo = new MutationObserver(run);
    mo.observe(el, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [product, store, maxWidth]);

  useEffect(() => {
    const host = window.location.hostname;
    setDomain(host);
    if (!product && productId) getProduct(host, productId).then(setProduct);
    if (!store) getStoreByDomain(host).then(setStore);
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  // الثيم يرسل الطلب بنفسه (axios المشترك) ← نضيف له معرّف الصفحة ما دام القسم معروضاً
  useEffect(() => {
    const id = axios.interceptors.request.use((cfg) => {
      cfg.data = withPageAttribution(cfg.url, cfg.method, cfg.data, builderPageId, splitTestId);
      return cfg;
    });
    return () => axios.interceptors.request.eject(id);
  }, [builderPageId, splitTestId]);

  if (!product?.isActive || !store) return null;
  const off = cartOff(product, store);
  const slug = store.theme?.slug || 'default';
  const host = domain || store.domains?.[0]?.domain || '';

  return (
    <StoreProvider store={off.store} theme={slug}>
      <style>{BARE_CSS}</style>
      <div ref={root} className="mds-bare mds-embed" style={backgroundColor ? { backgroundColor } : undefined}>
        <ThemeRunner bundleUrl={`/api/themes/${slug}`} exportName="default" themeProps={{ store: off.store, domain: host }}>
          <ProductClient product={off.product} store={off.store} domain={host} noTracker noStats={preview} />
        </ThemeRunner>
      </div>
    </StoreProvider>
  );
}
