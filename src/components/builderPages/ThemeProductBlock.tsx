'use client';

// قسم «المنتج بثيم المتجر» في صفحة المحرر: صفحة المنتج كما يرسمها ثيم المتجر (صور، خيارات، نموذج طلب مباشر)
// والمنتج يبقى متصلاً (أي تعديل عليه يظهر هنا). يُحمَّل من الخادم مع الصفحة إن أمكن، وإلا من المتصفح
import { useEffect, useState } from 'react';
import axios from 'axios';
import ThemeRunner from '@/components/ThemeRunner';
import { StoreProvider } from '@/Hook/store-provider';
import { getProduct, getStoreByDomain } from '@/lib/api';
import ProductClient from '@/app/[domain]/(store)/product/[id]/ProductClient';
import { BARE_CSS, cartOff, withPageAttribution } from './themeBare';

type Props = {
  productId?: string;
  builderPageId: string;
  splitTestId?: string | null;
  product?: any;
  store?: any;
};

export default function ThemeProductBlock({ productId, builderPageId, splitTestId, product: initialProduct, store: initialStore }: Props) {
  const [product, setProduct] = useState<any>(initialProduct ?? null);
  const [store, setStore] = useState<any>(initialStore ?? null);
  const [domain, setDomain] = useState('');

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
      <div className="mds-bare mds-embed">
        <ThemeRunner bundleUrl={`/api/themes/${slug}`} exportName="default" themeProps={{ store: off.store, domain: host }}>
          <ProductClient product={off.product} store={off.store} domain={host} noTracker />
        </ThemeRunner>
      </div>
    </StoreProvider>
  );
}
