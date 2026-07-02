import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore'; // [cite: 7]

// --- المتغيرات والثوابت اللمسية للقالب (Smart Tech & Phones) ---
const BG = '#0F172A';        // خلفية داكنة للقسم العلوي (Dark Tech Tech Slate)
const ACCENT = '#06B6D4';    // لون الهوية التقنية (Cyan Tech Accent)
const ACCENT_HOVER = '#0891B2';
const TEXT_MAIN = '#1E293B';  // لون النصوص الأساسية
const TEXT_MUTED = '#64748B'; // لون النصوص الثانوية
const BORDER_COLOR = '#E2E8F0'; // لون الحدود الموحد [cite: 221]
const SURFACE = '#F8FAFC';     // لون أسطح البطاقات والحقول [cite: 221]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000'; // [cite: 30]

// --- الدالات المساعدة الأساسية ---
function variantMatches(d: any, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some((e: any) => e.attrName === n && e.value === v)); // [cite: 31]
}

const fetchWilayas = async (uid: string) => {
  const res = await fetch(`${API_URL}/shipping/public/get-shipping/${uid}`); // [cite: 32]
  return res.ok ? res.json() : [];
};

const fetchCommunes = async (wid: string) => {
  const res = await fetch(`${API_URL}/shipping/get-communes/${wid}`); // [cite: 33]
  return res.ok ? res.json() : [];
};

// --- المكونات والأيقونات البسيطة لتجنب المكتبات الخارجية ---
const PlaceholderIcon = ({ size = 40, color = TEXT_MUTED }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2" ry="2"/>
    <circle cx="9" cy="9" r="2"/>
    <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={TEXT_MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

// ==========================================
// 4. Main (The Wrapper)
// ==========================================
export default function Main({ store, children, domain }: any) {
  const pathname = usePathname(); // [cite: 18]

  useEffect(() => {
    window.scrollTo(0, 0); // إعادة تعيين التمرير عند تغيير المسار لتفادي ظهور الصفحة من الأسفل [cite: 17, 19]
  }, [pathname]);

  return (
    <div dir="rtl" style={{ fontFamily: 'system-ui, sans-serif', color: TEXT_MAIN, backgroundColor: '#FFF', minHeight: '100vh' }}> {/*  */}
      <Navbar store={store} domain={domain} /> {/* [cite: 7] */}
      <main style={{ minHeight: '70vh' }}>{children}</main>
      <Footer store={store} />
    </div>
  );
}

// ==========================================
// 5. Navbar
// ==========================================
export function Navbar({ store, domain }: any) {
  const [open, setOpen] = useState(false); // القائمة المتنقلة [cite: 44]
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const count = useCartStore((s) => s.count); // [cite: 46]
  const initCount = useCartStore((s) => s.initCount); // [cite: 46]

  useEffect(() => {
    const cartData = localStorage.getItem(domain); // [cite: 47]
    if (cartData) {
      try { initCount(JSON.parse(cartData).length); } catch(e) {}
    }
  }, [domain, initCount]);

  // منطق البحث المباشر مع التتبع والـ Debounce التلقائي
  useEffect(() => {
    if (searchQuery.length < 2) { setListSearch([]); return; }
    setLoading(true);
    const delayDebounce = setTimeout(async () => { // [cite: 11, 48]
      try {
        const res = await fetch(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(searchQuery)}`); // [cite: 48]
        if (res.ok) { const data = await res.json(); setListSearch(data.products || []); }
      } catch (e) {}
      setLoading(false);
    }, 380); // تأخير 380 ملي ثانية لمنع الضغط على الخادم [cite: 11, 48]

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, domain]);

  const mobileLinks = [ // روابط القائمة الجانبية للهاتف (لا تحتوي مطلقاً على السلة) [cite: 56, 59]
    { h: '/', l: 'الرئيسية' },
    { h: '/contact', l: 'تواصل معنا' },
  ];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#FFF', borderBottom: `1px solid ${BORDER_COLOR}` }}>
      {store?.topBar?.enabled && store?.topBar?.text && ( // [cite: 53]
        <div style={{ backgroundColor: BG, color: '#FFF', padding: '6px 12px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 500 }}>
          {store.topBar.text}
        </div>
      )}
      
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}> {/* [cite: 209] */}
        {/* الشعار */}
        <Link href="/" style={{ textDecoration: 'none', color: BG, fontWeight: 800, fontSize: '1.4rem', display: 'flex', alignItems: 'center' }}>
          {store?.design?.logoUrl && !imgError ? ( // [cite: 51]
            <img src={store.design.logoUrl} alt={store.name} onError={() => setImgError(true)} style={{ height: 40, objectFit: 'contain' }} />
          ) : (
            <span>{store?.name || 'SmartStore'}</span> // [cite: 51]
          )}
        </Link>

        {/* روابط الحواسب */}
        <nav className="nav-desktop" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none', color: TEXT_MAIN, fontWeight: 500 }}>الرئيسية</Link>
          <Link href="/contact" style={{ textDecoration: 'none', color: TEXT_MAIN, fontWeight: 500 }}>تواصل معنا</Link>
        </nav>

        {/* محرك البحث المباشر */}
        <div style={{ position: 'relative', flex: '0 1 350px', margin: '0 15px' }} className="search-container">
          <input
            type="text"
            placeholder="ابحث عن هاتف، إكسسوار..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 16px', borderRadius: 8, border: `1px solid ${BORDER_COLOR}`, outline: 'none', fontSize: '0.9rem' }}
          />
          {listSearch.length > 0 && (
            <div className="search-dropdown"> {/* تم حل مشكلة التمدد خارج الهاتف عبر الستايل المدمج الأسفل */}
              {listSearch.slice(0, 5).map((p: any) => (
                <Link key={p.id} href={`/product/${p.slug || p.id}`} onClick={() => setSearchQuery('')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderBottom: `1px solid ${BORDER_COLOR}`, textDecoration: 'none', color: TEXT_MAIN }}>
                  <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} style={{ width: 35, height: 35, objectFit: 'cover', borderRadius: 4 }} alt="" />
                  <span style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                </Link>
              ))}
              <Link href={`/?search=${encodeURIComponent(searchQuery)}`} onClick={() => setSearchQuery('')} style={{ display: 'block', textAlign: 'center', padding: 10, fontSize: '0.85rem', color: ACCENT, fontWeight: 600, textDecoration: 'none', backgroundColor: SURFACE }}>
                عرض جميع النتائج
              </Link>
            </div>
          )}
        </div>

        {/* أيقونة السلة والهمبرغر */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {store?.cart !== false && ( // إخفاء أيقونة السلة تماماً إذا كان المتجر يعطلها [cite: 52, 135]
            <Link href="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={TEXT_MAIN} strokeWidth="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {count > 0 && (
                <span style={{ position: 'absolute', top: -8, right: -10, backgroundColor: ACCENT, color: '#FFF', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                  {count}
                </span>
              )}
            </Link>
          )}

          <button onClick={() => setOpen(!open)} className="burger-btn" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={TEXT_MAIN} strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>

        {/* القائمة الجانبية للموبايل */}
        {open && (
          <div style={{ position: 'absolute', top: 70, left: 0, right: 0, backgroundColor: '#FFF', borderBottom: `2px solid ${ACCENT}`, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, zIndex: 99 }}>
            {mobileLinks.map((lnk) => (
              <Link key={lnk.h} href={lnk.h} onClick={() => setOpen(false)} style={{ textDecoration: 'none', color: TEXT_MAIN, fontWeight: 600, padding: '8px 0' }}>
                {lnk.l}
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
        }
        @media (min-width: 769px) {
          .burger-btn { display: none !important; }
        }
        @media (max-width: 480px) {
          .search-dropdown { position: fixed !important; left: 12px !important; right: 12px !important; width: auto !important; z-index: 101; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; top: 120px; } /* منع فيضان المودال خارج الشاشة الحية [cite: 49, 50, 141] */
        }
        @media (min-width: 481px) {
          .search-dropdown { position: absolute; top: 100%; right: 0; left: 0; background: white; border: 1px solid ${BORDER_COLOR}; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); z-index: 101; overflow: hidden; }
        }
      `}</style>
    </header>
  );
}

// ==========================================
// 6. Footer
// ==========================================
export function Footer({ store }: any) {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: SURFACE, borderTop: `1px solid ${BORDER_COLOR}`, padding: '40px 0', marginTop: 40 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }} className="footer-grid"> {/* [cite: 209] */}
        {/* معلومات المتجر */}
        <div>
          <h3 style={{ color: BG, fontWeight: 700, marginBottom: 12 }}>{store?.name}</h3>
          <p style={{ color: TEXT_MUTED, fontSize: '0.9rem', lineHeight: '1.6' }}>{store?.hero?.subtitle}</p> {/* [cite: 61] */}
          <p style={{ color: TEXT_MUTED, fontSize: '0.85rem', marginTop: 16 }}>&copy; {currentYear} جميع الحقوق محفوظة.</p> {/* [cite: 61] */}
        </div>

        {/* الروابط الصفحية */}
        <div>
          <h4 style={{ fontWeight: 600, marginBottom: 12 }}>روابط سريعة</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.9rem' }}>
            <Link href="/" style={{ textDecoration: 'none', color: TEXT_MUTED }}>الرئيسية</Link>
            {store?.cart !== false && <Link href="/cart" style={{ textDecoration: 'none', color: TEXT_MUTED }}>سلة التسوق</Link>} {/* التصفية الذكية للسلة [cite: 62, 135] */}
            <Link href="/contact" style={{ textDecoration: 'none', color: TEXT_MUTED }}>اتصل بنا</Link>
            <Link href="/privacy" style={{ textDecoration: 'none', color: TEXT_MUTED }}>سياسة الخصوصية</Link>
            <Link href="/terms" style={{ textDecoration: 'none', color: TEXT_MUTED }}>الشروط والأحكام</Link>
          </div>
        </div>

        {/* معلومات الاتصال الشرطية */}
        <div>
          <h4 style={{ fontWeight: 600, marginBottom: 12 }}>الدعم الفني</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.9rem', color: TEXT_MUTED }}>
            {store?.contact?.phone && <div>هاتف: {store.contact.phone}</div>} {/* [cite: 64, 65] */}
            {store?.contact?.email && <div>بريد: {store.contact.email}</div>} {/* [cite: 64, 65] */}
            {(store?.contact?.address || store?.contact?.wilaya) && (
              <div>الموقع: {store.contact.wilaya} {store.contact.address}</div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .footer-grid { display: grid; grid-template-columns: 1fr; gap: 32px; }
        @media (min-width: 768px) { .footer-grid { grid-template-columns: repeat(3, 1fr); } } /* [cite: 209] */
      `}</style>
    </footer>
  );
}

// ==========================================
// 7. Card (Product Card)
// ==========================================
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const [imgErr, setImgErr] = useState(false);
  // التحقق المزدوج من الصور والاحتياط لتجنب الروابط المكسورة [cite: 70, 71, 72]
  const img = displayImage || product?.productImage || product?.imagesProduct?.[0]?.imageUrl; 

  return (
    <div style={{ backgroundColor: '#FFF', borderRadius: 12, border: `1px solid ${BORDER_COLOR}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'transform 0.2s' }}>
      {discount > 0 && ( // شارة التخفيض [cite: 67]
        <span style={{ position: 'absolute', top: 12, right: 12, backgroundColor: '#EF4444', color: '#FFF', padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, zIndex: 10 }}>
          تخفيض {discount}%
        </span>
      )}

      {/* منطقة الصورة المقيدة بـ onError */}
      <div style={{ width: '100%', height: 220, backgroundColor: SURFACE, position: 'relative' }}>
        {img && !imgErr ? ( // [cite: 70]
          <img src={img} alt={product.name} onError={() => setImgErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> // [cite: 70]
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlaceholderIcon size={44} /> {/* [cite: 71] */}
          </div>
        )}
      </div>

      {/* تفاصيل الكارد المحددة بـ 2-line clamp لمقاومة تشوه العرض */}
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, height: '2.6rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: '0 0 10px 0', lineHeight: '1.3' }}> {/* [cite: 67] */}
          {product.name}
        </h3>

        {/* السعر والعملة */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: ACCENT }}>{product.price} {store?.currency || 'دج'}</span> {/* [cite: 68] */}
          {product.priceOriginal && Number(product.priceOriginal) > Number(product.price) && (
            <span style={{ fontSize: '0.85rem', color: TEXT_MUTED, textDecoration: 'line-through' }}>{product.priceOriginal} {store?.currency}</span>
          )}
        </div>

        <Link href={`/product/${product.slug || product.id}`} style={{ textDecoration: 'none', backgroundColor: BG, color: '#FFF', textAlign: 'center', padding: '10px', borderRadius: 8, marginTop: 12, fontSize: '0.85rem', fontWeight: 600, display: 'block' }}> {/* [cite: 69] */}
          عرض التفاصيل
        </Link>
      </div>
    </div>
  );
}

// ==========================================
// 8. Home Page
// ==========================================
export function Home({ store, page }: any) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category'); // [cite: 77]
  const searchQueryParam = searchParams.get('search') || '';

  const products = store?.products || [];

  // دالة حساب نسبة الخصم المستديرة [cite: 79]
  const calcDiscount = (orig: any, curr: any) => {
    if (!orig || Number(orig) <= Number(curr)) return 0;
    return Math.round(((Number(orig) - Number(curr)) / Number(orig)) * 100);
  };

  return (
    <div>
      {/* 1. Hero Section */}
      <section style={{ position: 'relative', backgroundColor: BG, color: '#FFF', overflow: 'hidden', minHeight: 'clamp(460px, 60vh, 700px)', display: 'flex', alignItems: 'center' }}> {/* [cite: 214] */}
        {store?.hero?.imageUrl && (
          <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}> {/* تثبيت خلفيات الهيرو عبر الستايل المضمن فقط لثبات الهيكلية [cite: 74, 173] */}
            <img src={store.hero.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }} /> {/* [cite: 173] */}
          </div>
        )}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 2, width: '100%' }}> {/* [cite: 209] */}
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: 16, maxWidth: 650, lineHeight: 1.2 }}> {/* [cite: 214] */}
            {store?.hero?.title || 'جيل جديد من الأجهزة الذكية'}
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: '#94A3B8', marginBottom: 24, maxWidth: 500 }}>
            {store?.hero?.subtitle}
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="#products-grid-section" style={{ textDecoration: 'none', backgroundColor: ACCENT, color: '#FFF', padding: '12px 24px', borderRadius: 8, fontWeight: 700 }}>تسوق الآن</Link>
          </div>
        </div>
      </section>

      {/* 2. Trust Bar */}
      <section style={{ borderBottom: `1px solid ${BORDER_COLOR}`, padding: '24px 0', backgroundColor: SURFACE }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, textAlign: 'center' }}> {/* [cite: 75, 209] */}
          <div><strong>🚚 توصيل سريع</strong><div style={{ fontSize: '0.8rem', color: TEXT_MUTED }}>لكافة الولايات</div></div> {/* [cite: 75] */}
          <div><strong>🛡️ ضمان الجودة</strong><div style={{ fontSize: '0.8rem', color: TEXT_MUTED }}>منتجات أصلية 100%</div></div> {/* [cite: 75] */}
          <div><strong>💳 الدفع عند الاستلام</strong><div style={{ fontSize: '0.8rem', color: TEXT_MUTED }}>آمن وموثوق بالكامل</div></div> {/* [cite: 75] */}
          <div><strong>📞 دعم متواصل</strong><div style={{ fontSize: '0.8rem', color: TEXT_MUTED }}>جاهزون لخدمتكم دائماً</div></div> {/* [cite: 75] */}
        </div>
      </section>

      {/* 3. Categories Navigation Bar (خادم فقط - لا تستخدم useState هنا مطلقاً) */}
      <section style={{ padding: '30px 0 10px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}> {/* [cite: 209] */}
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10 }}>
            <Link href="/" style={{ textDecoration: 'none', padding: '8px 16px', borderRadius: 20, backgroundColor: !activeCategory ? ACCENT : SURFACE, color: !activeCategory ? '#FFF' : TEXT_MAIN, fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              الكل
            </Link>
            {store?.categories?.map((cat: any) => (
              <Link key={cat.id} href={`?category=${cat.id}`} style={{ textDecoration: 'none', padding: '8px 16px', borderRadius: 20, backgroundColor: activeCategory === String(cat.id) ? ACCENT : SURFACE, color: activeCategory === String(cat.id) ? '#FFF' : TEXT_MAIN, fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Products Grid Section */}
      <section id="products-grid-section" style={{ padding: '20px 0 60px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}> {/* [cite: 209] */}
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: TEXT_MUTED }}>لا توجد منتجات متاحة حالياً في هذا القسم.</div>
          ) : (
            <>
              <div className="products-grid"> {/* تفعيل بريك-بوينت 640px الإجباري لمنع Cramped Cards [cite: 164, 211, 213] */}
                {products.map((p: any) => (
                  <Card key={p.id} product={p} discount={calcDiscount(p.priceOriginal, p.price)} store={store} /> // [cite: 79]
                ))}
              </div>

              {/* 5. Pagination */}
              {store?.count && store.count > 48 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                  {Array.from({ length: Math.ceil(store.count / 48) }).map((_, idx) => ( // [cite: 80]
                    <Link key={idx} href={{ query: { ...Object.fromEntries(searchParams.entries()), page: idx + 1 } }} scroll={false} style={{ textDecoration: 'none', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: (Number(page) || 1) === idx + 1 ? ACCENT : SURFACE, color: (Number(page) || 1) === idx + 1 ? '#FFF' : TEXT_MAIN, fontWeight: 600 }}> {/* [cite: 80] */}
                      {idx + 1}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <style>{`
        .products-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; } /* افتراضي للهواتف عمودي هو عمود واحد دائماً [cite: 210, 212] */
        @media (min-width: 640px) { .products-grid { grid-template-columns: repeat(2, 1fr); } } /* ممنوع التحول إلى عمودين قبل 640 بكسل [cite: 164, 211, 213] */
        @media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(3, 1fr); } } /* [cite: 211] */
        @media (min-width: 1280px) { .products-grid { grid-template-columns: repeat(4, 1fr); } } /* [cite: 211] */
      `}</style>
    </div>
  );
}

// ==========================================
// 9. Details Page
// ==========================================
export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
  const [sel, setSel] = useState(0); // مؤشر معرض الصور المصغر [cite: 81]

  const images = allImages || (product?.productImage ? [product.productImage] : []);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '30px 1.5rem' }}> {/* [cite: 209] */}
      <div className="details-inner" style={{ display: 'grid', gap: 32 }}> {/* [cite: 216] */}
        
        {/* الجانب الأيمن: معرض الصور التقني */}
        <div>
          <div style={{ width: '100%', height: 400, backgroundColor: SURFACE, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
            {images[sel] ? (
              <img src={images[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlaceholderIcon size={60}/></div>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
              {images.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setSel(idx)} style={{ border: idx === sel ? `2px solid ${ACCENT}` : `1px solid ${BORDER_COLOR}`, padding: 2, borderRadius: 6, backgroundColor: '#FFF', width: 60, height: 60, flexShrink: 0, cursor: 'pointer' }}> {/* [cite: 81] */}
                  <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* الجانب الأيسر: خيارات الشراء ونموذج الدفع السريع */}
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 12 }}>{product.name}</h1> {/* [cite: 82] */}
          
          <div style={{ backgroundColor: SURFACE, padding: 16, borderRadius: 8, marginBottom: 20 }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: ACCENT }}>{finalPrice} {product?.store?.currency || 'دج'}</span> {/* [cite: 82] */}
          </div>

          {/* العروض الترويجية إن وجدت الكميات */}
          {product?.offers && product.offers.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontWeight: 600, marginBottom: 8 }}>العروض المتوفرة:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {product.offers.map((of: any) => (
                  <label key={of.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, border: `1px solid ${BORDER_COLOR}`, borderRadius: 8, cursor: 'pointer' }}>
                    <input type="radio" name="offer" checked={selectedOffer === of.id} onChange={() => setSelectedOffer(of.id)} /> {/* [cite: 82] */}
                    <strong>{of.name}</strong> - <span style={{ color: ACCENT }}>{of.price}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* سمات ومواصفات المنتج (الألوان، السعات الذاكرية الإضافية) */}
          {allAttrs && allAttrs.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              {allAttrs.map((attr: any) => (
                <div key={attr.id} style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: TEXT_MUTED, display: 'block', marginBottom: 6 }}>{attr.name}:</span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {attr.variants?.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return (
                        <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ padding: '8px 16px', borderRadius: 6, border: isSel ? `2px solid ${ACCENT}` : `1px solid ${BORDER_COLOR}`, backgroundColor: isSel ? SURFACE : '#FFF', color: isSel ? ACCENT : TEXT_MAIN, fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}> {/* [cite: 83] */}
                          {v.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* دمج المكون الإجباري للطلب السريع الدفع */}
          <ProductForm
            product={product}
            userId={product?.store?.userId}
            domain={domain}
            selectedOffer={selectedOffer}
            setSelectedOffer={setSelectedOffer}
            selectedVariants={selectedVariants}
          />
          
          {/* الوصف التقني المعقم */}
          {product.desc && (
            <div style={{ marginTop: 32, borderTop: `1px solid ${BORDER_COLOR}`, paddingTop: 20 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 10 }}>وصف المنتج</h3>
              <div dangerouslySetInnerHTML={{ __html: product.desc }} style={{ fontSize: '0.95rem', lineHeight: '1.7', color: TEXT_MAIN }} /> {/* [cite: 84] */}
            </div>
          )}
        </div>

      </div>
      <style>{`
        .details-inner { grid-template-columns: 1fr; }
        @media (min-width: 768px) { .details-inner { grid-template-columns: 1fr 1fr; } } /* [cite: 218] */
      `}</style>
    </div>
  );
}

// ==========================================
// 10. ProductForm (Order Form)
// ==========================================
export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform }: any) {
  const router = useRouter();
  const initCount = useCartStore((s) => s.initCount);

  const [wilayas, setWilayas] = useState<any[]>([]);
  const [communes, setCommunes] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false); // التحكم في تمدد نموذج الطلب السريع [cite: 105]

  const [fd, setFd] = useState({ // [cite: 85]
    customerId: '', customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    quantity: 1, priceLoss: 0,
    typeLivraison: 'home' as 'home' | 'office'
  });

  // استرداد قائمة الولايات مع حماية المMount لمنع الالتطام ببيانات تالفة [cite: 199, 201]
  useEffect(() => {
    if (userId) fetchWilayas(userId).then(setWilayas); // [cite: 199]
  }, [userId]);

  // تحديث قائمة البلديات المتزامنة ديناميكياً مع تصفير المدخلات السابقة تفادياً للمشاكل [cite: 206]
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    fetchCommunes(fd.customerWelaya).then(setCommunes); // [cite: 206]
  }, [fd.customerWelaya]);

  // إجبار معامل المطابقة السلسة الصارمة String() لتفادي تعليق كود المقارنة الرقمي [cite: 34, 35, 94, 95, 149, 196, 197]
  const selW = useMemo(() => {
    return wilayas.find(w => String(w.id) === String(fd.customerWelaya)); // [cite: 35, 95, 197]
  }, [wilayas, fd.customerWelaya]);

  // الدالة الفاصلة لحساب السعر الفردي للمنتج [cite: 86]
  const getFP = (): number => {
    if (selectedOffer && product.offers) {
      const o = product.offers.find((x: any) => x.id === selectedOffer);
      if (o) return Number(o.price);
    }
    if (product.variantDetails && Object.keys(selectedVariants).length > 0) {
      const v = product.variantDetails.find((d: any) => variantMatches(d, selectedVariants));
      if (v && v.price !== -1) return Number(v.price);
    }
    return Number(product.price);
  };

  // الدالة الإلزامية لحساب تكلفة الشحن المحمية بـ Number() لمنع عمليات دمج النصوص الكارثية [cite: 36, 37, 38, 87, 97, 98, 158]
  const getLiv = useCallback((): number => {
    if (!selW) return 0; // [cite: 38, 98, 204]
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice); // [cite: 38, 98, 205]
  }, [selW, fd.typeLivraison]);

  const fp = getFP();
  const total = () => fp * fd.quantity + getLiv(); // [cite: 88]

  const getVarId = () => {
    if (!product.variantDetails) return null;
    const match = product.variantDetails.find((d: any) => variantMatches(d, selectedVariants));
    return match ? match.id : null;
  };

  // معالجة إضافة المنتجات للسلة وتخزين البيانات في الكاش المحلي [cite: 104]
  const handleAddToCart = () => {
    if (product?.store?.cart === false) return; // الحماية الصارمة [cite: 104]
    const currentItems = JSON.parse(localStorage.getItem(domain) || '[]');
    const payload = {
      id: Date.now().toString(),
      productId: product.id,
      storeId: product.store.id,
      userId: userId,
      quantity: fd.quantity,
      finalPrice: fp,
      totalPrice: total(),
      priceLivraison: getLiv(), // تمرير حقل الشحن الإلزامي المنفصل [cite: 104]
      variantDetailId: getVarId(), // [cite: 8, 104]
      selectedOffer,
      selectedVariants,
      platform,
      product,
      addedAt: new Date().toISOString()
    };
    currentItems.push(payload);
    localStorage.setItem(domain, JSON.stringify(currentItems));
    initCount(currentItems.length);
    alert('تم إضافة المنتج بنجاح إلى السلة!');
  };

  // إرسال الطلب النهائي المباشر [cite: 105]
  const handleOrderNowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fd.customerName || !fd.customerPhone || !fd.customerWelaya || !fd.customerCommune) {
      alert('الرجاء ملء كافة الحقول الإلزامية'); // [cite: 103]
      return;
    }
    
    // التحقق من صحة رقم الهاتف الجزائري بالـ Regex المحددة [cite: 103]
    const phoneRegex = /^(0|\+213)[5-7]\d{8}$/;
    if (!phoneRegex.test(fd.customerPhone)) {
      alert('رقم الهاتف غير صحيح، يجب أن يكون رقم هاتف جزائري صالح (مثال: 0550000000)');
      return;
    }

    setSubmitting(true);
    const payload = {
      ...fd,
      productId: product.id,
      storeId: product.store.id,
      totalPrice: total(),
      priceLivraison: getLiv(), // تسليم سعر التوصيل بشكل منفصل تماماً [cite: 10, 101, 146]
      variantDetailId: getVarId(), // [cite: 8]
      selectedOffer,
      selectedVariants,
      platform
    };

    try {
      const res = await fetch(`${API_URL}/orders/create`, { // [cite: 105, 128]
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        localStorage.setItem('cached_customer_id', fd.customerId); // [cite: 105]
        router.push(`/successfully?productId=${product.id}`); // [cite: 105]
      } else { alert('حدث خطأ أثناء إرسال الطلب، الرجاء المحاولة مرة أخرى.'); }
    } catch (e) { alert('خطأ في الاتصال بالخادم.'); }
    setSubmitting(false);
  };

  return (
    <div style={{ marginTop: 20, borderTop: `1px solid ${BORDER_COLOR}`, paddingTop: 16 }}>
      {!isOrderNow ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* عداد الكمية الهجين */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>الكمية:</span>
            <div style={{ display: 'inline-flex', alignItems: 'center', border: `1px solid ${BORDER_COLOR}`, borderRadius: 8, overflow: 'hidden', height: 40 }}> {/* [cite: 230] */}
              <button type="button" onClick={() => setFd(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))} style={{ width: 36, height: '100%', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>-</button> {/* [cite: 230] */}
              <span style={{ padding: '0 16px', fontWeight: 700 }}>{fd.quantity}</span>
              <button type="button" onClick={() => setFd(f => ({ ...f, quantity: f.quantity + 1 }))} style={{ width: 36, height: '100%', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>+</button> {/* [cite: 230] */}
            </div>
          </div>

          <button onClick={() => setIsOrderNow(true)} style={{ width: '100%', padding: '14px', backgroundColor: ACCENT, color: '#FFF', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
            اطلب الآن (الدفع عند الاستلام)
          </button>
          {product?.store?.cart !== false && ( // [cite: 104, 135]
            <button onClick={handleAddToCart} style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', color: TEXT_MAIN, border: `1px solid ${BORDER_COLOR}`, borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
              إضافة إلى السلة
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleOrderNowSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: BG }}>معلومات المشتري لشحن الطلب</h3>
          
          <input type="text" placeholder="الاسم الكامل *" required value={fd.customerName} onChange={e => setFd(f => ({ ...f, customerName: e.target.value }))} style={inputBaseStyle} />
          <input type="tel" placeholder="رقم الهاتف الخاص بك *" required value={fd.customerPhone} onChange={e => setFd(f => ({ ...f, customerPhone: e.target.value }))} style={inputBaseStyle} />

          {/* تبديل خطوط الاستلام (منزل / مكتب) عبر أزرار مرئية كاملة التمدد [cite: 228] */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}> {/* [cite: 228] */}
            <button type="button" onClick={() => setFd(f => ({ ...f, typeLivraison: 'home' }))} style={{ padding: 10, borderRadius: 8, border: fd.typeLivraison === 'home' ? `2px solid ${ACCENT}` : `1px solid ${BORDER_COLOR}`, backgroundColor: fd.typeLivraison === 'home' ? SURFACE : '#FFF', color: fd.typeLivraison === 'home' ? ACCENT : TEXT_MAIN, fontWeight: 600, cursor: 'pointer' }}>🏠 توصيل للمنزل</button> {/* [cite: 228, 229] */}
            <button type="button" onClick={() => setFd(f => ({ ...f, typeLivraison: 'office' }))} style={{ padding: 10, borderRadius: 8, border: fd.typeLivraison === 'office' ? `2px solid ${ACCENT}` : `1px solid ${BORDER_COLOR}`, backgroundColor: fd.typeLivraison === 'office' ? SURFACE : '#FFF', color: fd.typeLivraison === 'office' ? ACCENT : TEXT_MAIN, fontWeight: 600, cursor: 'pointer' }}>🏢 استلام من المكتب</button> {/* [cite: 228, 229] */}
          </div>

          {/* اختيار الولاية المحمي في وضع التجميد عند فراغ المصفوفة لمنع الانهيارات المفاجئة [cite: 202, 203] */}
          <div style={{ position: 'relative' }}> {/* [cite: 223] */}
            <select disabled={wilayas.length === 0} required value={fd.customerWelaya} onChange={e => setFd(f => ({ ...f, customerWelaya: e.target.value, customerCommune: '' }))} style={{ ...inputBaseStyle, paddingRight: 36, appearance: 'none' }}> {/* [cite: 203, 221, 223] */}
              <option value="">{wilayas.length === 0 ? 'الشحن غير متوفر حالياً' : 'اختر الولاية *'}</option> {/* [cite: 203, 204] */}
              {wilayas.map((w: any) => <option key={w.id} value={w.id}>{w.name} - {w.ar_name}</option>)}
            </select>
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><ChevronDownIcon /></span> {/* [cite: 223, 224] */}
          </div>

          <div style={{ position: 'relative' }}> {/* [cite: 223] */}
            <select disabled={communes.length === 0} required value={fd.customerCommune} onChange={e => setFd(f => ({ ...f, customerCommune: e.target.value }))} style={{ ...inputBaseStyle, paddingRight: 36, appearance: 'none' }}> {/* [cite: 221, 223] */}
              <option value="">اختر البلدية *</option>
              {communes.map((c: any) => <option key={c.id} value={c.id}>{c.name} - {c.ar_name}</option>)}
            </select>
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><ChevronDownIcon /></span> {/* [cite: 223, 224] */}
          </div>

          {/* ملخص الفاتورة الإلزامي مع إجبار عدم التفاف الأسطر [cite: 10, 100, 116, 145, 160] */}
          <div style={{ backgroundColor: SURFACE, padding: 14, borderRadius: 8, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>سعر المنتج:</span>
              <span style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{fp.toLocaleString()} دج</span> {/* [cite: 116] */}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>الكمية:</span>
              <span style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>× {fd.quantity}</span> {/* [cite: 100, 116] */}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px dashed ${BORDER_COLOR}`, paddingBottom: 8 }}>
              <span>تكلفة التوصيل:</span>
              <span style={{ whiteSpace: 'nowrap', fontWeight: 600, color: selW ? TEXT_MAIN : '#EF4444' }}>
                {selW ? `${getLiv().toLocaleString()} دج` : '— (حدد الولاية أولاً)'} {/* [cite: 100, 101] */}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 700, paddingTop: 4 }}>
              <span>المجموع الكلي:</span>
              <span style={{ whiteSpace: 'nowrap', color: ACCENT }}>{total().toLocaleString()} دج</span> {/* [cite: 116] */}
            </div>
          </div>

          {/* أزرار الإرسال والإلغاء المترابطة إجبارياً بـ disabled لمنع التداخل أثناء التحميل  */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={submitting} style={{ flex: 2, padding: '14px', backgroundColor: ACCENT, color: '#FFF', border: 'none', borderRadius: 8, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? 'جاري إرسال الطلب...' : 'تأكيد طلب الشراء'} {/* [cite: 107] */}
            </button>
            <button type="button" disabled={submitting} onClick={() => setIsOrderNow(false)} style={{ flex: 1, padding: '14px', backgroundColor: 'transparent', color: TEXT_MUTED, border: `1px solid ${BORDER_COLOR}`, borderRadius: 8, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer' }}>
              إلغاء
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

const inputBaseStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', fontSize: '0.9rem', border: `1px solid ${BORDER_COLOR}`, borderRadius: 8, outline: 'none', backgroundColor: '#FFF', fontFamily: 'inherit' // [cite: 221, 222]
};

// ==========================================
// 11. Cart Page
// ==========================================
export function Cart({ domain, store }: any) {
  const router = useRouter();
  const initCount = useCartStore((s) => s.initCount);

  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<any[]>([]);
  const [communes, setCommunes] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [fd, setFd] = useState({ // [cite: 111]
    customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    typeLivraison: 'home' as 'home' | 'office'
  });

  // مزامنة الكاش المحلي للسلة عند فتح الصفحة [cite: 110]
  useEffect(() => {
    const data = localStorage.getItem(domain); // [cite: 110]
    if (data) { try { setItems(JSON.parse(data)); } catch(e) {} }
  }, [domain]);

  useEffect(() => {
    if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas); // [cite: 200]
  }, [store]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    fetchCommunes(fd.customerWelaya).then(setCommunes); // [cite: 206]
  }, [fd.customerWelaya]);

  const selW = useMemo(() => {
    return wilayas.find(w => String(w.id) === String(fd.customerWelaya)); // [cite: 35, 95, 197]
  }, [wilayas, fd.customerWelaya]);

  const getLiv = useCallback((): number => {
    if (!selW) return 0; // [cite: 38, 98, 204]
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice); // [cite: 38, 98, 205]
  }, [selW, fd.typeLivraison]);

  const cartTotal = items.reduce((acc, it) => acc + (Number(it.finalPrice) * Number(it.quantity)), 0); // [cite: 111]
  const finalTotal = cartTotal + getLiv(); // [cite: 111]

  const handleDeleteItem = (id: string) => {
    const filtered = items.filter(it => it.id !== id);
    setItems(filtered);
    localStorage.setItem(domain, JSON.stringify(filtered));
    initCount(filtered.length);
  };

  const handleCartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!fd.customerName || !fd.customerPhone || !fd.customerWelaya || !fd.customerCommune) {
      alert('الرجاء ملء كافة الحقول الإلزامية لشحن طلباتك');
      return;
    }

    const phoneRegex = /^(0|\+213)[5-7]\d{8}$/;
    if (!phoneRegex.test(fd.customerPhone)) {
      alert('رقم الهاتف غير صحيح');
      return;
    }

    setSubmitting(true);
    // إرسال الطلبات كصفوف مصفوفة منفصلة لكل سطر شحن في السلة الكلية [cite: 112]
    const payload = {
      ...fd,
      items: items.map(it => ({
        productId: it.productId,
        quantity: it.quantity,
        finalPrice: it.finalPrice,
        variantDetailId: it.variantDetailId,
        selectedOffer: it.selectedOffer,
        selectedVariants: it.selectedVariants
      })),
      totalPrice: finalTotal,
      priceLivraison: getLiv() // [cite: 112]
    };

    try {
      const res = await fetch(`${API_URL}/orders/create-cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        localStorage.removeItem(domain); // [cite: 113]
        initCount(0); // [cite: 113]
        router.push('/successfully?cart=true'); // [cite: 113]
      } else { alert('خطأ في معالجة طلب السلة'); }
    } catch(e) {}
    setSubmitting(false);
  };

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 1.5rem', textAlign: 'center' }}> {/* [cite: 209] */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 16 }}>سلة التسوق فارغة حالياً 🛒</h2> {/* [cite: 114] */}
        <p style={{ color: TEXT_MUTED, marginBottom: 24 }}>تصفح متجرنا وأضف أحدث المنتجات الذكية لسلتك.</p>
        <Link href="/" style={{ textDecoration: 'none', backgroundColor: ACCENT, color: '#FFF', padding: '12px 24px', borderRadius: 8, fontWeight: 700 }}> {/* [cite: 114] */}
          ابدأ التسوق الآن
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '30px 1.5rem' }}> {/* [cite: 209] */}
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 24 }}>سلة التسوق ({items.length})</h1>
      
      <div className="cart-inner" style={{ display: 'grid', gap: 32 }}> {/* [cite: 215] */}
        {/* قائمة الأجهزة المضافة */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map((it) => {
            const itemImg = it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl; // الاحتياط المزدوج للصور [cite: 117, 118]
            return (
              <div key={it.id} style={{ display: 'flex', gap: 14, padding: 16, border: `1px solid ${BORDER_COLOR}`, borderRadius: 12, alignItems: 'center' }}>
                <div style={{ width: 70, height: 70, backgroundColor: SURFACE, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                  {itemImg ? <img src={itemImg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <PlaceholderIcon size={30} />} {/* [cite: 118] */}
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 4px 0' }}>{it.product?.name}</h4>
                  <div style={{ fontSize: '0.85rem', color: ACCENT, fontWeight: 700 }}>
                    {it.finalPrice} دج <span style={{ color: TEXT_MUTED, fontWeight: 400 }}>× {it.quantity}</span>
                  </div>
                </div>
                <button onClick={() => handleDeleteItem(it.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }} title="حذف عنصر"> {/* [cite: 114] */}
                  <TrashIcon />
                </button>
              </div>
            );
          })}
        </div>

        {/* نموذج التأكيد وحساب الشحن الشامل المدمج للموقع الفوري للطلبات */}
        <div style={{ backgroundColor: SURFACE, padding: 20, borderRadius: 12, border: `1px solid ${BORDER_COLOR}` }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>إكمال الشراء والشحن</h3>
          <form onSubmit={handleCartSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="text" placeholder="الاسم واللقب المعني بالاستلام *" required value={fd.customerName} onChange={e => setFd(f => ({ ...f, customerName: e.target.value }))} style={inputBaseStyle} />
            <input type="tel" placeholder="رقم الهاتف الفعال *" required value={fd.customerPhone} onChange={e => setFd(f => ({ ...f, customerPhone: e.target.value }))} style={inputBaseStyle} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '4px 0' }}>
              <button type="button" onClick={() => setFd(f => ({ ...f, typeLivraison: 'home' }))} style={{ padding: 10, borderRadius: 8, border: fd.typeLivraison === 'home' ? `2px solid ${ACCENT}` : `1px solid ${BORDER_COLOR}`, backgroundColor: fd.typeLivraison === 'home' ? '#FFF' : 'transparent', color: fd.typeLivraison === 'home' ? ACCENT : TEXT_MAIN, fontWeight: 600, cursor: 'pointer' }}>🏠 للمنزل</button>
              <button type="button" onClick={() => setFd(f => ({ ...f, typeLivraison: 'office' }))} style={{ padding: 10, borderRadius: 8, border: fd.typeLivraison === 'office' ? `2px solid ${ACCENT}` : `1px solid ${BORDER_COLOR}`, backgroundColor: fd.typeLivraison === 'office' ? '#FFF' : 'transparent', color: fd.typeLivraison === 'office' ? ACCENT : TEXT_MAIN, fontWeight: 600, cursor: 'pointer' }}>🏢 المكتب</button>
            </div>

            <div style={{ position: 'relative' }}>
              <select disabled={wilayas.length === 0} required value={fd.customerWelaya} onChange={e => setFd(f => ({ ...f, customerWelaya: e.target.value, customerCommune: '' }))} style={{ ...inputBaseStyle, paddingRight: 36, appearance: 'none' }}>
                <option value="">{wilayas.length === 0 ? 'الشحن غير متوفر' : 'اختر ولايتك *'}</option>
                {wilayas.map((w: any) => <option key={w.id} value={w.id}>{w.name} - {w.ar_name}</option>)}
              </select>
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><ChevronDownIcon /></span>
            </div>

            <div style={{ position: 'relative' }}>
              <select disabled={communes.length === 0} required value={fd.customerCommune} onChange={e => setFd(f => ({ ...f, customerCommune: e.target.value }))} style={{ ...inputBaseStyle, paddingRight: 36, appearance: 'none' }}>
                <option value="">اختر البلدية التابعة *</option>
                {communes.map((c: any) => <option key={c.id} value={c.id}>{c.name} - {c.ar_name}</option>)}
              </select>
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><ChevronDownIcon /></span>
            </div>

            {/* تفاصيل صفوف ملخص السلة الكلي */}
            <div style={{ backgroundColor: '#FFF', padding: 16, borderRadius: 8, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ flexShrink: 0 }}>مجموع المنتجات:</span> {/* [cite: 115] */}
                <span style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{cartTotal.toLocaleString()} دج</span> {/* [cite: 115] */}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ flexShrink: 0 }}>تكلفة التوصيل الشاملة:</span> {/* [cite: 115] */}
                <span style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{selW ? `${getLiv().toLocaleString()} دج` : '—'}</span> {/* [cite: 111, 115, 116] */}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${BORDER_COLOR}`, paddingTop: 10, fontSize: '1.1rem', fontWeight: 700 }}>
                <span style={{ flexShrink: 0 }}>الإجمالي المستحق للدفع:</span>
                <span style={{ whiteSpace: 'nowrap', color: ACCENT }}>{finalTotal.toLocaleString()} دج</span>
              </div>
            </div>

            <button type="submit" disabled={submitting} style={{ width: '100%', padding: '14px', backgroundColor: BG, color: '#FFF', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', marginTop: 10 }}>
              {submitting ? 'جاري تسجيل الطلبات...' : 'إرسال الشراء والدفع عند الاستلام'}
            </button>
          </form>
        </div>
      </div>
      <style>{`
        .cart-inner { grid-template-columns: 1fr; }
        @media (min-width: 1024px) { .cart-inner { grid-template-columns: 1.3fr 1fr; } } /* [cite: 217] */
      `}</style>
    </div>
  );
}

// ==========================================
// 12. Static Pages (Privacy, Terms, Cookies)
// ==========================================
function InfoBlock({ title, body }: { title: string, body: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: BG, marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', color: TEXT_MAIN, lineHeight: '1.6' }}>{body}</p>
    </div>
  );
}

function PageShell({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 1.5rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: BG, borderBottom: `2px solid ${ACCENT}`, paddingBottom: 12, marginBottom: 24 }}>{title}</h1>
      {children}
    </div>
  );
}

export function Privacy() {
  return (
    <PageShell title="سياسة الخصوصية"> {/* الهيكلية الإلزامية التي تحتوي على 3 تكتلات معلوماتية [cite: 121] */}
      <InfoBlock title="1. جمع المعلومات" body="نحن نجمع البيانات التقنية الأساسية اللازمة لإتمام عمليات الشراء والتوصيل لضمان كفاءة وصول هاتفك الذكي أو ملحقاته." /> {/* [cite: 121] */}
      <InfoBlock title="2. حماية وتأمين البيانات" body="يتم تخزين كافة البيانات الحساسة ومزامنتها بأحدث بروتوكولات التشفير والتشبيك السحابي لحظر أي تسريب محتمل." /> {/* [cite: 121] */}
      <InfoBlock title="3. مشاركة المعلومات" body="لا نبيع بيانات العملاء لأي أطراف خارجية، بل نشارك العناوين حصرياً مع وكلاء الشحن المعتمدين لحساب المسافات." /> {/* [cite: 121] */}
    </PageShell>
  );
}

export function Terms() {
  return (
    <PageShell title="الشروط والأحكام">
      <InfoBlock title="1. شروط الاستخدام" body="باستخدامك لمتجر الأجهزة الذكية هذا، فإنك تقر وتوافق على الامتثال لكامل البنود التشغيلية المحددة لدينا." /> {/* [cite: 121] */}
      <InfoBlock title="2. سياسة الطلبات والأسعار" body="نحتفظ بالحق الكامل في تعديل أسعار الهواتف والملحقات التقنية المعروضة بدون أي إشعار مسبق تبعاً لتغيرات السوق." /> {/* [cite: 121] */}
      <InfoBlock title="3. الدفع والمسؤولية" body="تتم كافة المعاملات عبر الدفع نقدًا عند الاستلام، ويلتزم العميل بجدية تسلم الشحنة بمجرد خروجها مع الوكيل." /> {/* [cite: 121] */}
    </PageShell>
  );
}

export function Cookies() {
  return (
    <PageShell title="سياسة ملفات تعريف الارتباط (Cookies)">
      <InfoBlock title="1. ماهية ملفات الارتباط" body="ملفات تعريف الارتباط هي حزم بيانات نصية صغيرة تودع في متصفحك لتذكر سلة الشراء المفتوحة والخيارات." /> {/* [cite: 121] */}
      <InfoBlock title="2. كيف نستخدمها كمتجر" body="نوظفها حصرياً لتذكر المنتجات التقنية التي أضفتها حديثاً إلى السلة وضمان ثبات مسار التصفح التقني الخاص بك." /> {/* [cite: 121] */}
      <InfoBlock title="3. التحكم بالملفات" body="تستطيع تعطيل أو حذف كوكيز المتصفح بالكامل من خلال إعدادات الخصوصية الخاصة بجهازك في أي وقت تشاء." /> {/* [cite: 121] */}
    </PageShell>
  );
}

// ==========================================
// Contact Page
// ==========================================
export function Contact({ store }: any) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' }); // [cite: 122]
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/user/contact-user/message`, { // [cite: 123, 128]
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, storeId: store?.id }) // [cite: 123]
      });
      if (res.ok) { setSent(true); setForm({ name: '', email: '', phone: '', message: '' }); } // [cite: 123]
    } catch (e) {}
    setLoading(false);
  };

  if (sent) {
    return (
      <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>✉️</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 12 }}>تم إرسال رسالتك بنجاح!</h2> {/* [cite: 124] */}
        <p style={{ color: TEXT_MUTED, marginBottom: 24 }}>فريق الدعم الفني الخاص بمتجرنا سيقوم بمراجعة طلبك والرد عليك في أقرب وقت.</p>
        <button onClick={() => setSent(false)} style={{ padding: '12px 24px', backgroundColor: ACCENT, color: '#FFF', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}> {/* [cite: 124] */}
          إرسال رسالة أخرى
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 1.5rem' }}> {/* [cite: 209] */}
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 32, textAlign: 'center' }}>اتصل بنا</h1>
      
      <div className="contact-grid" style={{ display: 'grid', gap: 40 }}> {/* [cite: 122] */}
        {/* تفاصيل الاتصال الجانبية */}
        <div style={{ backgroundColor: SURFACE, padding: 24, borderRadius: 12, height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, color: BG }}>معلومات المبيعات والدعم</h3>
          <p style={{ fontSize: '0.9rem', color: TEXT_MUTED, marginBottom: 20 }}>يسعدنا تواصلكم معنا للاستفسار عن الهواتف، قطع الغيار، أو تتبع شحناتكم الدورية.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.95rem' }}>
            {store?.contact?.phone && <div>📞 <strong>رقم الهاتف:</strong> {store.contact.phone}</div>}
            {store?.contact?.email && <div>✉️ <strong>البريد الإلكتروني:</strong> {store.contact.email}</div>}
            {store?.contact?.wilaya && <div>📍 <strong>الولاية والموقع:</strong> {store.contact.wilaya} {store.contact.address}</div>}
          </div>
        </div>

        {/* نموذج المراسلة الفوري */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}> {/* [cite: 122] */}
          <input type="text" placeholder="الاسم الكامل *" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputBaseStyle} />
          <input type="email" placeholder="البريد الإلكتروني" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputBaseStyle} />
          <input type="tel" placeholder="رقم الهاتف *" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inputBaseStyle} />
          <textarea placeholder="اكتب استفسارك أو رسالتك الفنية هنا..." required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ ...inputBaseStyle, resize: 'none' }} /> {/* [cite: 231] */}
          
          <button type="submit" disabled={loading} style={{ padding: '14px', backgroundColor: ACCENT, color: '#FFF', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'جاري الإرسال الآن...' : 'إرسال الرسالة'}
          </button>
        </form>
      </div>

      <style>{`
        .contact-grid { grid-template-columns: 1fr; }
        @media (min-width: 768px) { .contact-grid { grid-template-columns: 1fr 1.2fr; } }
      `}</style>
    </div>
  );
}

// ==========================================
// 13. StaticPage (Router Wrapper)
// ==========================================
export function StaticPage({ staticPage, page, store }: any) {
  const p = (staticPage || page || '').toLowerCase(); // [cite: 125]
  
  // دالة التوجيه الشرطية الإلزامية للمكونات الثابتة [cite: 125]
  if (p === 'privacy') return <Privacy />;
  if (p === 'terms') return <Terms />;
  if (p === 'cookies') return <Cookies />;
  if (p === 'contact') return <Contact store={store} />; // [cite: 126]
  
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 1.5rem', textAlign: 'center', color: TEXT_MUTED }}>
      الصفحة المطلوبة غير موجودة.
    </div>
  );
}