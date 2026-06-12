'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, ToggleRight, ArrowLeft,
  Plus, Minus, CheckCircle2, Lock, Menu, Package,
  Truck, Shield, Search, ShoppingCart,
  Trash2, Loader2, Phone, MapPin, Mail, Activity, Zap, User,
  HeartPulse, Stethoscope, Ambulance,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');

  *, *::before, *::after { box-sizing:border-box; -webkit-font-smoothing:antialiased; margin:0; padding:0; }
  html { scroll-behavior:smooth; }

  :root {
    --sky:     #0EA5E9;
    --sky-2:   #0284C7;
    --sky-lt:  #F0F9FF;
    --teal:    #14B8A6;
    --teal-lt: #F0FDFA;
    --white:   #FFFFFF;
    --off:     #F8FAFC;
    --slate:   #F1F5F9;
    --ink:     #0F172A;
    --mid:     #475569;
    --dim:     #94A3B8;
    --line:    #E2E8F0;
    --green:   #16A34A;
    --red:     #DC2626;
    --amber:   #F59E0B;
    --rose:    #F43F5E;
  }

  body { background:var(--off); color:var(--ink); font-family:'Inter',sans-serif; }
  a    { text-decoration:none; color:inherit; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:var(--sky); border-radius:2px; }

  .pjs { font-family:'Plus Jakarta Sans',sans-serif; }

  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .fi { animation:fadeIn 0.5s ease both; }
  @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes spin   { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes check-in { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
  .anim-check { animation:check-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

  .p-card {
    background:var(--white); border:1px solid var(--line); border-radius:12px;
    overflow:hidden; transition:all 0.25s; cursor:pointer;
    display:flex; flex-direction:column;
  }
  .p-card:hover { transform:translateY(-3px); box-shadow:0 8px 30px rgba(14,165,233,0.1); }

  .cat-card {
    position:relative; overflow:hidden; border-radius:12px;
    border:1px solid var(--line); background:var(--white);
    cursor:pointer; display:block; transition:all 0.25s;
  }
  .cat-card:hover { transform:translateY(-3px); box-shadow:0 8px 30px rgba(14,165,233,0.12); }
  .cat-card:hover img { transform:scale(1.04); }
  .cat-card img { display:block; width:100%; height:100%; object-fit:cover; transition:transform 0.35s ease; }

  .btn-primary {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:var(--sky); color:white;
    font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; font-weight:700;
    padding:12px 28px; border:none; cursor:pointer; border-radius:8px;
    transition:all 0.2s;
  }
  .btn-primary:hover { background:var(--sky-2); transform:translateY(-1px); box-shadow:0 4px 16px rgba(14,165,233,0.3); }
  .btn-primary:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

  .btn-outline {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:transparent; color:var(--sky);
    font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; font-weight:700;
    padding:12px 28px; border:1.5px solid var(--sky); cursor:pointer; border-radius:8px;
    transition:all 0.2s;
  }
  .btn-outline:hover { background:var(--sky-lt); }

  .inp {
    width:100%; padding:12px 14px;
    background:var(--white); border:1.5px solid var(--line);
    font-family:'Inter',sans-serif; font-size:14px; color:var(--ink);
    outline:none; border-radius:8px; transition:border-color 0.2s,box-shadow 0.2s;
  }
  .inp:focus { border-color:var(--sky); box-shadow:0 0 0 3px rgba(14,165,233,0.1); }
  .inp::placeholder { color:var(--dim); }
  select.inp { appearance:none; cursor:pointer; }

  .ticker-stripe { overflow:hidden; white-space:nowrap; }
  .ticker-inner  { display:inline-block; animation:ticker 25s linear infinite; }

  .prod-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .cat-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
  .trust-row { display:grid; grid-template-columns:repeat(4,1fr); }
  .footer-g  { display:grid; grid-template-columns:2fr 1fr 1fr; gap:48px; }
  .details-g { display:grid; grid-template-columns:1fr 1fr; gap:32px; }
  .contact-g { display:grid; grid-template-columns:1fr 1fr; gap:48px; }
  .form-2c   { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .dlv-2c    { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .cart-layout { display:grid; grid-template-columns:1.2fr 1fr; gap:40px; align-items:start; }
  .thumb-row { display:flex; gap:8px; flex-wrap:wrap; }
  .pagination { display:flex; justify-content:center; gap:6px; margin-top:40px; flex-wrap:wrap; }

  .nav-search-d { display:none; }

  .why-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }

  @media (min-width:1024px) { .nav-search-d { display:block; } }

  @media (max-width:1024px) {
    .prod-grid { grid-template-columns:repeat(3,1fr); }
    .footer-g  { grid-template-columns:1fr 1fr; gap:32px; }
    .why-grid  { grid-template-columns:repeat(2,1fr); }
  }
  @media (max-width:768px) {
    .prod-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
    .cat-grid  { grid-template-columns:repeat(2,1fr); }
    .trust-row { grid-template-columns:repeat(2,1fr); }
    .footer-g  { grid-template-columns:1fr; gap:28px; }
    .details-g { grid-template-columns:1fr; }
    .contact-g { grid-template-columns:1fr; gap:24px; }
    .cart-layout { grid-template-columns:1fr; }
    .why-grid  { grid-template-columns:1fr; }
  }
  @media (max-width:480px) {
    .form-2c { grid-template-columns:1fr; }
    .dlv-2c  { grid-template-columns:1fr; }
  }
`;

interface Offer { id: string; name: string; quantity: number; price: number; }
interface Variant { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color'|'image'|'text'|null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color'|'image'|'text'; value: string; }
interface VariantDetail { id: string|number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }
export interface Product {
  id: string; name: string; price: string|number; priceOriginal?: string|number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[]; offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; };
}
export interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string|null; setSelectedOffer: (id: string|null) => void;
  selectedVariants: Record<string,string>; platform?: string; priceLoss?: number;
}

const vm = (d: VariantDetail, s: Record<string,string>) =>
  Object.entries(s).every(([n,v]) => d.name.some(e => e.attrName===n && e.value===v));

const fetchWilayas  = async (uid: string): Promise<Wilaya[]> => {
  try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data||[]; } catch { return []; }
};
const fetchCommunes = async (wid: string): Promise<Commune[]> => {
  try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data||[]; } catch { return []; }
};

const INP_S = (err?: boolean): React.CSSProperties => ({
  width:'100%', padding:'12px 14px', background:'var(--white)',
  border:`1.5px solid ${err?'#ef4444':'var(--line)'}`,
  fontFamily:"'Inter',sans-serif", fontSize:'14px', color:'var(--ink)',
  outline:'none', borderRadius:'8px', transition:'border-color 0.2s'
});

const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom:'14px', direction:'rtl' }}>
    {label && <p className="pjs" style={{ fontSize:'12px', fontWeight:700, letterSpacing:'0.04em', color:'var(--mid)', marginBottom:'6px', textAlign:'right' }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize:'12px', color:'#ef4444', marginTop:'4px', display:'flex', alignItems:'center', gap:'4px', justifyContent:'flex-end' }}>
      {error}<AlertCircle style={{ width:'12px', height:'12px' }} />
    </p>}
  </div>
);

export default function Main({ store, children, domain }: any) {
  return (
    <div style={{ minHeight:'100vh', backgroundColor:'var(--off)' }}>
      <style>{CSS}</style>
      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

export function Navbar({ store, domain }: { store: any; domain: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sq, setSq] = useState('');
  const [ls, setLs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();

  const count = useCartStore(s => s.count);
  const initCount = useCartStore(s => s.initCount);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      try { initCount(JSON.parse(localStorage.getItem(domain)||'[]').length); } catch { initCount(0); }
    }
  }, [domain, initCount]);

  useEffect(() => {
    if (sq.length < 2) { setLs([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: sq } });
        setLs(data.products || []);
      } catch {} finally { setLoading(false); }
    }, 380);
    return () => clearTimeout(t);
  }, [sq, domain]);

  const doSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (sq.trim()) {
      router.push(`/?search=${encodeURIComponent(sq)}`);
      setSq('');
      setShowSearch(false);
    }
  };

  const SearchDrop = () => (
    <div style={{
      position:'absolute', top:'calc(100% + 4px)', right:0, left:0,
      background:'var(--white)', border:'1px solid var(--sky)', borderRadius:'10px',
      zIndex:200, overflow:'hidden', boxShadow:'0 12px 40px rgba(14,165,233,0.15)'
    }} className="fi">
      <div style={{ display:'flex', justifyContent:'flex-end', padding:'8px 12px 2px' }}>
        <button onClick={() => setSq('')} style={{
          background:'var(--sky-lt)', border:'none', borderRadius:'50%',
          width:24, height:24, display:'flex', alignItems:'center',
          justifyContent:'center', cursor:'pointer', color:'var(--sky)'
        }}><X size={12} /></button>
      </div>
      {loading ? (
        <div style={{ padding:'1.5rem', textAlign:'center', color:'var(--sky)', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700 }}>جاري البحث...</div>
      ) : ls.length > 0 ? (
        <div style={{ maxHeight:'320px', overflowY:'auto' }}>
          {ls.map((p: any) => (
            <Link href={`/product/${p.id}`} key={p.id} onClick={() => setSq('')} style={{
              display:'flex', alignItems:'center', gap:'0.75rem', padding:'10px 14px',
              borderBottom:'1px solid var(--line)', textDecoration:'none'
            }}>
              <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl}
                style={{ width:40, height:40, objectFit:'cover', flexShrink:0, borderRadius:'6px' }} alt="" />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'13px', fontWeight:600, color:'var(--ink)' }}>{p.name}</div>
                <div style={{ fontSize:'13px', color:'var(--sky)', fontWeight:700 }}>{p.price} دج</div>
              </div>
            </Link>
          ))}
          <button onClick={() => doSearch()} style={{
            width:'100%', padding:'10px', background:'var(--sky-lt)', border:'none',
            borderTop:'1px solid var(--line)', color:'var(--sky)', fontWeight:700,
            fontSize:'12px', cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif",
            display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'
          }}>
            عرض جميع النتائج <ArrowLeft size={12} />
          </button>
        </div>
      ) : sq.length >= 2 && (
        <div style={{ padding:'1.25rem', textAlign:'center', color:'var(--dim)', fontSize:'13px' }}>لا توجد نتائج</div>
      )}
    </div>
  );

  return (
    <header dir="rtl" style={{ position:'sticky', top:0, zIndex:100, fontFamily:"'Inter',sans-serif" }}>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div className="ticker-stripe" style={{ background:'linear-gradient(90deg, var(--sky), var(--teal))', padding:'5px 0' }}>
          <div className="ticker-inner">
            {Array(10).fill(null).map((_, i) => (
              <span key={i} style={{ fontSize:'11px', fontWeight:600, letterSpacing:'0.08em', color:'white', margin:'0 30px' }}>
                <HeartPulse size={12} style={{ display:'inline', marginLeft:4, verticalAlign:'middle' }} /> {store.topBar.text} <HeartPulse size={12} style={{ display:'inline', marginRight:4, verticalAlign:'middle' }} />
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: scrolled ? 'rgba(255,255,255,0.97)' : 'var(--white)',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--sky)' : 'var(--line)'}`,
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          maxWidth:'1280px', margin:'0 auto', padding:'0 20px',
          height:'64px', display:'flex', alignItems:'center',
          justifyContent:'space-between', gap:'16px'
        }}>
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
            {(store.design?.logoUrl && store.design.logoUrl !== '/default-logo.png')
              ? <img src={store.design.logoUrl} alt={store.name} style={{ height:'32px', width:'auto', objectFit:'contain' }} />
              : <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <HeartPulse size={26} style={{ color:'var(--sky)' }} />
                  <span className="pjs" style={{ fontSize:'1.2rem', fontWeight:800, color:'var(--ink)' }}>
                    {store?.name || 'صيدليتي'}
                  </span>
                </div>
            }
          </Link>

          <div className="nav-search-d" style={{ flex:1, maxWidth:350, position:'relative' }}>
            <form onSubmit={doSearch} style={{ position:'relative' }}>
              <input type="text" placeholder="ابحث عن منتج صحي..." value={sq} onChange={e => setSq(e.target.value)}
                className="inp" style={{ padding:'9px 40px 9px 14px', fontSize:'13px' }} />
              <Search size={14} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--dim)' }} />
            </form>
            {sq.length >= 2 && <SearchDrop />}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
            <div className="hidden lg:flex" style={{ alignItems:'center', gap:'24px' }}>
              {[{ h:'/', l:'الرئيسية' }, { h:'/contact', l:'اتصل بنا' }].map(i => (
                <Link key={i.h} href={i.h} style={{
                  fontSize:'13px', fontWeight:600, color:'var(--mid)', transition:'color 0.2s'
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--sky)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--mid)')}>
                  {i.l}
                </Link>
              ))}
            </div>

            <button onClick={() => setShowSearch(!showSearch)} className="lg:hidden"
              style={{ background:'none', border:'none', color:'var(--mid)', cursor:'pointer' }}>
              <Search size={20} />
            </button>

            {store?.cart === true && (
              <Link href="/cart" style={{ position:'relative', color:'var(--ink)', transition:'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--sky)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink)')}>
                <ShoppingCart size={22} />
                {count > 0 && (
                  <span style={{
                    position:'absolute', top:-6, right:-8, background:'var(--sky)', color:'white',
                    fontSize:'10px', fontWeight:700, width:'17px', height:'17px',
                    borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                    border:'2px solid var(--white)'
                  }}>{count}</span>
                )}
              </Link>
            )}

            <button onClick={() => setOpen(!open)} className="lg:hidden"
              style={{
                background:'var(--sky)', border:'none', color:'white', padding:'6px',
                borderRadius:'6px', cursor:'pointer'
              }}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {showSearch && (
        <div style={{ background:'var(--white)', borderBottom:'1px solid var(--sky)', padding:'12px 20px', position:'relative' }} className="fi">
          <form onSubmit={doSearch} style={{ position:'relative' }}>
            <input autoFocus type="text" placeholder="ابحث هنا..." value={sq} onChange={e => setSq(e.target.value)}
              className="inp" style={{ padding:'12px 40px 12px 14px' }} />
            <Search size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--sky)' }} />
          </form>
          {sq.length >= 2 && <SearchDrop />}
        </div>
      )}

      <div className="block lg:hidden" style={{
        maxHeight: open ? '300px' : '0', overflow:'hidden',
        transition:'all 0.4s ease', backgroundColor:'var(--white)',
        borderBottom: open ? '1px solid var(--sky)' : 'none'
      }}>
        <div style={{ padding:'15px 25px 25px' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            <Link href="/" onClick={() => setOpen(false)} style={{
              display:'flex', justifyContent:'space-between', padding:'12px 0',
              fontSize:'14px', fontWeight:600, color:'var(--ink)',
              borderBottom:'1px solid var(--line)'
            }}>
              الرئيسية <ArrowLeft size={14} style={{ color:'var(--sky)' }} />
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)} style={{
              display:'flex', justifyContent:'space-between', padding:'12px 0',
              fontSize:'14px', fontWeight:600, color:'var(--ink)',
              borderBottom:'1px solid var(--line)'
            }}>
              اتصل بنا <ArrowLeft size={14} style={{ color:'var(--sky)' }} />
            </Link>
            <button onClick={() => { router.push('/#products'); setOpen(false); }}
              className="btn-primary" style={{ marginTop:'12px', width:'100%' }}>
              <Stethoscope size={16} /> تسوق الآن
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function Footer({ store }: any) {
  return (
    <footer dir="rtl" style={{ backgroundColor:'var(--ink)', color:'var(--off)', fontFamily:"'Inter',sans-serif" }}>
      <div style={{
        background:'linear-gradient(90deg, var(--sky), var(--teal))',
        padding:'10px 0', textAlign:'center'
      }}>
        <p className="pjs" style={{ fontSize:'13px', fontWeight:700, color:'white', letterSpacing:'0.04em' }}>
          🩺 صحتك تهمنا — منتجات أصلية 100% مع توصيل سريع
        </p>
      </div>

      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'48px 20px 32px' }}>
        <div className="footer-g" style={{ paddingBottom:'36px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
              <HeartPulse size={22} style={{ color:'var(--sky)' }} />
              <span className="pjs" style={{ fontSize:'1.2rem', fontWeight:800, color:'white' }}>
                {store?.name || 'صيدليتي'}
              </span>
            </div>
            <p style={{ fontSize:'13px', lineHeight:'1.7', color:'var(--dim)', maxWidth:'240px' }}>
              {store?.hero?.subtitle?.substring(0, 80) || 'متجرك الموثوق للمعدات الطبية، منتجات الصحة والعناية. نوفر لك الأصالة والجودة.'}
            </p>
            <div style={{ marginTop:'14px', display:'flex', alignItems:'center', gap:'8px' }}>
              <Truck size={14} style={{ color:'var(--teal)' }} />
              <span style={{ fontSize:'12px', fontWeight:600, color:'var(--teal)' }}>توصيل سريع وآمن إلى جميع الولايات</span>
            </div>
            <p style={{ fontSize:'11px', color:'var(--dim)', marginTop:'24px', opacity:0.6 }}>
              &copy; {new Date().getFullYear()} {store?.name}. جميع الحقوق محفوظة.
            </p>
          </div>

          <div>
            <p className="pjs" style={{ fontSize:'12px', fontWeight:700, letterSpacing:'0.04em', color:'var(--sky)', marginBottom:'16px' }}>
              روابط سريعة
            </p>
            {[{ h:'/', l:'الرئيسية' }, { h:'/cart', l:'سلة التسوق' }, { h:'/contact', l:'اتصل بنا' }, { h:'/Privacy', l:'سياسة الخصوصية' }, { h:'/Terms', l:'شروط الاستخدام' }].map(lnk => (
              <a key={lnk.h} href={lnk.h} style={{
                display:'block', fontSize:'13px', color:'var(--dim)',
                marginBottom:'8px', transition:'color 0.2s'
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--sky)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--dim)'; }}>
                {lnk.l}
              </a>
            ))}
          </div>

          <div>
            <p className="pjs" style={{ fontSize:'12px', fontWeight:700, letterSpacing:'0.04em', color:'var(--sky)', marginBottom:'16px' }}>
              معلومات الاتصال
            </p>
            {[
              { icon:'📞', val: store?.contact?.phone },
              { icon:'📍', val: store?.contact?.wilaya },
              { icon:'✉️', val: store?.contact?.email },
            ].filter(r => r.val).map((r, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'9px' }}>
                <span style={{ fontSize:'13px' }}>{r.icon}</span>
                <span style={{ fontSize:'13px', color:'var(--dim)' }}>{r.val}</span>
              </div>
            ))}
            <div style={{ marginTop:'14px', padding:'12px 14px', border:'1px solid rgba(14,165,233,0.3)', background:'rgba(14,165,233,0.06)', borderRadius:'8px' }}>
              <p className="pjs" style={{ fontSize:'0.95rem', color:'var(--sky)', marginBottom:2 }}>فريق طبي متخصص</p>
              <p style={{ fontSize:'11px', color:'var(--dim)' }}>نرد خلال 24 ساعة</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  return (
    <div className="p-card" dir="rtl">
      <div style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden', backgroundColor:'var(--off)' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <HeartPulse size={40} style={{ color:'var(--dim)' }} />
            </div>
        }
        {discount > 0 && (
          <span className="pjs" style={{
            position:'absolute', top:10, right:10, background:'var(--rose)', color:'white',
            fontSize:'11px', fontWeight:700, padding:'2px 10px', borderRadius:'6px'
          }}>-{discount}%</span>
        )}
      </div>
      <div style={{ padding:'14px', flex:1, display:'flex', flexDirection:'column', gap:'6px' }}>
        <h3 style={{
          fontSize:'14px', fontWeight:600, color:'var(--ink)', lineHeight:1.3,
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'
        }}>
          {product.name}
        </h3>
        <div style={{ display:'flex', gap:'1px' }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} style={{ width:'11px', height:'11px', fill:i<4?'var(--amber)':'none', color:'var(--amber)' }} />
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'baseline', gap:'6px', marginTop:'auto' }}>
          <span className="pjs" style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--sky)' }}>{price.toLocaleString()}</span>
          <span style={{ fontSize:'11px', color:'var(--dim)' }}>دج</span>
          {orig > price && (
            <span style={{ fontSize:'11px', color:'var(--dim)', textDecoration:'line-through' }}>{orig.toLocaleString()}</span>
          )}
        </div>
        <Link href={`/product/${product.slug || product.id}`} className="btn-primary"
          style={{ width:'100%', fontSize:'12px', padding:'9px 14px', marginTop:'6px' }}>
          {viewDetails || 'عرض التفاصيل'}
        </Link>
      </div>
    </div>
  );
}

export function Home({ store, page }: any) {
  const products: any[] = store.products || [];
  const cats: any[] = store.categories || [];
  if (!page) page = 1;
  const countPage = Math.ceil((store.count || products.length) / 48);

  return (
    <div dir="rtl">
      <section style={{
        position:'relative', overflow:'hidden', background:'linear-gradient(135deg, var(--sky-lt) 0%, var(--off) 50%, white 100%)',
        minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:30, paddingBottom:25
      }}>
        {store.hero?.imageUrl && (
          <img src={store.hero.imageUrl} alt="" style={{
            position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', opacity:0.08, zIndex:1
          }} />
        )}
        <div style={{
          position:'absolute', inset:0, zIndex:2, pointerEvents:'none',
          background:'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(255,255,255,0.8) 100%)'
        }} />
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:'3px',
          background:'linear-gradient(90deg, transparent, var(--sky), var(--teal), transparent)', zIndex:3
        }} />

        <div style={{
          position:'relative', zIndex:4, padding:'0 5vw', width:'100%',
          maxWidth:'1100px', margin:'0 auto', textAlign:'center',
          display:'flex', flexDirection:'column', alignItems:'center'
        }} className="fi">
          <div style={{
            display:'inline-flex', alignItems:'center', gap:'6px',
            border:'1px solid var(--sky)', padding:'4px 14px', borderRadius:'20px',
            marginBottom:'16px', backgroundColor:'rgba(14,165,233,0.08)'
          }}>
            <Activity size={12} style={{ color:'var(--sky)' }} />
            <span className="pjs" style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.04em', color:'var(--sky)' }}>
              متجر الصحة والطب #1 في الجزائر
            </span>
          </div>

          <h1 className="pjs" style={{
            fontSize:'clamp(2.5rem, 7vw, 5rem)', lineHeight:1.05,
            color:'var(--ink)', marginBottom:'14px'
          }}
            dangerouslySetInnerHTML={{
              __html: store.hero?.title?.replace(/<[^>]+>/g, '').replace('الصحة', '<span style="color:var(--sky)">الصحة</span>')
                || 'صحتك <span style="color:var(--sky)">أولاً</span><br/>نحن هنا لمساعدتك'
            }}>
          </h1>

          <p style={{
            fontSize:'clamp(14px, 1.6vw, 16px)', lineHeight:'1.7',
            color:'var(--mid)', maxWidth:'540px', marginBottom:'28px'
          }}>
            {store.hero?.subtitle || 'المعدات الطبية، أجهزة التطبيب عن بعد، ومنتجات الصحة الرقمية. جودة موثوقة، توصيل سريع.'}
          </p>

          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', justifyContent:'center', marginBottom:'36px' }}>
            <a href="#products" className="btn-primary" style={{ fontSize:'14px', padding:'12px 34px' }}>
              <Stethoscope size={16} /> تسوق الآن
            </a>
            {cats.length > 0 && (
              <a href="#categories" className="btn-outline" style={{ fontSize:'14px', padding:'12px 34px' }}>
                الأقسام <ChevronDown size={14} />
              </a>
            )}
          </div>

          <div style={{
            display:'flex', gap:'32px', paddingTop:'22px',
            borderTop:'1px solid var(--line)', flexWrap:'wrap',
            justifyContent:'center', width:'100%', maxWidth:'700px'
          }} className="fi">
            {[
              { v:`${products.length}+`, l:'منتج صحي', c:'var(--sky)' },
              { v:'48h', l:'توصيل سريع', c:'var(--teal)' },
              { v:'100%', l:'منتجات أصلية', c:'var(--green)' },
              { v:'موثوق', l:'فريق طبي', c:'var(--sky)' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign:'center' }}>
                <p className="pjs" style={{ fontSize:'clamp(1.8rem, 4vw, 2.4rem)', color:s.c, lineHeight:1, margin:0 }}>
                  {s.v}
                </p>
                <p className="pjs" style={{ fontSize:'11px', fontWeight:600, letterSpacing:'0.04em', color:'var(--dim)', margin:'4px 0 0' }}>
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ background:'var(--white)', borderBottom:'1px solid var(--line)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div className="trust-row">
            {[
              { icon:<Truck size={20} />, color:'var(--sky)', title:'توصيل سريع', desc:'48 ساعة عبر الجزائر' },
              { icon:<Shield size={20} />, color:'var(--green)', title:'منتجات أصلية', desc:'مضمونة 100%' },
              { icon:<HeartPulse size={20} />, color:'var(--sky)', title:'استشارة طبية', desc:'فريق متخصص' },
              { icon:<Ambulance size={20} />, color:'var(--teal)', title:'توصيل طارئ', desc:'للحالات العاجلة' },
            ].map((item, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:'12px',
                padding:'16px 20px',
                borderRight:i>0?'1px solid var(--line)':'none'
              }}>
                <div style={{ color:item.color, flexShrink:0 }}>{item.icon}</div>
                <div style={{ textAlign:'right' }}>
                  <p className="pjs" style={{ fontSize:'13px', fontWeight:700, color:item.color, margin:0 }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize:'11px', color:'var(--dim)', margin:0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {cats.length > 0 && (
        <section id="categories" style={{ padding:'64px 0', background:'var(--off)' }}>
          <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 20px' }}>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'32px' }}>
              <div>
                <p className="pjs" style={{ fontSize:'13px', fontWeight:700, color:'var(--sky)', marginBottom:'8px', letterSpacing:'0.08em' }}>
                  الأقسام الطبية
                </p>
                <h2 className="pjs" style={{ fontSize:'clamp(1.8rem, 4vw, 3rem)', color:'var(--ink)', lineHeight:1.1 }}>
                  تسوق حسب <span style={{ color:'var(--sky)' }}>التخصص</span>
                </h2>
              </div>
            </div>
            <div className="cat-grid">
              {cats.slice(0, 4).map((cat: any) => (
                <Link key={cat.id} href={`?category=${cat.id}`}
                  className="cat-card" style={{ aspectRatio:'4/3' }}>
                  {cat.imageUrl
                    ? <img src={cat.imageUrl} alt={cat.name} />
                    : <div style={{
                        width:'100%', height:'100%', display:'flex', alignItems:'center',
                        justifyContent:'center', fontSize:'3rem',
                        background:'linear-gradient(135deg, var(--sky-lt), var(--white))'
                      }}>💊🩺🏥🧬</div>
                  }
                  <div style={{
                    position:'absolute', inset:0,
                    background:'linear-gradient(to top, rgba(15,23,42,0.8) 0%, transparent 50%)',
                    display:'flex', alignItems:'flex-end', padding:'14px'
                  }}>
                    <div>
                      <p className="pjs" style={{ fontSize:'16px', fontWeight:700, color:'white', margin:0 }}>
                        {cat.name}
                      </p>
                      <div style={{ height:'2px', width:'24px', background:'var(--sky)', marginTop:'6px' }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="products" style={{ padding:'32px 0 72px', background:'var(--off)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 20px' }}>
          <div style={{
            display:'flex', alignItems:'flex-end', justifyContent:'space-between',
            marginBottom:'28px', paddingBottom:'16px', borderBottom:'1px solid var(--line)'
          }}>
            <div>
              <p className="pjs" style={{ fontSize:'13px', fontWeight:700, color:'var(--sky)', marginBottom:'8px', letterSpacing:'0.08em' }}>
                المنتجات
              </p>
              <h2 className="pjs" style={{ fontSize:'clamp(1.8rem, 4vw, 3rem)', color:'var(--ink)', lineHeight:1.1 }}>
                جميع <span style={{ color:'var(--sky)' }}>المستلزمات</span>
              </h2>
            </div>
            <p className="pjs" style={{ fontSize:'13px', fontWeight:600, color:'var(--dim)' }}>{products.length} منتج</p>
          </div>

          {products.length === 0 ? (
            <div style={{ padding:'80px 0', textAlign:'center', border:'1px dashed var(--line)', borderRadius:'12px' }}>
              <HeartPulse size={48} style={{ color:'var(--dim)', margin:'0 auto 16px', opacity:0.4, display:'block' }} />
              <p className="pjs" style={{ fontSize:'1.8rem', color:'var(--dim)' }}>قريباً</p>
            </div>
          ) : (
            <div className="prod-grid">
              {products.map((p: any) => {
                const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
                const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
                return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="عرض التفاصيل" />;
              })}
            </div>
          )}

          {countPage > 1 && (
            <div className="pagination" dir="rtl">
              <Link href={{ query:{ page:Math.max(1, page-1) } }} scroll={false}
                style={{ width:40, height:40, border:'1px solid var(--line)', borderRadius:'8px', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--dim)', opacity:page<=1?0.3:1 }}>❮</Link>
              {Array.from({ length:countPage }).map((_, i) => {
                const pn = i + 1; const isA = Number(page) === pn;
                return (
                  <Link key={pn} href={{ query:{ page:pn } }} scroll={false}
                    style={{ width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:'14px', borderRadius:'8px', border:`1px solid ${isA?'var(--sky)':'var(--line)'}`, background:isA?'var(--sky)':'transparent', color:isA?'white':'var(--dim)' }}>
                    {pn}
                  </Link>
                );
              })}
              <Link href={{ query:{ page:Math.min(countPage, Number(page)+1) } }} scroll={false}
                style={{ width:40, height:40, border:'1px solid var(--line)', borderRadius:'8px', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--dim)', opacity:page>=countPage?0.3:1 }}>❯</Link>
            </div>
          )}
        </div>
      </section>

      <section style={{ padding:'64px 20px', background:'white' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'40px' }}>
            <p className="pjs" style={{ fontSize:'13px', fontWeight:700, color:'var(--sky)', marginBottom:'8px', letterSpacing:'0.08em' }}>
              لماذا نحن
            </p>
            <h2 className="pjs" style={{ fontSize:'clamp(1.8rem, 4vw, 2.8rem)', color:'var(--ink)' }}>
              {" "}<span style={{ color:'var(--sky)' }}>صحتك</span> هي أولويتنا
            </h2>
          </div>
          <div className="why-grid">
            {[
              { icon:<Shield size={28} />, title:'منتجات أصلية', desc:'نستورد من أشهر الماركات الطبية العالمية' },
              { icon:<Truck size={28} />, title:'توصيل سريع', desc:'نوصل لجميع الولايات في 48 ساعة' },
              { icon:<HeartPulse size={28} />, title:'دعم طبي', desc:'فريق من الصيادلة للاستشارات' },
              { icon:<Ambulance size={28} />, title:'خدمة طارئة', desc:'للحالات العاجلة نوصل فوراً' },
            ].map((item, i) => (
              <div key={i} className="why-card">
                <div style={{ color:'var(--sky)', marginBottom:'12px' }}>{item.icon}</div>
                <h3 className="pjs" style={{ fontSize:'15px', fontWeight:700, color:'var(--ink)', marginBottom:'6px' }}>{item.title}</h3>
                <p style={{ fontSize:'13px', color:'var(--mid)', lineHeight:'1.6', margin:0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{
        position:'relative', overflow:'hidden', padding:'72px 20px',
        background:'linear-gradient(135deg, var(--sky-lt) 0%, white 100%)'
      }}>
        <div style={{ position:'relative', zIndex:2, maxWidth:'640px', margin:'0 auto', textAlign:'center' }}>
          <HeartPulse size={48} style={{ color:'var(--sky)', margin:'0 auto 16px', display:'block' }} />
          <h2 className="pjs" style={{ fontSize:'clamp(2rem, 5vw, 3.8rem)', color:'var(--ink)', lineHeight:1.05, marginBottom:'14px' }}>
            اشترك في <span style={{ color:'var(--sky)' }}>نشرتنا</span> الطبية
          </h2>
          <p style={{ fontSize:'15px', color:'var(--mid)', lineHeight:'1.7', marginBottom:'28px' }}>
            احصل على أحدث النصائح الصحية والعروض الحصرية مباشرة على بريدك الإلكتروني.
          </p>
          <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
            <a href="#products" className="btn-primary" style={{ fontSize:'15px', padding:'14px 36px' }}>
              <Stethoscope size={16} /> تسوق الآن
            </a>
            <Link href="/contact" className="btn-outline" style={{ fontSize:'15px', padding:'14px 36px' }}>
              استشارة طبية <ArrowLeft size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
  const [sel, setSel] = useState(0);
  if (!product) return null;
  return (
    <div dir="rtl" style={{ background:'var(--off)' }}>
      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'32px 20px' }}>
        <div className="details-g">
          <div>
            <div style={{
              position:'relative', overflow:'hidden',
              background:'var(--white)', border:'1px solid var(--line)',
              borderRadius:'12px', marginBottom:'10px'
            }}>
              <div style={{ aspectRatio:'1/1' }}>
                {allImages.length > 0
                  ? <img src={allImages[sel]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <HeartPulse size={64} style={{ color:'var(--dim)', opacity:0.3 }} />
                    </div>
                }
              </div>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:'linear-gradient(90deg, var(--sky), var(--teal))' }} />
              {discount > 0 && (
                <span className="pjs" style={{ position:'absolute', top:14, right:14, background:'var(--rose)', color:'white', fontSize:'12px', fontWeight:700, padding:'4px 14px', borderRadius:'6px' }}>
                  -{discount}%
                </span>
              )}
              {!inStock && !autoGen && (
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.85)', backdropFilter:'blur(4px)' }}>
                  <span className="pjs" style={{ fontSize:'1.8rem', color:'var(--red)' }}>غير متوفر</span>
                </div>
              )}
              {allImages.length > 1 && (
                <>
                  <button onClick={() => setSel(p => p===0?allImages.length-1:p-1)} style={{
                    position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                    width:'34px', height:'34px', border:'1px solid var(--line)', borderRadius:'50%',
                    background:'rgba(255,255,255,0.9)', cursor:'pointer', display:'flex',
                    alignItems:'center', justifyContent:'center', color:'var(--sky)'
                  }}><ChevronRight size={14} /></button>
                  <button onClick={() => setSel(p => p===allImages.length-1?0:p+1)} style={{
                    position:'absolute', left:10, top:'50%', transform:'translateY(-50%)',
                    width:'34px', height:'34px', border:'1px solid var(--line)', borderRadius:'50%',
                    background:'rgba(255,255,255,0.9)', cursor:'pointer', display:'flex',
                    alignItems:'center', justifyContent:'center', color:'var(--sky)'
                  }}><ChevronLeft size={14} /></button>
                </>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="thumb-row">
                {allImages.slice(0,5).map((img:string, idx:number) => (
                  <button key={idx} onClick={() => setSel(idx)} style={{
                    width:'54px', height:'54px', overflow:'hidden', borderRadius:'8px',
                    border:`2px solid ${sel===idx?'var(--sky)':'var(--line)'}`,
                    cursor:'pointer', padding:0, background:'none', opacity:sel===idx?1:0.6
                  }}>
                    <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="pjs" style={{ fontSize:'13px', fontWeight:700, color:'var(--sky)', marginBottom:'10px', letterSpacing:'0.08em' }}>تفاصيل المنتج</p>
            <h1 className="pjs" style={{ fontSize:'clamp(1.5rem, 3.5vw, 2.5rem)', color:'var(--ink)', lineHeight:1.05, marginBottom:'14px' }}>{product.name}</h1>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px', paddingBottom:'20px', borderBottom:'1px solid var(--line)', flexWrap:'wrap' }}>
              <div style={{ display:'flex', gap:'2px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} style={{ width:'13px', height:'13px', fill:i<4?'var(--amber)':'none', color:'var(--amber)' }} />
                ))}
              </div>
              <span style={{
                marginRight:'auto', padding:'4px 14px', borderRadius:'6px',
                background:inStock||autoGen?'rgba(22,163,74,0.1)':'rgba(220,38,38,0.1)',
                color:inStock||autoGen?'var(--green)':'var(--red)',
                fontSize:'11px', fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif",
                border:`1px solid ${inStock||autoGen?'rgba(22,163,74,0.3)':'rgba(220,38,38,0.3)'}`
              }}>
                {autoGen?'متوفر':inStock?'متوفر':'غير متوفر'}
              </span>
            </div>

            <div style={{
              padding:'16px', background:'var(--sky-lt)', border:'1px solid rgba(14,165,233,0.2)',
              borderRadius:'10px', marginBottom:'22px'
            }}>
              <p className="pjs" style={{ fontSize:'11px', fontWeight:700, color:'var(--sky)', marginBottom:'5px', letterSpacing:'0.08em' }}>السعر</p>
              <div style={{ display:'flex', alignItems:'baseline', gap:'10px', flexWrap:'wrap' }}>
                <span className="pjs" style={{ fontSize:'2.8rem', fontWeight:800, color:'var(--sky)', lineHeight:1 }}>
                  {finalPrice.toLocaleString()}
                </span>
                <span className="pjs" style={{ fontSize:'13px', color:'var(--dim)', fontWeight:600 }}>دج</span>
                {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                  <span style={{ fontSize:'14px', textDecoration:'line-through', color:'var(--dim)' }}>
                    {parseFloat(product.priceOriginal).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {product.offers?.length > 0 && (
              <div style={{ marginBottom:'22px', paddingBottom:'22px', borderBottom:'1px solid var(--line)' }}>
                <p className="pjs" style={{ fontSize:'11px', fontWeight:700, color:'var(--sky)', marginBottom:'10px', letterSpacing:'0.08em' }}>العروض</p>
                {product.offers.map((o: any) => (
                  <label key={o.id} style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'12px 14px', border:`1.5px solid ${selectedOffer===o.id?'var(--sky)':'var(--line)'}`,
                    borderRadius:'8px', cursor:'pointer', marginBottom:'8px',
                    background:selectedOffer===o.id?'var(--sky-lt)':'transparent',
                    transition:'all 0.2s'
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                      <div style={{
                        width:'16px', height:'16px', borderRadius:'50%',
                        border:`2px solid ${selectedOffer===o.id?'var(--sky)':'var(--dim)'}`,
                        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
                      }}>
                        {selectedOffer===o.id && <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'var(--sky)' }} />}
                      </div>
                      <input type="radio" name="offer" checked={selectedOffer===o.id} onChange={() => setSelectedOffer(o.id)} style={{ display:'none' }} />
                      <div>
                        <p style={{ fontSize:'14px', fontWeight:600, color:'var(--ink)', margin:0 }}>{o.name}</p>
                        <p style={{ fontSize:'11px', color:'var(--dim)', margin:0 }}>الكمية: {o.quantity}</p>
                      </div>
                    </div>
                    <span className="pjs" style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--sky)' }}>
                      {o.price.toLocaleString()} <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:400, fontSize:'11px', color:'var(--dim)' }}>دج</span>
                    </span>
                  </label>
                ))}
              </div>
            )}

            {allAttrs.map((attr: any) => (
              <div key={attr.id} style={{ marginBottom:'18px', paddingBottom:'18px', borderBottom:'1px solid var(--line)' }}>
                <p className="pjs" style={{ fontSize:'11px', fontWeight:700, color:'var(--sky)', marginBottom:'10px', letterSpacing:'0.08em' }}>{attr.name}</p>
                {attr.displayMode === 'color' ? (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                    {attr.variants.map((v: any) => (
                      <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} title={v.name}
                        style={{ width:'28px', height:'28px', borderRadius:'8px', backgroundColor:v.value, border:'none', cursor:'pointer', outline:`3px solid ${selectedVariants[attr.name]===v.value?'var(--sky)':'transparent'}`, outlineOffset:'3px' }} />
                    ))}
                  </div>
                ) : attr.displayMode === 'image' ? (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                    {attr.variants.map((v: any) => (
                      <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ width:'52px', height:'52px', overflow:'hidden', borderRadius:'8px', border:`2px solid ${selectedVariants[attr.name]===v.value?'var(--sky)':'var(--line)'}`, cursor:'pointer', padding:0 }}>
                        <img src={v.value} alt={v.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                    {attr.variants.map((v: any) => {
                      const s = selectedVariants[attr.name] === v.value;
                      return (
                        <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)}
                          className="pjs" style={{
                            padding:'8px 16px', borderRadius:'6px',
                            border:`1.5px solid ${s?'var(--sky)':'var(--line)'}`,
                            background:s?'var(--sky)':'transparent',
                            color:s?'white':'var(--mid)', fontSize:'13px', fontWeight:700,
                            cursor:'pointer', transition:'all 0.2s'
                          }}>
                          {v.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />

            {product.desc && (
              <div style={{ marginTop:'28px', paddingTop:'22px', borderTop:'1px solid var(--line)' }}>
                <p className="pjs" style={{ fontSize:'11px', fontWeight:700, color:'var(--sky)', marginBottom:'12px', letterSpacing:'0.08em' }}>معلومات المنتج</p>
                <div style={{ fontSize:'14px', lineHeight:'1.85', color:'var(--mid)' }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS:['p','br','strong','em','ul','ol','li','h1','h2','h3','span'], ALLOWED_ATTR:['class','style'] })
                  }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss=0 }: ProductFormProps) {
  const router = useRouter();
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [fd, setFd] = useState({ customerId:'', customerName:'', customerPhone:'', customerWelaya:'', customerCommune:'', quantity:1, priceLoss:0, typeLivraison:'home' as 'home'|'office' });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [sub, setSub] = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const initCount = useCartStore(s => s.initCount);

  useEffect(()=>{ if(userId) fetchWilayas(userId).then(setWilayas); },[userId]);
  useEffect(()=>{ if(typeof window!=='undefined'){const id=localStorage.getItem('customerId');if(id) setFd(p=>({...p,customerId:id}));} },[]);
  useEffect(()=>{ if(!fd.customerWelaya){setCommunes([]);return;} setLC(true); fetchCommunes(fd.customerWelaya).then(d=>{setCommunes(d);setLC(false);}); },[fd.customerWelaya]);

  const selW = useMemo(()=>wilayas.find(w=>String(w.id)===String(fd.customerWelaya)),[wilayas,fd.customerWelaya]);

  const getFP = useCallback(():number=>{
    const base=typeof product.price==='string'?parseFloat(product.price):product.price as number;
    const off=product.offers?.find((o:any)=>o.id===selectedOffer); if(off) return off.price;
    if(product.variantDetails?.length&&Object.keys(selectedVariants).length>0){
      const m=product.variantDetails.find((v:any)=>vm(v,selectedVariants));
      if(m&&m.price!==-1) return m.price;
    }
    return base;
  },[product,selectedOffer,selectedVariants]);

  const getLiv = useCallback(():number=>{ if(!selW) return 0; return fd.typeLivraison==='home'?selW.livraisonHome:selW.livraisonOfice; },[selW,fd.typeLivraison]);

  const fp = getFP();
  const total = ()=> fp*fd.quantity + getLiv();

  const validate = ()=>{
    const e:Record<string,string>={};
    if(!fd.customerName.trim()) e.customerName='الاسم مطلوب';
    if(!fd.customerPhone.trim()) e.customerPhone='رقم الهاتف مطلوب';
    if(!fd.customerWelaya) e.customerWelaya='الولاية مطلوبة';
    if(!fd.customerCommune) e.customerCommune='البلدية مطلوبة';
    return e;
  };

  const getVarId = useCallback(()=>{
    if(!product.variantDetails?.length||!Object.keys(selectedVariants).length) return undefined;
    return product.variantDetails.find((v:any)=>vm(v,selectedVariants))?.id;
  },[product.variantDetails,selectedVariants]);

  const addToCart = ()=>{
    setIsAdded(true);
    const cart=JSON.parse(localStorage.getItem(domain)||'[]');
    cart.push({...fd,product,variantDetailId:getVarId(),productId:product.id,storeId:product.store.id,userId,selectedOffer,selectedVariants,platform:platform||'store',finalPrice:fp,totalPrice:total(),priceLivraison:getLiv(),addedAt:Date.now()});
    localStorage.setItem(domain,JSON.stringify(cart));
    initCount(cart.length);
    setTimeout(()=>setIsAdded(false),2000);
  };

  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault();
    const er=validate(); if(Object.keys(er).length){setErrors(er);return;}
    setErrors({}); setSub(true);
    try{
      await axios.post(`${API_URL}/orders/create`,{...fd,productId:product.id,storeId:product.store.id,userId,selectedOffer,variantDetailId:getVarId(),platform:platform||'store',finalPrice:fp,totalPrice:total(),priceLivraison:getLiv()});
      if(fd.customerId) localStorage.setItem('customerId',fd.customerId);
      router.push(`/${domain}/successfully`);
    }catch{}finally{setSub(false);}
  };

  return (
    <div dir="rtl" style={{ marginTop:'22px', paddingTop:'20px', borderTop:'1px solid var(--line)' }}>
      {product.store?.cart && (
        <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
          <button onClick={addToCart} disabled={isAdded} className="pjs" style={{
            flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7,
            padding:'12px', borderRadius:'8px', cursor:isAdded?'default':'pointer',
            fontWeight:700, fontSize:'13px', textTransform:'uppercase',
            border:`1.5px solid ${isAdded?'var(--green)':'var(--line)'}`,
            background:isAdded?'rgba(22,163,74,0.1)':'transparent',
            color:isAdded?'var(--green)':'var(--mid)', transition:'all 0.25s', fontFamily:'inherit'
          }}>
            {isAdded?<><CheckCircle2 size={14} className="anim-check"/>أُضيف للسلة</>:<><ShoppingCart size={14}/>أضف للسلة</>}
          </button>
          <button onClick={()=>setIsOrderNow(true)} className="btn-primary" style={{ flex:1, padding:'12px' }}>
            <Zap size={14}/> اطلب الآن
          </button>
        </div>
      )}

      {(isOrderNow || !product.store?.cart) && (
        <div>
          {product.store?.cart && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
              <p className="pjs" style={{ fontSize:'11px', fontWeight:700, color:'var(--sky)', margin:0, letterSpacing:'0.08em' }}>بيانات التوصيل</p>
              <button onClick={()=>setIsOrderNow(false)} className="pjs" style={{
                display:'flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:'6px',
                border:'1px solid var(--line)', background:'transparent', color:'var(--dim)',
                fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:'inherit'
              }}>
                <X size={11}/> إلغاء
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-2c">
              <FR error={errors.customerName} label="الاسم الكامل">
                <input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} placeholder="اسمك الكامل" style={INP_S(!!errors.customerName)}/>
              </FR>
              <FR error={errors.customerPhone} label="رقم الهاتف">
                <input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} placeholder="05 XX XX XX XX" style={INP_S(!!errors.customerPhone)}/>
              </FR>
            </div>
            <div className="form-2c">
              <FR error={errors.customerWelaya} label="الولاية">
                <div style={{ position:'relative' }}>
                  <ChevronDown style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
                  <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})} className="inp" style={{ paddingLeft:'32px' }}>
                    <option value="">اختر الولاية</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.customerCommune} label="البلدية">
                <div style={{ position:'relative' }}>
                  <ChevronDown style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya||loadingC} onChange={e=>setFd({...fd,customerCommune:e.target.value})} className="inp" style={{ paddingLeft:'32px', opacity:!fd.customerWelaya?0.4:1 }}>
                    <option value="">{loadingC?'جاري التحميل...':'اختر البلدية'}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            <FR label="نوع التوصيل">
              <div className="dlv-2c">
                {(['home','office'] as const).map(type=>(
                  <button key={type} type="button" onClick={()=>setFd(p=>({...p,typeLivraison:type}))} style={{
                    padding:'12px 10px', borderRadius:'8px',
                    border:`1.5px solid ${fd.typeLivraison===type?'var(--sky)':'var(--line)'}`,
                    backgroundColor:fd.typeLivraison===type?'var(--sky-lt)':'transparent',
                    cursor:'pointer', textAlign:'right', transition:'all 0.2s', fontFamily:'inherit'
                  }}>
                    <p className="pjs" style={{
                      fontSize:'12px', fontWeight:700,
                      color:fd.typeLivraison===type?'var(--sky)':'var(--dim)',
                      margin:'0 0 4px', letterSpacing:'0.04em'
                    }}>{type==='home'?'إلى المنزل':'إلى المكتب'}</p>
                    {selW && <p className="pjs" style={{
                      fontSize:'1rem',
                      color:fd.typeLivraison===type?'var(--sky)':'var(--dim)',
                      margin:0
                    }}>{(type==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()} <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:400, fontSize:'11px', color:'var(--dim)' }}>دج</span></p>}
                  </button>
                ))}
              </div>
            </FR>

            <FR label="الكمية">
              <div style={{ display:'inline-flex', alignItems:'center', border:'1.5px solid var(--line)', borderRadius:'8px', overflow:'hidden', background:'var(--white)' }}>
                <button type="button" onClick={()=>setFd(p=>({...p,quantity:Math.max(1,p.quantity-1)}))} style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderRight:'1px solid var(--line)', background:'transparent', cursor:'pointer', color:'var(--sky)', fontSize:'18px', fontWeight:700 }}>-</button>
                <span className="pjs" style={{ width:'44px', textAlign:'center', fontSize:'1.2rem', color:'var(--ink)' }}>{fd.quantity}</span>
                <button type="button" onClick={()=>setFd(p=>({...p,quantity:p.quantity+1}))} style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderLeft:'1px solid var(--line)', background:'transparent', cursor:'pointer', color:'var(--sky)', fontSize:'18px', fontWeight:700 }}>+</button>
              </div>
            </FR>

            <div style={{ border:'1px solid var(--line)', borderRadius:'10px', marginBottom:'14px', overflow:'hidden', background:'var(--white)' }}>
              <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', gap:'8px', background:'var(--sky-lt)' }}>
                <Package size={13} style={{ color:'var(--sky)' }}/>
                <span className="pjs" style={{ fontSize:'11px', fontWeight:700, color:'var(--sky)', letterSpacing:'0.08em' }}>ملخص الطلب</span>
              </div>
              {[{l:'المنتج',v:product.name.slice(0,22)+(product.name.length>22?'...':'')},{l:'السعر',v:`${fp.toLocaleString()} دج`},{l:'الكمية',v:`× ${fd.quantity}`},{l:'التوصيل',v:selW?`${getLiv().toLocaleString()} دج`:'—'}].map(row=>(
                <div key={row.l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 14px', borderBottom:'1px solid var(--line)' }}>
                  <span className="pjs" style={{ fontSize:'12px', color:'var(--dim)', letterSpacing:'0.04em' }}>{row.l}</span>
                  <span style={{ fontSize:'13px', fontWeight:600, color:'var(--mid)' }}>{row.v}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'12px 14px' }}>
                <span className="pjs" style={{ fontSize:'12px', fontWeight:700, color:'var(--dim)' }}>المجموع</span>
                <span className="pjs" style={{ fontSize:'1.8rem', fontWeight:800, color:'var(--sky)' }}>{total().toLocaleString()} <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:400, fontSize:'12px', color:'var(--dim)' }}>دج</span></span>
              </div>
            </div>

            <button type="submit" disabled={sub} className="btn-primary" style={{ width:'100%', fontSize:'15px', padding:'14px', cursor:sub?'not-allowed':'pointer', opacity:sub?0.7:1 }}>
              {sub?<><Loader2 style={{ width:'15px', height:'15px', animation:'spin 1s linear infinite' }}/> جاري المعالجة...</>:<><Zap size={15}/> تأكيد الطلب</>}
            </button>
            <div style={{ display:'flex', justifyContent:'center', gap:'16px', marginTop:'10px' }}>
              {[{icon:<Lock size={11}/>,label:'آمن'},{icon:<Truck size={11}/>,label:'توصيل سريع'},{icon:<Shield size={11}/>,label:'أصلي'}].map((b,i)=>(
                <div key={i} className="pjs" style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'var(--dim)', fontWeight:600 }}>
                  <span style={{ color:'var(--sky)' }}>{b.icon}</span> {b.label}
                </div>
              ))}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function Cart({ domain, store }: { domain: string; store: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fd, setFd] = useState({ customerName:'', customerPhone:'', customerWelaya:'', customerCommune:'', typeLivraison:'home' as 'home'|'office' });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const initCount = useCartStore(s => s.initCount);

  useEffect(()=>{ setItems(JSON.parse(localStorage.getItem(domain)||'[]')); if(store?.user?.id) fetchWilayas(store.user.id).then(setWilayas); },[domain,store]);
  useEffect(()=>{ if(!fd.customerWelaya){setCommunes([]);return;} setLC(true); fetchCommunes(fd.customerWelaya).then(d=>{setCommunes(d);setLC(false);}); },[fd.customerWelaya]);

  const selW = useMemo(()=>wilayas.find(w=>String(w.id)===String(fd.customerWelaya)),[wilayas,fd.customerWelaya]);
  const getLiv = ()=>{ if(!selW) return 0; return fd.typeLivraison==='home'?selW.livraisonHome:selW.livraisonOfice; };
  const cartTotal = items.reduce((a,i)=>a+(i.finalPrice*i.quantity),0);
  const finalTotal = cartTotal + getLiv();
  const update = (n:any[])=>{ setItems(n); localStorage.setItem(domain,JSON.stringify(n)); initCount(n.length); };
  const changeQty = (i:number,d:number)=>{ const n=[...items]; n[i].quantity=Math.max(1,n[i].quantity+d); update(n); };

  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault();
    const er:Record<string,string>={};
    if(!fd.customerName.trim()) er.name='مطلوب';
    if(!fd.customerPhone.trim()) er.phone='مطلوب';
    if(!fd.customerWelaya) er.w='مطلوب';
    if(!fd.customerCommune) er.c='مطلوب';
    if(Object.keys(er).length){setErrors(er);return;}
    setErrors({}); setSubmitting(true);
    try{
      await axios.post(`${API_URL}/orders/create`,items.map(i=>({...fd,productId:i.productId,storeId:i.storeId,userId:i.userId,selectedOffer:i.selectedOffer,variantDetailId:i.variantDetailId,selectedVariants:i.selectedVariants,platform:i.platform||'store',finalPrice:i.finalPrice,totalPrice:finalTotal,priceLivraison:getLiv(),quantity:i.quantity,customerId:i.customerId||'',priceLoss:selW?.livraisonReturn??0})));
      setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
    }catch{}finally{setSubmitting(false);}
  };

  if(success) return (
    <div dir="rtl" style={{ minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', background:'var(--off)' }}>
      <div style={{ textAlign:'center', background:'var(--white)', padding:'4rem 2.5rem', borderRadius:'12px', border:'1px solid var(--sky)', maxWidth:460, width:'100%', boxShadow:'0 8px 30px rgba(14,165,233,0.08)' }}>
        <CheckCircle2 size={48} style={{ color:'var(--green)', display:'block', margin:'0 auto 1.25rem' }}/>
        <h2 className="pjs" style={{ fontSize:'2.5rem', color:'var(--ink)', marginBottom:'0.625rem' }}>تم استلام طلبك!</h2>
        <p style={{ color:'var(--mid)', marginBottom:'2rem', lineHeight:1.7 }}>شكراً لثقتك. سنتواصل معك قريباً.</p>
        <Link href="/" className="btn-primary" style={{ display:'inline-flex', padding:'13px 28px' }}>العودة للمتجر</Link>
      </div>
    </div>
  );

  if(!items.length) return (
    <div dir="rtl" style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', background:'var(--off)' }}>
      <div style={{ textAlign:'center', padding:'4rem 2rem', borderRadius:'12px', border:'1px dashed var(--line)', maxWidth:400, width:'100%' }}>
        <HeartPulse size={48} style={{ color:'var(--dim)', display:'block', margin:'0 auto 1.25rem', opacity:0.4 }}/>
        <p className="pjs" style={{ fontSize:'2rem', color:'var(--dim)', marginBottom:'1.75rem' }}>السلة فارغة</p>
        <Link href="/" className="btn-primary" style={{ display:'inline-flex', padding:'13px 28px' }}>تسوق الآن</Link>
      </div>
    </div>
  );

  return (
    <div dir="rtl" style={{ minHeight:'100vh', background:'var(--off)', padding:'2.5rem 1.5rem 5rem' }}>
      <div style={{ maxWidth:1280, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:'2rem', paddingBottom:'1rem', borderBottom:'2px solid var(--sky)' }}>
          <h1 className="pjs" style={{ fontSize:'clamp(2rem, 5vw, 3rem)', color:'var(--ink)' }}>سلة التسوق</h1>
          <p className="pjs" style={{ fontSize:'13px', color:'var(--dim)', fontWeight:600 }}>{items.length} منتج</p>
        </div>
        <div className="cart-layout">
          <div style={{ background:'var(--white)', border:'1px solid var(--line)', borderRadius:'12px', overflow:'hidden', alignSelf:'start' }}>
            {items.map((item,i)=>(
              <div key={i} style={{ display:'flex', gap:'1rem', padding:'14px', borderBottom:'1px solid var(--line)' }}>
                <div style={{ width:80, height:80, flexShrink:0, overflow:'hidden', borderRadius:'8px', border:'1px solid var(--line)', background:'var(--off)' }}>
                  <img src={item.product?.imagesProduct?.[0]?.imageUrl||item.product?.productImage} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} alt=""/>
                </div>
                <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                  <div>
                    <h4 style={{ fontWeight:600, color:'var(--ink)', fontSize:'13px', marginBottom:'4px' }}>{item.product?.name}</h4>
                    <p className="pjs" style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--sky)' }}>{item.finalPrice?.toLocaleString()} دج</p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'8px' }}>
                    <div style={{ display:'inline-flex', alignItems:'center', border:'1px solid var(--line)', borderRadius:'6px', overflow:'hidden' }}>
                      <button onClick={()=>changeQty(i,-1)} style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--off)', border:'none', cursor:'pointer', color:'var(--sky)', fontSize:'1.1rem', fontWeight:700 }}>-</button>
                      <span className="pjs" style={{ width:32, textAlign:'center', fontSize:'1rem', color:'var(--ink)', lineHeight:'28px' }}>{item.quantity}</span>
                      <button onClick={()=>changeQty(i,1)} style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--off)', border:'none', cursor:'pointer', color:'var(--sky)', fontSize:'1.1rem', fontWeight:700 }}>+</button>
                    </div>
                    <button onClick={()=>update(items.filter((_,idx)=>idx!==i))} className="pjs" style={{
                      display:'flex', alignItems:'center', gap:4, padding:'4px 8px', border:'none',
                      background:'transparent', color:'var(--dim)', fontSize:'11px', fontWeight:700,
                      cursor:'pointer', transition:'color 0.15s', fontFamily:'inherit'
                    }}
                      onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.color='var(--red)';}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.color='var(--dim)';}}>
                      <Trash2 size={12}/> حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', padding:'14px', background:'var(--slate)' }}>
              <span className="pjs" style={{ fontWeight:700, fontSize:'13px', color:'var(--dim)' }}>المجموع الفرعي</span>
              <span className="pjs" style={{ fontSize:'1.5rem', fontWeight:700, color:'var(--ink)' }}>{cartTotal.toLocaleString()} دج</span>
            </div>
          </div>

          <div style={{ background:'var(--white)', border:'1px solid var(--line)', borderRadius:'12px', padding:'22px', alignSelf:'start' }}>
            <p className="pjs" style={{ fontSize:'11px', fontWeight:700, color:'var(--sky)', marginBottom:'16px', letterSpacing:'0.08em' }}>معلومات التوصيل</p>
            <form onSubmit={handleSubmit}>
              <div className="form-2c">
                <FR error={errors.name} label="الاسم"><input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} className="inp"/></FR>
                <FR error={errors.phone} label="الهاتف"><input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} className="inp"/></FR>
              </div>
              <div className="form-2c">
                <FR error={errors.w} label="الولاية">
                  <div style={{ position:'relative' }}>
                    <ChevronDown style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
                    <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})} className="inp" style={{ paddingLeft:'32px' }}>
                      <option value="">اختر</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                    </select>
                  </div>
                </FR>
                <FR error={errors.c} label="البلدية">
                  <div style={{ position:'relative' }}>
                    <ChevronDown style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
                    <select value={fd.customerCommune} disabled={loadingC||!fd.customerWelaya} onChange={e=>setFd({...fd,customerCommune:e.target.value})} className="inp" style={{ paddingLeft:'32px', opacity:!fd.customerWelaya?0.4:1 }}>
                      <option value="">{loadingC?'...':'اختر'}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
                    </select>
                  </div>
                </FR>
              </div>

              <div style={{ marginBottom:'14px' }}>
                <p className="pjs" style={{ fontSize:'11px', fontWeight:700, color:'var(--sky)', marginBottom:'10px', letterSpacing:'0.08em' }}>نوع التوصيل</p>
                <div className="dlv-2c">
                  {(['home','office'] as const).map(t=>(
                    <button key={t} type="button" onClick={()=>setFd(p=>({...p,typeLivraison:t}))} style={{
                      padding:'14px', borderRadius:'8px',
                      border:`1px solid ${fd.typeLivraison===t?'var(--sky)':'var(--line)'}`,
                      borderTop:`2px solid ${fd.typeLivraison===t?'var(--sky)':'var(--line)'}`,
                      background:fd.typeLivraison===t?'var(--sky-lt)':'var(--white)',
                      textAlign:'center', cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s'
                    }}>
                      <span style={{ display:'block', fontSize:'1.5rem', marginBottom:'4px' }}>{t==='home'?'🏠':'🏢'}</span>
                      <p className="pjs" style={{ fontSize:'12px', fontWeight:700, color:fd.typeLivraison===t?'var(--ink)':'var(--dim)' }}>{t==='home'?'للبيت':'للمكتب'}</p>
                      {selW && <p className="pjs" style={{ fontSize:'1rem', color:'var(--sky)', marginTop:'3px' }}>{(t==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()} دج</p>}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ border:'1px solid var(--line)', borderRadius:'10px', marginBottom:'14px', overflow:'hidden', background:'var(--slate)' }}>
                {[{l:'المجموع الفرعي',v:`${cartTotal.toLocaleString()} دج`},{l:'التوصيل',v:getLiv()?`${getLiv().toLocaleString()} دج`:'—'}].map(row=>(
                  <div key={row.l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 14px', borderBottom:'1px solid var(--line)' }}>
                    <span className="pjs" style={{ fontSize:'12px', color:'var(--dim)' }}>{row.l}</span>
                    <span style={{ fontSize:'13px', fontWeight:600, color:'var(--mid)' }}>{row.v}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'12px 14px' }}>
                  <span className="pjs" style={{ fontSize:'12px', fontWeight:700, color:'var(--dim)' }}>الإجمالي</span>
                  <span className="pjs" style={{ fontSize:'1.8rem', fontWeight:800, color:'var(--sky)' }}>{finalTotal.toLocaleString()} <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:400, fontSize:'12px', color:'var(--dim)' }}>دج</span></span>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn-primary" style={{ width:'100%', fontSize:'15px', padding:'14px', cursor:submitting?'not-allowed':'pointer', opacity:submitting?0.7:1 }}>
                {submitting?<><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> جاري...</>:<><Zap size={15}/> تأكيد الطلب</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StaticPage({ staticPage, page, store }: any) {
  const p = (staticPage || page || '').toLowerCase();
  return (
    <>
      {p==='privacy' && <Privacy/>}
      {p==='terms' && <Terms/>}
      {p==='cookies' && <Cookies/>}
      {p==='contact' && <Contact store={store}/>}
    </>
  );
}

const Shell = ({ children, title, sub }: { children: React.ReactNode; title: string; sub?: string }) => (
  <div dir="rtl" style={{ background:'var(--off)', minHeight:'100vh' }}>
    <div style={{
      background:'linear-gradient(135deg, var(--sky-lt), white)', padding:'56px 20px 40px',
      borderBottom:'1px solid var(--sky)', position:'relative', overflow:'hidden'
    }}>
      <div style={{ maxWidth:'720px', margin:'0 auto', position:'relative', zIndex:2, textAlign:'right' }}>
        {sub && <p className="pjs" style={{ fontSize:'13px', fontWeight:700, color:'var(--sky)', marginBottom:'10px', letterSpacing:'0.08em' }}>{sub}</p>}
        <h1 className="pjs" style={{ fontSize:'clamp(2.2rem, 5vw, 4rem)', color:'var(--ink)', lineHeight:1.05 }}>
          {title}
        </h1>
      </div>
    </div>
    <div style={{ maxWidth:'720px', margin:'0 auto', padding:'36px 20px 80px' }}>
      <div style={{ background:'var(--white)', border:'1px solid var(--line)', borderRadius:'12px', padding:'28px', textAlign:'right' }}>
        {children}
      </div>
    </div>
  </div>
);

const IB = ({ title, body, tag }: { title: string; body: string; tag?: string }) => (
  <div style={{ paddingBottom:'18px', marginBottom:'18px', borderBottom:'1px solid var(--line)', display:'flex', justifyContent:'space-between', gap:'16px', alignItems:'flex-start' }}>
    <div style={{ flex:1, textAlign:'right' }}>
      <h3 className="pjs" style={{ fontSize:'14px', fontWeight:700, color:'var(--ink)', margin:'0 0 7px' }}>
        {title}
      </h3>
      <p style={{ fontSize:'13px', lineHeight:'1.8', color:'var(--mid)', margin:0 }}>{body}</p>
    </div>
    {tag && <span className="pjs" style={{ fontSize:'10px', fontWeight:700, padding:'4px 10px', borderRadius:'6px', border:'1px solid var(--sky)', color:'var(--sky)', flexShrink:0 }}>{tag}</span>}
  </div>
);

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية" sub="الشؤون القانونية">
      <IB title="البيانات التي نجمعها" body="فقط اسمك ورقم هاتفك وعنوان التوصيل — الحد الأدنى المطلوب لمعالجة طلبك."/>
      <IB title="كيف نستخدمها" body="حصرياً لتنفيذ وشحن طلبك. لا نستخدمها للتسويق أو بيع البيانات."/>
      <IB title="الأمان" body="بياناتك محمية بتشفير عالي المستوى ومؤمنة في جميع الأوقات."/>
      <IB title="مشاركة البيانات" body="لا نبيع بياناتك أبداً. تُشارك فقط مع شركاء التوصيل الموثوقين." tag="مضمون"/>
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="شروط الخدمة" sub="الشؤون القانونية">
      <IB title="الطلبات" body="لا توجد رسوم خفية. السعر المعروض هو السعر النهائي."/>
      <IB title="المنتجات الأصيلة" body="نبيع المنتجات الأصيلة فقط؛ السلع المقلدة ممنوعة منعاً باتاً." tag="صارم"/>
      <IB title="القانون المعمول به" body="تخضع هذه الشروط لقوانين الجمهورية الجزائرية الديمقراطية الشعبية."/>
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="سياسة ملفات الارتباط" sub="الشؤون القانونية">
      <IB title="ملفات الارتباط الأساسية" body="مطلوبة للجلسات والسلة وإتمام الشراء. لا يمكن تعطيلها." tag="مطلوب"/>
      <IB title="ملفات ارتباط التحليلات" body="بيانات مجمعة لتحسين المنصة. لا تتضمن بيانات شخصية." tag="اختياري"/>
      <div style={{ marginTop:'16px', padding:'14px', borderRadius:'8px', border:'1px solid var(--sky)', display:'flex', gap:'10px', alignItems:'flex-start', background:'var(--sky-lt)' }}>
        <ToggleRight size={17} style={{ color:'var(--sky)', flexShrink:0, marginTop:'1px' }}/>
        <p style={{ fontSize:'13px', color:'var(--mid)', lineHeight:'1.75', margin:0, textAlign:'right' }}>
          يمكنك إدارة أو حذف ملفات الارتباط من إعدادات المتصفح الخاص بك في أي وقت.
        </p>
      </div>
    </Shell>
  );
}

export function Contact({ store }: { store?: any }) {
  const [form, setForm] = useState({ name:'', email:'', phone:'', message:'' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault(); setLoading(true);
    try { await axios.post(`${API_URL}/user/contact-user/message`,{...form,storeId:store?.id}); setSent(true); }
    catch { alert('حدث خطأ'); } finally { setLoading(false); }
  };

  return (
    <div dir="rtl" style={{ background:'var(--off)', minHeight:'100vh' }}>
      <div style={{
        background:'linear-gradient(135deg, var(--sky-lt), white)', padding:'56px 20px 40px',
        borderBottom:'1px solid var(--sky)', position:'relative', overflow:'hidden'
      }}>
        <div style={{ maxWidth:'960px', margin:'0 auto', position:'relative', zIndex:2, textAlign:'right' }}>
          <p className="pjs" style={{ fontSize:'13px', fontWeight:700, color:'var(--sky)', marginBottom:'10px', letterSpacing:'0.08em' }}>تواصل معنا</p>
          <h1 className="pjs" style={{ fontSize:'clamp(2.2rem, 5vw, 4rem)', color:'var(--ink)', lineHeight:1.05, marginBottom:'8px' }}>
            تواصل <span style={{ color:'var(--sky)' }}>معنا</span>
          </h1>
          <p style={{ fontSize:'14px', color:'var(--mid)' }}>فريقنا الطبي يجيب خلال 24 ساعة</p>
        </div>
      </div>

      <div className="contact-g" style={{ maxWidth:'960px', margin:'0 auto', padding:'36px 20px 80px' }}>
        <div>
          <div style={{ background:'var(--white)', border:'1px solid var(--line)', borderRadius:'12px', padding:'22px', marginBottom:'12px', textAlign:'right' }}>
            <p className="pjs" style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.08em', color:'var(--sky)', marginBottom:'16px' }}>معلومات الاتصال</p>
            {[
              { icon:'📞', label:'الهاتف', val:store?.contact?.phone },
              { icon:'📍', label:'الموقع', val:store?.contact?.wilaya },
              { icon:'✉️', label:'البريد', val:store?.contact?.email },
            ].filter(r=>r.val).map((item,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'11px 0', borderBottom:'1px solid var(--line)' }}>
                <div style={{ width:'34px', height:'34px', borderRadius:'8px', background:'var(--sky-lt)', border:'1px solid rgba(14,165,233,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>{item.icon}</div>
                <div style={{ textAlign:'right' }}>
                  <p className="pjs" style={{ fontSize:'10px', fontWeight:700, color:'var(--sky)', margin:'0 0 1px', letterSpacing:'0.08em' }}>{item.label}</p>
                  <p style={{ fontSize:'13px', fontWeight:600, color:'var(--ink)', margin:0 }}>{item.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:'linear-gradient(135deg, var(--sky), var(--sky-2))', padding:'18px 20px', borderRadius:'12px', position:'relative', overflow:'hidden', textAlign:'right' }}>
            <p className="pjs" style={{ fontSize:'1.4rem', fontWeight:800, color:'white', margin:'0 0 4px' }}>صحتك أولاً.</p>
            <p className="pjs" style={{ fontSize:'1.8rem', fontWeight:800, color:'rgba(255,255,255,0.8)', margin:0, lineHeight:1 }}>نحن هنا لمساعدتك.</p>
          </div>
        </div>

        <div style={{ background:'var(--white)', border:'1px solid var(--line)', borderRadius:'12px', padding:'24px', textAlign:'right' }}>
          <p className="pjs" style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.08em', color:'var(--sky)', marginBottom:'18px' }}>أرسل رسالة</p>
          {sent ? (
            <div style={{ minHeight:'200px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderRadius:'8px', border:'1px solid var(--sky)', textAlign:'center', background:'var(--sky-lt)', padding:'28px' }}>
              <CheckCircle2 size={32} style={{ color:'var(--green)', marginBottom:'12px' }}/>
              <h3 className="pjs" style={{ fontSize:'1.5rem', color:'var(--ink)', margin:'0 0 6px' }}>تم إرسال الرسالة!</h3>
              <p style={{ fontSize:'13px', color:'var(--mid)' }}>سنرد عليك خلال 24 ساعة.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div className="form-2c">
                <div>
                  <p className="pjs" style={{ fontSize:'11px', fontWeight:700, color:'var(--mid)', marginBottom:'5px' }}>الاسم</p>
                  <input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required className="inp"/>
                </div>
                <div>
                  <p className="pjs" style={{ fontSize:'11px', fontWeight:700, color:'var(--mid)', marginBottom:'5px' }}>الهاتف</p>
                  <input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required className="inp"/>
                </div>
              </div>
              <div>
                <p className="pjs" style={{ fontSize:'11px', fontWeight:700, color:'var(--mid)', marginBottom:'5px' }}>البريد الإلكتروني</p>
                <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required className="inp"/>
              </div>
              <div>
                <p className="pjs" style={{ fontSize:'11px', fontWeight:700, color:'var(--mid)', marginBottom:'5px' }}>رسالتك</p>
                <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="كيف يمكننا مساعدتك؟" rows={4} required className="inp" style={{ resize:'none' }}/>
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent:'center', width:'100%', fontSize:'14px', padding:'13px', opacity:loading?0.7:1, cursor:loading?'not-allowed':'pointer' }}>
                {loading?<><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> جاري...</>:<>إرسال الرسالة <ArrowLeft size={14}/></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
