"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import axios from "axios";
import DOMPurify from "dompurify";
import { useCartStore } from "@/store/useCartStore";

/* ─────────────────────────── Types ─────────────────────────── */

interface Offer { id: string; name: string; quantity: number; price: number; }
interface Variant { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: "color" | "image" | "text" | null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: "color" | "image" | "text"; value: string; }
interface VariantDetail { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }
interface Category { id: string; name: string; }

interface Product {
  id: string; name: string; price: string | number; priceOriginal?: string | number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[]; offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean; slug?: string;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; };
}

interface Store {
  id: string; name: string; subdomain: string; userId: string; currency: string; cart?: boolean;
  hero?: { title?: string; subtitle?: string; imageUrl?: string; };
  topBar?: { enabled?: boolean; text?: string; };
  design?: { logoUrl?: string; };
  contact?: { phone?: string; email?: string; wilaya?: string; address?: string; };
  categories?: Category[];
  products?: Product[];
  count?: number;
}

interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>; platform?: string; priceLoss?: number;
}

/* ─────────────────────────── Helpers ─────────────────────────── */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";

function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some((e) => e.attrName === n && e.value === v));
}

const fetchWilayas = async (uid: string): Promise<Wilaya[]> => {
  try {
    const res = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`);
    return res.data?.data || res.data || [];
  } catch { return []; }
};

const fetchCommunes = async (wid: string): Promise<Commune[]> => {
  try {
    const res = await axios.get(`${API_URL}/shipping/get-communes/${wid}`);
    return res.data?.data || res.data || [];
  } catch { return []; }
};

/* ─────────────────────────── Main ─────────────────────────── */

export default function Main({ store, children, domain }: { store: Store; children: React.ReactNode; domain: string }) {
  const pathname = usePathname();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div dir="ltr" className="pcb-wrapper">
      <Navbar store={store} domain={domain} />
      <main className="pcb-main">{children}</main>
      <Footer store={store} />
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        
        :root {
          --pcb-cream: #faf8f5;
          --pcb-linen: #f5f0eb;
          --pcb-sand: #e8e0d5;
          --pcb-taupe: #b8a99a;
          --pcb-coffee: #6b5b4f;
          --pcb-espresso: #3d3229;
          --pcb-rose: #c9a89a;
          --pcb-sage: #a8b5a0;
          --pcb-white: #ffffff;
          --pcb-radius: 16px;
          --pcb-radius-sm: 8px;
          --pcb-shadow: 0 4px 24px rgba(61,50,41,0.08);
          --pcb-shadow-hover: 0 8px 32px rgba(61,50,41,0.12);
          --font-display: 'Playfair Display', Georgia, serif;
          --font-body: 'Inter', -apple-system, sans-serif;
        }
        
        * { box-sizing: border-box; }
        body { margin: 0; font-family: var(--font-body); background: var(--pcb-cream); color: var(--pcb-espresso); }
        
        .pcb-wrapper { min-height: 100vh; display: flex; flex-direction: column; }
        .pcb-main { flex: 1; }
        
        a { text-decoration: none; color: inherit; }
        button { border: none; background: none; cursor: pointer; font-family: inherit; }
        img { max-width: 100%; display: block; }
      `}</style>
    </div>
  );
}

/* ─────────────────────────── Navbar ─────────────────────────── */

export function Navbar({ store, domain }: { store: Store; domain: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [listSearch, setListSearch] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const count = useCartStore((s) => s.count);
  const initCount = useCartStore((s) => s.initCount);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(domain);
      const items = raw ? JSON.parse(raw) : [];
      initCount(Array.isArray(items) ? items.length : 0);
    } catch { initCount(0); }
  }, [domain, initCount]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (searchQuery.length >= 2) {
      setLoading(true);
      searchTimer.current = setTimeout(async () => {
        try {
          const res = await axios.get(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(searchQuery)}`);
          setListSearch(res.data?.products || res.data || []);
        } catch { setListSearch([]); }
        setLoading(false);
      }, 380);
    } else {
      setListSearch([]); }
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery, domain]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery("");
      setListSearch([]);
    }
  };

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/contact", label: "Contact" },
  ].filter((l) => l.href !== "/cart" || store?.cart !== false);

  return (
    <>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div className="pcb-topbar">{store.topBar.text}</div>
      )}
      <nav className={`pcb-navbar ${scrolled ? "pcb-navbar-scrolled" : ""}`}>
        <div className="pcb-nav-inner">
          <Link href="/" className="pcb-logo">
            {!imgError && store?.design?.logoUrl ? (
              <img src={store.design.logoUrl} alt={store.name} onError={() => setImgError(true)} />
            ) : (
              <span className="pcb-logo-text">{store?.name || "Pure Cotton"}</span>
            )}
          </Link>

          <div className="pcb-nav-links">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="pcb-nav-link">{l.label}</Link>
            ))}
          </div>

          <div className="pcb-nav-actions">
            <div className="pcb-search-wrap">
              <button className="pcb-icon-btn" onClick={() => setShowSearch((s) => !s)} aria-label="Rechercher">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </button>
              {showSearch && (
                <div className="pcb-search-dropdown">
                  <form onSubmit={handleSearchSubmit} className="pcb-search-form">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher des produits..."
                      autoFocus
                      className="pcb-search-input"
                    />
                    <button type="submit" className="pcb-search-submit">Rechercher</button>
                  </form>
                  {loading && <div className="pcb-search-loading">Chargement...</div>}
                  {listSearch.length > 0 && (
                    <div className="pcb-search-results">
                      {listSearch.slice(0, 5).map((p) => (
                        <Link key={p.id} href={`/product/${p.slug || p.id}`} className="pcb-search-item" onClick={() => { setShowSearch(false); setSearchQuery(""); setListSearch([]); }}>
                          <span className="pcb-search-item-name">{p.name}</span>
                          <span className="pcb-search-item-price">{p.price} {store?.currency}</span>
                        </Link>
                      ))}
                      <Link href={`/?search=${encodeURIComponent(searchQuery)}`} className="pcb-search-all" onClick={() => setShowSearch(false)}>
                        Voir tous les résultats →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {store?.cart !== false && (
              <Link href="/cart" className="pcb-cart-btn" aria-label="Panier">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                {count > 0 && <span className="pcb-cart-badge">{count}</span>}
              </Link>
            )}

            <button className="pcb-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {open ? <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></> : <><path d="M4 12h16"/><path d="M4 18h16"/><path d="M4 6h16"/></>}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div className="pcb-mobile-menu">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="pcb-mobile-link" onClick={() => setOpen(false)}>{l.label}</Link>
            ))}
          </div>
        )}
      </nav>

      <style jsx>{`\n        .pcb-topbar { background: var(--pcb-espresso); color: var(--pcb-linen); text-align: center; padding: 8px 16px; font-size: 12px; letter-spacing: 0.5px; font-family: var(--font-body); }\n        .pcb-navbar { position: sticky; top: 0; z-index: 100; background: rgba(250,248,245,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid transparent; transition: border-color 0.3s, box-shadow 0.3s; }\n        .pcb-navbar-scrolled { border-bottom-color: var(--pcb-sand); box-shadow: 0 2px 16px rgba(61,50,41,0.06); }\n        .pcb-nav-inner { max-width: 1280px; margin: 0 auto; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }\n        .pcb-logo { display: flex; align-items: center; gap: 10px; }\n        .pcb-logo img { height: 36px; width: auto; border-radius: var(--pcb-radius-sm); }\n        .pcb-logo-text { font-family: var(--font-display); font-size: 22px; font-weight: 600; color: var(--pcb-espresso); letter-spacing: -0.5px; }\n        .pcb-nav-links { display: flex; align-items: center; gap: 28px; }\n        .pcb-nav-link { font-family: var(--font-body); font-size: 14px; font-weight: 500; color: var(--pcb-coffee); position: relative; padding: 4px 0; transition: color 0.25s; }\n        .pcb-nav-link:hover { color: var(--pcb-espresso); }\n        .pcb-nav-link::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 1.5px; background: var(--pcb-rose); transition: width 0.3s ease; }\n        .pcb-nav-link:hover::after { width: 100%; }\n        .pcb-nav-actions { display: flex; align-items: center; gap: 14px; }\n        .pcb-icon-btn, .pcb-cart-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: var(--pcb-coffee); transition: background 0.2s, color 0.2s; position: relative; }\n        .pcb-icon-btn:hover, .pcb-cart-btn:hover { background: var(--pcb-linen); color: var(--pcb-espresso); }\n        .pcb-cart-badge { position: absolute; top: 2px; right: 2px; background: var(--pcb-rose); color: white; font-size: 10px; font-weight: 600; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }\n        .pcb-search-wrap { position: relative; }\n        .pcb-search-dropdown { position: absolute; top: calc(100% + 12px); right: 0; width: 340px; background: var(--pcb-white); border-radius: var(--pcb-radius); box-shadow: var(--pcb-shadow-hover); padding: 16px; border: 1px solid var(--pcb-sand); }\n        .pcb-search-form { display: flex; gap: 8px; }\n        .pcb-search-input { flex: 1; padding: 10px 14px; border: 1.5px solid var(--pcb-sand); border-radius: var(--pcb-radius-sm); font-size: 14px; font-family: var(--font-body); background: var(--pcb-cream); outline: none; transition: border-color 0.2s; }\n        .pcb-search-input:focus { border-color: var(--pcb-taupe); }\n        .pcb-search-submit { padding: 10px 16px; background: var(--pcb-espresso); color: var(--pcb-white); border-radius: var(--pcb-radius-sm); font-size: 13px; font-weight: 500; transition: opacity 0.2s; }\n        .pcb-search-submit:hover { opacity: 0.85; }\n        .pcb-search-loading { padding: 12px 0; font-size: 13px; color: var(--pcb-taupe); text-align: center; }\n        .pcb-search-results { margin-top: 12px; display: flex; flex-direction: column; gap: 4px; }\n        .pcb-search-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: var(--pcb-radius-sm); transition: background 0.15s; }\n        .pcb-search-item:hover { background: var(--pcb-linen); }\n        .pcb-search-item-name { font-size: 13px; font-weight: 500; color: var(--pcb-espresso); }\n        .pcb-search-item-price { font-size: 12px; color: var(--pcb-coffee); font-weight: 500; }\n        .pcb-search-all { display: block; text-align: center; padding: 10px; margin-top: 6px; font-size: 13px; font-weight: 500; color: var(--pcb-coffee); border-top: 1px solid var(--pcb-sand); transition: color 0.2s; }\n        .pcb-search-all:hover { color: var(--pcb-espresso); }\n        .pcb-burger { display: none; width: 40px; height: 40px; align-items: center; justify-content: center; border-radius: 50%; color: var(--pcb-coffee); }\n        .pcb-burger:hover { background: var(--pcb-linen); }\n        .pcb-mobile-menu { display: none; position: absolute; top: 100%; left: 0; right: 0; background: var(--pcb-white); border-bottom: 1px solid var(--pcb-sand); padding: 16px 24px; box-shadow: 0 8px 24px rgba(61,50,41,0.08); flex-direction: column; gap: 4px; }\n        .pcb-mobile-link { display: block; padding: 12px 0; font-size: 15px; font-weight: 500; color: var(--pcb-coffee); border-bottom: 1px solid var(--pcb-linen); transition: color 0.2s; }\n        .pcb-mobile-link:hover { color: var(--pcb-espresso); }\n        @media (max-width: 700px) {\n          .pcb-nav-links { display: none; }\n          .pcb-burger { display: flex; }\n          .pcb-mobile-menu { display: flex; }\n        }\n        @media (max-width: 480px) {\n          .pcb-search-dropdown { position: fixed; left: 12px; right: 12px; top: 72px; width: auto; }\n        }\n      `}</style>
    </>
  );
}

/* ─────────────────────────── Footer ─────────────────────────── */

export function Footer({ store }: { store: Store }) {
  const year = new Date().getFullYear();
  const pageLinks = [
    { href: "/", label: "Accueil" },
    { href: "/cart", label: "Panier" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Confidentialité" },
    { href: "/terms", label: "Conditions" },
  ].filter((l) => l.href !== "/cart" || store?.cart !== false);

  return (
    <footer className="pcb-footer">
      <div className="pcb-footer-inner">
        <div className="pcb-footer-brand">
          <h3 className="pcb-footer-name">{store?.name || "Pure Cotton"}</h3>
          <p className="pcb-footer-desc">{store?.hero?.subtitle || "Vêtements de base en coton pur, conçus pour le confort au quotidien."}</p>
          <p className="pcb-footer-copy">© {year} {store?.name}. Tous droits réservés.</p>
        </div>
        <div className="pcb-footer-links">
          <h4 className="pcb-footer-title">Pages</h4>
          <div className="pcb-footer-linklist">
            {pageLinks.map((l) => (
              <Link key={l.href} href={l.href} className="pcb-footer-link">{l.label}</Link>
            ))}
          </div>
        </div>
        <div className="pcb-footer-contact">
          <h4 className="pcb-footer-title">Contact</h4>
          <div className="pcb-footer-contactlist">
            {store?.contact?.phone && (
              <div className="pcb-contact-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>{store.contact.phone}</span>
              </div>
            )}
            {store?.contact?.email && (
              <div className="pcb-contact-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <span>{store.contact.email}</span>
              </div>
            )}
            {(store?.contact?.wilaya || store?.contact?.address) && (
              <div className="pcb-contact-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{[store.contact.wilaya, store.contact.address].filter(Boolean).join(", ")}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`\n        .pcb-footer { background: var(--pcb-linen); border-top: 1px solid var(--pcb-sand); padding: 64px 24px 48px; }\n        .pcb-footer-inner { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: 1.2fr 0.8fr 1fr; gap: 48px; }\n        .pcb-footer-name { font-family: var(--font-display); font-size: 24px; font-weight: 600; margin: 0 0 12px; color: var(--pcb-espresso); }\n        .pcb-footer-desc { font-size: 14px; line-height: 1.6; color: var(--pcb-coffee); margin: 0 0 20px; max-width: 280px; }\n        .pcb-footer-copy { font-size: 12px; color: var(--pcb-taupe); margin: 0; }\n        .pcb-footer-title { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px; color: var(--pcb-taupe); margin: 0 0 16px; }\n        .pcb-footer-linklist { display: flex; flex-direction: column; gap: 10px; }\n        .pcb-footer-link { font-size: 14px; color: var(--pcb-coffee); transition: color 0.2s, transform 0.2s; }\n        .pcb-footer-link:hover { color: var(--pcb-espresso); transform: translateX(3px); }\n        .pcb-footer-contactlist { display: flex; flex-direction: column; gap: 12px; }\n        .pcb-contact-row { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--pcb-coffee); }\n        .pcb-contact-row svg { color: var(--pcb-taupe); flex-shrink: 0; }\n        @media (max-width: 768px) {\n          .pcb-footer-inner { grid-template-columns: 1fr; gap: 36px; }\n        }\n      `}</style>
    </footer>
  );
}

/* ─────────────────────────── Card ─────────────────────────── */

export function Card({ product, displayImage, discount, store, viewDetails }: { product: Product; displayImage?: string; discount: number; store: Store; viewDetails?: () => void }) {
  const price = Number(product.price) || 0;
  const priceOriginal = product.priceOriginal ? Number(product.priceOriginal) : undefined;
  const img = displayImage || product.productImage || product.imagesProduct?.[0]?.imageUrl;

  return (
    <div className="pcb-card">
      <Link href={`/product/${product.slug || product.id}`} className="pcb-card-visual" onClick={viewDetails}>
        <div className="pcb-card-imgwrap">
          {img ? (
            <img src={img} alt={product.name} loading="lazy" className="pcb-card-img" />
          ) : (
            <div className="pcb-card-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            </div>
          )}
        </div>
        {discount > 0 && (
          <span className="pcb-card-badge">-{discount}%</span>
        )}
      </Link>
      <div className="pcb-card-body">
        <h3 className="pcb-card-name">{product.name}</h3>
        <div className="pcb-card-stars">
          {[1,2,3,4,5].map((s) => (
            <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= 4 ? "#c9a89a" : "none"} stroke="#c9a89a" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          ))}
        </div>
        <div className="pcb-card-price">
          <span className="pcb-card-current">{price} {store?.currency}</span>
          {priceOriginal && priceOriginal > price && (
            <span className="pcb-card-original">{priceOriginal} {store?.currency}</span>
          )}
        </div>
      </div>
      <style jsx>{`\n        .pcb-card { background: var(--pcb-white); border-radius: var(--pcb-radius); overflow: hidden; box-shadow: var(--pcb-shadow); transition: box-shadow 0.35s ease, transform 0.35s ease; }\n        .pcb-card:hover { box-shadow: var(--pcb-shadow-hover); transform: translateY(-4px); }\n        .pcb-card-visual { display: block; position: relative; }\n        .pcb-card-imgwrap { aspect-ratio: 3/4; overflow: hidden; background: var(--pcb-linen); display: flex; align-items: center; justify-content: center; }\n        .pcb-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }\n        .pcb-card:hover .pcb-card-img { transform: scale(1.04); }\n        .pcb-card-placeholder { color: var(--pcb-taupe); }\n        .pcb-card-badge { position: absolute; top: 12px; left: 12px; background: var(--pcb-rose); color: white; font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 20px; letter-spacing: 0.3px; }\n        .pcb-card-body { padding: 18px 16px 20px; }\n        .pcb-card-name { font-family: var(--font-body); font-size: 14px; font-weight: 500; color: var(--pcb-espresso); margin: 0 0 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 40px; }\n        .pcb-card-stars { display: flex; gap: 3px; margin-bottom: 10px; }\n        .pcb-card-price { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }\n        .pcb-card-current { font-family: var(--font-display); font-size: 16px; font-weight: 600; color: var(--pcb-espresso); }\n        .pcb-card-original { font-size: 13px; color: var(--pcb-taupe); text-decoration: line-through; }\n      `}</style>
    </div>
  );
}

/* ─────────────────────────── Home ─────────────────────────── */

export function Home({ store, page }: { store: Store; page?: number }) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const searchQuery = searchParams.get("search");
  const products = store?.products || [];
  const cats = store?.categories || [];
  const countPage = Math.ceil((store?.count || products.length) / 48);
  const currentPage = page || 1;

  const trustItems = [
    { icon: "truck", title: "Livraison rapide", desc: "Partout en Algérie" },
    { icon: "shield", title: "Coton 100% pur", desc: "Qualité certifiée" },
    { icon: "lock", title: "Paiement sécurisé", desc: "À la livraison" },
    { icon: "headphones", title: "Support client", desc: "7j/7 disponible" },
  ];

  return (
    <div className="pcb-home">
      {/* Hero */}
      <section className="pcb-hero">
        {store?.hero?.imageUrl && (
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <img src={store.hero.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(61,50,41,0.75) 0%, rgba(61,50,41,0.25) 50%, rgba(61,50,41,0.1) 100%)" }} />
          </div>
        )}
        <div className="pcb-hero-content">
          <h1 className="pcb-hero-title" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store?.hero?.title || "Le confort du coton pur") }} />
          <p className="pcb-hero-subtitle">{store?.hero?.subtitle || "Des vêtements de base doux, respirants et durables pour votre quotidien."}</p>
          <div className="pcb-hero-cta">
            <Link href="/?page=1" className="pcb-btn-primary">Découvrir la collection</Link>
            {store?.cart !== false && (
              <Link href="/cart" className="pcb-btn-ghost">Mon panier</Link>
            )}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="pcb-trust">
        <div className="pcb-trust-inner">
          {trustItems.map((t, i) => (
            <div key={i} className="pcb-trust-item">
              <div className="pcb-trust-icon">
                {t.icon === "truck" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>}
                {t.icon === "shield" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                {t.icon === "lock" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                {t.icon === "headphones" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>}
              </div>
              <div>
                <div className="pcb-trust-title">{t.title}</div>
                <div className="pcb-trust-desc">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="pcb-categories">
        <div className="pcb-section-inner">
          <h2 className="pcb-section-title">Catégories</h2>
          <div className="pcb-cat-list">
            <Link href="/" className={`pcb-cat-pill ${!activeCategory ? "pcb-cat-active" : ""}`}>
              Tout
            </Link>
            {cats.map((cat) => (
              <Link
                key={cat.id}
                href={`?category=${cat.id}`}
                className={`pcb-cat-pill ${activeCategory === String(cat.id) ? "pcb-cat-active" : ""}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="pcb-products">
        <div className="pcb-section-inner">
          {searchQuery && (
            <p className="pcb-search-info">Résultats pour « {searchQuery} »</p>
          )}
          {products.length === 0 ? (
            <div className="pcb-empty">Aucun produit trouvé.</div>
          ) : (
            <div className="pcb-products-grid">
              {products.map((product) => {
                const price = Number(product.price) || 0;
                const priceOriginal = product.priceOriginal ? Number(product.priceOriginal) : 0;
                const discount = priceOriginal > 0 ? Math.round(((priceOriginal - price) / priceOriginal) * 100) : 0;
                return (
                  <Card
                    key={product.id}
                    product={product}
                    discount={discount}
                    store={store}
                  />
                );
              })}
            </div>
          )}

          {countPage > 1 && !searchQuery && (
            <div className="pcb-pagination">
              {Array.from({ length: countPage }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={{ query: { page: p } }}
                  scroll={false}
                  className={`pcb-page-btn ${currentPage === p ? "pcb-page-active" : ""}`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="pcb-cta">
        <div className="pcb-cta-inner">
          <h2 className="pcb-cta-title">Le confort commence ici</h2>
          <p className="pcb-cta-desc">Des essentiels en coton pensés pour durer, conçus pour vous accompagner chaque jour.</p>
          <Link href="/" className="pcb-btn-primary">Explorer</Link>
        </div>
      </section>

      <style jsx>{`\n        .pcb-hero { position: relative; min-height: 85vh; display: flex; align-items: flex-end; overflow: hidden; }\n        .pcb-hero-content { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; padding: 120px 24px 80px; width: 100%; }\n        .pcb-hero-title { font-family: var(--font-display); font-size: clamp(36px, 5vw, 64px); font-weight: 600; color: var(--pcb-white); margin: 0 0 16px; line-height: 1.1; max-width: 600px; text-shadow: 0 2px 12px rgba(0,0,0,0.2); }\n        .pcb-hero-subtitle { font-size: 16px; color: rgba(255,255,255,0.85); margin: 0 0 28px; max-width: 480px; line-height: 1.6; }\n        .pcb-hero-cta { display: flex; gap: 14px; flex-wrap: wrap; }\n        .pcb-btn-primary { display: inline-flex; padding: 14px 28px; background: var(--pcb-white); color: var(--pcb-espresso); border-radius: 40px; font-size: 14px; font-weight: 600; transition: transform 0.25s, box-shadow 0.25s; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }\n        .pcb-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }\n        .pcb-btn-ghost { display: inline-flex; padding: 14px 28px; background: transparent; color: var(--pcb-white); border: 1.5px solid rgba(255,255,255,0.5); border-radius: 40px; font-size: 14px; font-weight: 600; transition: background 0.2s, border-color 0.2s; }\n        .pcb-btn-ghost:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.8); }\n        .pcb-trust { background: var(--pcb-white); border-bottom: 1px solid var(--pcb-sand); padding: 40px 24px; }\n        .pcb-trust-inner { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }\n        .pcb-trust-item { display: flex; align-items: center; gap: 14px; padding: 16px; }\n        .pcb-trust-icon { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--pcb-linen); color: var(--pcb-coffee); }\n        .pcb-trust-title { font-size: 13px; font-weight: 600; color: var(--pcb-espresso); margin-bottom: 2px; }\n        .pcb-trust-desc { font-size: 12px; color: var(--pcb-taupe); }\n        .pcb-section-inner { max-width: 1280px; margin: 0 auto; padding: 64px 24px; }\n        .pcb-section-title { font-family: var(--font-display); font-size: 28px; font-weight: 600; color: var(--pcb-espresso); margin: 0 0 28px; text-align: center; }\n        .pcb-categories { background: var(--pcb-cream); }\n        .pcb-cat-list { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }\n        .pcb-cat-pill { padding: 10px 20px; border-radius: 40px; font-size: 13px; font-weight: 500; color: var(--pcb-coffee); background: var(--pcb-white); border: 1px solid var(--pcb-sand); transition: all 0.25s; }\n        .pcb-cat-pill:hover { border-color: var(--pcb-taupe); color: var(--pcb-espresso); }\n        .pcb-cat-active { background: var(--pcb-espresso); color: var(--pcb-white); border-color: var(--pcb-espresso); }\n        .pcb-cat-active:hover { color: var(--pcb-white); }\n        .pcb-products { background: var(--pcb-cream); }\n        .pcb-search-info { text-align: center; font-size: 14px; color: var(--pcb-coffee); margin-bottom: 24px; }\n        .pcb-empty { text-align: center; padding: 80px 24px; font-size: 15px; color: var(--pcb-taupe); }\n        .pcb-products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 28px; }\n        .pcb-pagination { display: flex; justify-content: center; gap: 8px; margin-top: 48px; }\n        .pcb-page-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 13px; font-weight: 500; color: var(--pcb-coffee); background: var(--pcb-white); border: 1px solid var(--pcb-sand); transition: all 0.2s; }\n        .pcb-page-btn:hover { border-color: var(--pcb-taupe); color: var(--pcb-espresso); }\n        .pcb-page-active { background: var(--pcb-espresso); color: var(--pcb-white); border-color: var(--pcb-espresso); }\n        .pcb-cta { background: var(--pcb-linen); padding: 80px 24px; text-align: center; }\n        .pcb-cta-inner { max-width: 560px; margin: 0 auto; }\n        .pcb-cta-title { font-family: var(--font-display); font-size: 32px; font-weight: 600; color: var(--pcb-espresso); margin: 0 0 14px; }\n        .pcb-cta-desc { font-size: 15px; color: var(--pcb-coffee); margin: 0 0 28px; line-height: 1.6; }\n        @media (max-width: 768px) {\n          .pcb-trust-inner { grid-template-columns: repeat(2, 1fr); }\n          .pcb-products-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }\n          .pcb-section-inner { padding: 40px 16px; }\n        }\n        @media (max-width: 480px) {\n          .pcb-trust-inner { grid-template-columns: 1fr; }\n          .pcb-products-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }\n          .pcb-hero-content { padding: 80px 16px 48px; }\n        }\n      `}</style>
    </div>
  );
}

/* ─────────────────────────── Details ─────────────────────────── */

export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
  const [sel, setSel] = useState(0);
  const imgs = allImages || [];

  const nextImg = () => setSel((s) => (s + 1) % imgs.length);
  const prevImg = () => setSel((s) => (s - 1 + imgs.length) % imgs.length);

  return (
    <div className="pcb-details">
      <div className="pcb-details-inner">
        <div className="pcb-details-gallery">
          <div className="pcb-gallery-main">
            {imgs.length > 0 ? (
              <img src={imgs[sel]} alt={product.name} className="pcb-gallery-img" />
            ) : (
              <div className="pcb-gallery-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              </div>
            )}
            {imgs.length > 1 && (
              <>
                <button className="pcb-gallery-nav pcb-gallery-prev" onClick={prevImg} aria-label="Précédent">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button className="pcb-gallery-nav pcb-gallery-next" onClick={nextImg} aria-label="Suivant">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </>
            )}
          </div>
          {imgs.length > 1 && (
            <div className="pcb-gallery-thumbs">
              {imgs.map((img: string, i: number) => (
                <button key={i} onClick={() => setSel(i)} className={`pcb-gallery-thumb ${i === sel ? "pcb-thumb-active" : ""}`}>
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pcb-details-info">
          <h1 className="pcb-details-name">{product.name}</h1>
          <div className="pcb-details-stars">
            {[1,2,3,4,5].map((s) => (
              <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill={s <= 4 ? "#c9a89a" : "none"} stroke="#c9a89a" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ))}
          </div>
          <div className="pcb-details-price">{finalPrice} {product.store?.currency}</div>

          {product.offers && product.offers.length > 0 && (
            <div className="pcb-details-offers">
              <h4 className="pcb-details-label">Offres</h4>
              <div className="pcb-offers-list">
                {product.offers.map((offer: Offer) => (
                  <label key={offer.id} className={`pcb-offer-row ${selectedOffer === offer.id ? "pcb-offer-active" : ""}`}>
                    <input
                      type="radio"
                      name="offer"
                      checked={selectedOffer === offer.id}
                      onChange={() => setSelectedOffer(offer.id)}
                    />
                    <span className="pcb-offer-name">{offer.name}</span>
                    <span className="pcb-offer-price">{offer.price} {product.store?.currency}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {allAttrs && allAttrs.length > 0 && (
            <div className="pcb-details-attrs">
              {allAttrs.map((attr: Attribute) => (
                <div key={attr.id} className="pcb-attr-group">
                  <h4 className="pcb-details-label">{attr.name}</h4>
                  <div className="pcb-attr-options">
                    {attr.variants.map((v: Variant) => {
                      const isSelected = selectedVariants[attr.name] === v.value;
                      if (attr.displayMode === "color") {
                        return (
                          <button
                            key={v.id}
                            onClick={() => handleVariantSelection(attr.name, v.value)}
                            className={`pcb-attr-color ${isSelected ? "pcb-attr-sel" : ""}`}
                            title={v.value}
                            style={{ backgroundColor: v.value }}
                          />
                        );
                      }
                      if (attr.displayMode === "image") {
                        return (
                          <button
                            key={v.id}
                            onClick={() => handleVariantSelection(attr.name, v.value)}
                            className={`pcb-attr-imgbtn ${isSelected ? "pcb-attr-sel" : ""}`}
                          >
                            <img src={v.value} alt="" />
                          </button>
                        );
                      }
                      return (
                        <button
                          key={v.id}
                          onClick={() => handleVariantSelection(attr.name, v.value)}
                          className={`pcb-attr-text ${isSelected ? "pcb-attr-sel" : ""}`}
                        >
                          {v.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <ProductForm
            product={product}
            userId={product.store?.userId}
            domain={domain}
            selectedOffer={selectedOffer}
            setSelectedOffer={setSelectedOffer}
            selectedVariants={selectedVariants}
          />

          {product.desc && (
            <div className="pcb-details-desc">
              <h4 className="pcb-details-label">Description</h4>
              <div
                className="pcb-desc-body"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }}
              />
            </div>
          )}
        </div>
      </div>

      <style jsx>{`\n        .pcb-details { padding: 40px 24px; }\n        .pcb-details-inner { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }\n        .pcb-details-gallery { position: sticky; top: 100px; }\n        .pcb-gallery-main { position: relative; aspect-ratio: 3/4; border-radius: var(--pcb-radius); overflow: hidden; background: var(--pcb-linen); }\n        .pcb-gallery-img { width: 100%; height: 100%; object-fit: cover; }\n        .pcb-gallery-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--pcb-taupe); }\n        .pcb-gallery-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.9); display: flex; align-items: center; justify-content: center; color: var(--pcb-espresso); box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: background 0.2s; }\n        .pcb-gallery-nav:hover { background: white; }\n        .pcb-gallery-prev { left: 12px; }\n        .pcb-gallery-next { right: 12px; }\n        .pcb-gallery-thumbs { display: flex; gap: 10px; margin-top: 14px; }\n        .pcb-gallery-thumb { width: 64px; height: 64px; border-radius: var(--pcb-radius-sm); overflow: hidden; border: 2px solid transparent; padding: 0; transition: border-color 0.2s; cursor: pointer; }\n        .pcb-gallery-thumb img { width: 100%; height: 100%; object-fit: cover; }\n        .pcb-thumb-active { border-color: var(--pcb-espresso); }\n        .pcb-details-info { padding-top: 8px; }\n        .pcb-details-name { font-family: var(--font-display); font-size: 28px; font-weight: 600; color: var(--pcb-espresso); margin: 0 0 10px; line-height: 1.2; }\n        .pcb-details-stars { display: flex; gap: 3px; margin-bottom: 14px; }\n        .pcb-details-price { font-family: var(--font-display); font-size: 24px; font-weight: 600; color: var(--pcb-espresso); margin-bottom: 24px; }\n        .pcb-details-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--pcb-taupe); margin: 0 0 10px; }\n        .pcb-details-offers { margin-bottom: 24px; }\n        .pcb-offers-list { display: flex; flex-direction: column; gap: 8px; }\n        .pcb-offer-row { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border: 1.5px solid var(--pcb-sand); border-radius: var(--pcb-radius-sm); cursor: pointer; transition: border-color 0.2s, background 0.2s; }\n        .pcb-offer-row:hover { border-color: var(--pcb-taupe); }\n        .pcb-offer-active { border-color: var(--pcb-espresso); background: var(--pcb-linen); }\n        .pcb-offer-row input { accent-color: var(--pcb-espresso); width: 16px; height: 16px; }\n        .pcb-offer-name { flex: 1; font-size: 14px; font-weight: 500; color: var(--pcb-espresso); }\n        .pcb-offer-price { font-size: 14px; font-weight: 600; color: var(--pcb-coffee); }\n        .pcb-details-attrs { margin-bottom: 24px; }\n        .pcb-attr-group { margin-bottom: 16px; }\n        .pcb-attr-options { display: flex; flex-wrap: wrap; gap: 8px; }\n        .pcb-attr-color { width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--pcb-sand); cursor: pointer; transition: transform 0.2s, border-color 0.2s; }\n        .pcb-attr-color:hover { transform: scale(1.1); }\n        .pcb-attr-sel { border-color: var(--pcb-espresso); box-shadow: 0 0 0 2px var(--pcb-white), 0 0 0 4px var(--pcb-espresso); }\n        .pcb-attr-imgbtn { width: 48px; height: 48px; border-radius: var(--pcb-radius-sm); overflow: hidden; border: 2px solid var(--pcb-sand); padding: 0; cursor: pointer; transition: border-color 0.2s; }\n        .pcb-attr-imgbtn img { width: 100%; height: 100%; object-fit: cover; }\n        .pcb-attr-text { padding: 8px 16px; border-radius: var(--pcb-radius-sm); border: 1.5px solid var(--pcb-sand); background: var(--pcb-white); font-size: 13px; font-weight: 500; color: var(--pcb-coffee); cursor: pointer; transition: all 0.2s; }\n        .pcb-attr-text:hover { border-color: var(--pcb-taupe); color: var(--pcb-espresso); }\n        .pcb-attr-sel { border-color: var(--pcb-espresso); color: var(--pcb-espresso); background: var(--pcb-linen); }\n        .pcb-details-desc { margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--pcb-sand); }\n        .pcb-desc-body { font-size: 14px; line-height: 1.7; color: var(--pcb-coffee); }\n        .pcb-desc-body p { margin: 0 0 12px; }\n        @media (max-width: 768px) {\n          .pcb-details-inner { grid-template-columns: 1fr; gap: 32px; }\n          .pcb-details-gallery { position: static; }\n        }\n      `}</style>
    </div>
  );
}

/* ─────────────────────────── ProductForm ─────────────────────────── */

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform }: ProductFormProps) {
  const [fd, setFd] = useState({
    customerId: "", customerName: "", customerPhone: "",
    customerWelaya: "", customerCommune: "",
    quantity: 1, priceLoss: 0,
    typeLivraison: "home" as "home" | "office"
  });
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => {
    if (userId) {
      fetchWilayas(userId).then(setWilayas);
    }
  }, [userId]);

  useEffect(() => {
    if (fd.customerWelaya) {
      fetchCommunes(fd.customerWelaya).then(setCommunes);
    } else {
      setCommunes([]);
    }
  }, [fd.customerWelaya]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("customerId");
      if (saved) setFd((f) => ({ ...f, customerId: saved }));
    } catch {}
  }, []);

  const getFP = useCallback((): number => {
    if (selectedOffer) {
      const offer = product.offers?.find((o) => o.id === selectedOffer);
      if (offer) return offer.price;
    }
    if (product.variantDetails && Object.keys(selectedVariants).length > 0) {
      const match = product.variantDetails.find((d) => variantMatches(d, selectedVariants));
      if (match && match.price !== -1) return match.price;
    }
    return Number(product.price) || 0;
  }, [selectedOffer, product, selectedVariants]);

  const getVarId = useCallback((): string | number | null => {
    if (product.variantDetails && Object.keys(selectedVariants).length > 0) {
      const match = product.variantDetails.find((d) => variantMatches(d, selectedVariants));
      if (match) return match.id;
    }
    return null;
  }, [product, selectedVariants]);

  const getLiv = useCallback((): number => {
    const w = wilayas.find((w) => w.id === fd.customerWelaya);
    if (!w) return 0;
    return fd.typeLivraison === "home" ? w.livraisonHome : w.livraisonOfice;
  }, [wilayas, fd.customerWelaya, fd.typeLivraison]);

  const total = () => getFP() * fd.quantity + getLiv();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fd.customerName.trim()) errs.customerName = "Le nom est requis";
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone))
      errs.customerPhone = "Numéro invalide (ex: 0555123456)";
    if (!fd.customerWelaya) errs.customerWelaya = "Sélectionnez une wilaya";
    if (!fd.customerCommune) errs.customerCommune = "Sélectionnez une commune";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const addToCart = () => {
    if (!validate()) return;
    const fp = getFP();
    const item = {
      ...fd, product, variantDetailId: getVarId(), productId: product.id,
      storeId: product.store.id, userId, selectedOffer, selectedVariants, platform,
      finalPrice: fp, totalPrice: total(), priceLivraison: getLiv(), addedAt: new Date().toISOString()
    };
    try {
      const raw = localStorage.getItem(domain);
      const items = raw ? JSON.parse(raw) : [];
      items.push(item);
      localStorage.setItem(domain, JSON.stringify(items));
      initCount(items.length);
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const fp = getFP();
    const payload = {
      ...fd, product, variantDetailId: getVarId(), productId: product.id,
      storeId: product.store.id, userId, selectedOffer, selectedVariants, platform,
      finalPrice: fp, totalPrice: total(), priceLivraison: getLiv()
    };
    try {
      const res = await axios.post(`${API_URL}/orders/create`, payload);
      if (res.data?.customerId) {
        localStorage.setItem("customerId", res.data.customerId);
      }
      setSuccess(true);
      router.push(`/successfully?productId=${product.id}`);
    } catch {
      setErrors({ submit: "Erreur lors de la commande. Réessayez." });
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="pcb-form-success">
        <div className="pcb-success-icon">✓</div>
        <h3>Commande envoyée !</h3>
        <p>Nous vous contacterons bientôt pour confirmer votre commande.</p>
      </div>
    );
  }

  return (
    <div className="pcb-productform">
      {!isOrderNow ? (
        <div className="pcb-form-quick">
          <div className="pcb-summary-line">
            <span className="pcb-summary-label">Prix unitaire</span>
            <span className="pcb-summary-value">{getFP()} DZ</span>
          </div>
          <div className="pcb-qty-row">
            <button className="pcb-qty-btn" onClick={() => setFd((f) => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}>−</button>
            <span className="pcb-qty-val">{fd.quantity}</span>
            <button className="pcb-qty-btn" onClick={() => setFd((f) => ({ ...f, quantity: f.quantity + 1 }))}>+</button>
          </div>
          <div className="pcb-form-actions">
            {product.store?.cart === true && (
              <button className="pcb-btn-cart" onClick={addToCart}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Ajouter au panier
              </button>
            )}
            <button className="pcb-btn-order" onClick={() => setIsOrderNow(true)}>Commander maintenant</button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="pcb-form-full">
          <h3 className="pcb-form-title">Finaliser la commande</h3>
          <div className="pcb-form-grid">
            <div className="pcb-form-group">
              <label>Nom complet *</label>
              <input type="text" value={fd.customerName} onChange={(e) => setFd({ ...fd, customerName: e.target.value })} placeholder="Votre nom" />
              {errors.customerName && <span className="pcb-form-error">{errors.customerName}</span>}
            </div>
            <div className="pcb-form-group">
              <label>Téléphone *</label>
              <input type="tel" value={fd.customerPhone} onChange={(e) => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0555123456" />
              {errors.customerPhone && <span className="pcb-form-error">{errors.customerPhone}</span>}
            </div>
            <div className="pcb-form-group">
              <label>Wilaya *</label>
              <select value={fd.customerWelaya} onChange={(e) => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: "" })}>
                <option value="">Choisir...</option>
                {wilayas.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              {errors.customerWelaya && <span className="pcb-form-error">{errors.customerWelaya}</span>}
            </div>
            <div className="pcb-form-group">
              <label>Commune *</label>
              <select value={fd.customerCommune} onChange={(e) => setFd({ ...fd, customerCommune: e.target.value })}>
                <option value="">Choisir...</option>
                {communes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.customerCommune && <span className="pcb-form-error">{errors.customerCommune}</span>}
            </div>
          </div>

          <div className="pcb-livraison">
            <label className="pcb-liv-label">Type de livraison</label>
            <div className="pcb-liv-toggle">
              <button type="button" className={fd.typeLivraison === "home" ? "pcb-liv-active" : ""} onClick={() => setFd({ ...fd, typeLivraison: "home" })}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                À domicile
              </button>
              <button type="button" className={fd.typeLivraison === "office" ? "pcb-liv-active" : ""} onClick={() => setFd({ ...fd, typeLivraison: "office" })}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                Bureau de poste
              </button>
            </div>
          </div>

          <div className="pcb-qty-row pcb-qty-full">
            <span className="pcb-qty-label">Quantité</span>
            <button type="button" className="pcb-qty-btn" onClick={() => setFd((f) => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}>−</button>
            <span className="pcb-qty-val">{fd.quantity}</span>
            <button type="button" className="pcb-qty-btn" onClick={() => setFd((f) => ({ ...f, quantity: f.quantity + 1 }))}>+</button>
          </div>

          <div className="pcb-order-summary">
            <div className="pcb-sum-row">
              <span>Produit</span>
              <span>{product.name}</span>
            </div>
            <div className="pcb-sum-row">
              <span>Prix unitaire</span>
              <span>{getFP()} DZ</span>
            </div>
            <div className="pcb-sum-row">
              <span>Livraison</span>
              <span>{getLiv() > 0 ? `${getLiv()} DZ` : "—"}</span>
            </div>
            <div className="pcb-sum-row pcb-sum-total">
              <span>Total</span>
              <span>{total()} DZ</span>
            </div>
          </div>

          {errors.submit && <div className="pcb-form-error-block">{errors.submit}</div>}

          <div className="pcb-form-actions">
            <button type="button" className="pcb-btn-back" onClick={() => setIsOrderNow(false)}>Retour</button>
            <button type="submit" className="pcb-btn-submit" disabled={submitting}>
              {submitting ? "Envoi..." : "Confirmer la commande"}
            </button>
          </div>
        </form>
      )}

      <style jsx>{`\n        .pcb-productform { margin-top: 8px; }\n        .pcb-form-quick { background: var(--pcb-linen); border-radius: var(--pcb-radius); padding: 24px; }\n        .pcb-summary-line { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }\n        .pcb-summary-label { font-size: 13px; color: var(--pcb-taupe); }\n        .pcb-summary-value { font-family: var(--font-display); font-size: 20px; font-weight: 600; color: var(--pcb-espresso); }\n        .pcb-qty-row { display: flex; align-items: center; gap: 0; margin-bottom: 20px; border: 1.5px solid var(--pcb-sand); border-radius: var(--pcb-radius-sm); overflow: hidden; width: fit-content; }\n        .pcb-qty-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: var(--pcb-coffee); background: var(--pcb-white); transition: background 0.15s; }\n        .pcb-qty-btn:hover { background: var(--pcb-linen); }\n        .pcb-qty-val { width: 48px; text-align: center; font-size: 14px; font-weight: 600; color: var(--pcb-espresso); }\n        .pcb-form-actions { display: flex; gap: 10px; flex-wrap: wrap; }\n        .pcb-btn-cart { flex: 1; min-width: 140px; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 20px; border-radius: 40px; background: var(--pcb-white); color: var(--pcb-espresso); border: 1.5px solid var(--pcb-sand); font-size: 14px; font-weight: 600; transition: all 0.25s; }\n        .pcb-btn-cart:hover { border-color: var(--pcb-espresso); }\n        .pcb-btn-order { flex: 1; min-width: 140px; padding: 14px 20px; border-radius: 40px; background: var(--pcb-espresso); color: var(--pcb-white); font-size: 14px; font-weight: 600; transition: opacity 0.2s; }\n        .pcb-btn-order:hover { opacity: 0.9; }\n        .pcb-form-full { background: var(--pcb-linen); border-radius: var(--pcb-radius); padding: 28px; }\n        .pcb-form-title { font-family: var(--font-display); font-size: 20px; font-weight: 600; margin: 0 0 20px; color: var(--pcb-espresso); }\n        .pcb-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }\n        .pcb-form-group { display: flex; flex-direction: column; gap: 6px; }\n        .pcb-form-group label { font-size: 12px; font-weight: 600; color: var(--pcb-taupe); text-transform: uppercase; letter-spacing: 0.5px; }\n        .pcb-form-group input, .pcb-form-group select { padding: 12px 14px; border: 1.5px solid var(--pcb-sand); border-radius: var(--pcb-radius-sm); font-size: 14px; font-family: var(--font-body); background: var(--pcb-white); color: var(--pcb-espresso); outline: none; transition: border-color 0.2s; }\n        .pcb-form-group input:focus, .pcb-form-group select:focus { border-color: var(--pcb-taupe); }\n        .pcb-form-error { font-size: 12px; color: #c44; margin-top: 2px; }\n        .pcb-form-error-block { padding: 12px; background: #fff0f0; border-radius: var(--pcb-radius-sm); font-size: 13px; color: #c44; margin-bottom: 14px; }\n        .pcb-livraison { margin-bottom: 20px; }\n        .pcb-liv-label { font-size: 12px; font-weight: 600; color: var(--pcb-taupe); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px; }\n        .pcb-liv-toggle { display: flex; gap: 8px; }\n        .pcb-liv-toggle button { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: var(--pcb-radius-sm); border: 1.5px solid var(--pcb-sand); background: var(--pcb-white); font-size: 13px; font-weight: 500; color: var(--pcb-coffee); transition: all 0.2s; }\n        .pcb-liv-toggle button:hover { border-color: var(--pcb-taupe); }\n        .pcb-liv-active { border-color: var(--pcb-espresso) !important; color: var(--pcb-espresso) !important; background: var(--pcb-white) !important; }\n        .pcb-qty-full { margin-bottom: 20px; }\n        .pcb-qty-label { padding: 0 14px; font-size: 13px; color: var(--pcb-taupe); }\n        .pcb-order-summary { background: var(--pcb-white); border-radius: var(--pcb-radius-sm); padding: 16px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px; }\n        .pcb-sum-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--pcb-coffee); }\n        .pcb-sum-total { font-size: 15px; font-weight: 600; color: var(--pcb-espresso); padding-top: 8px; border-top: 1px solid var(--pcb-sand); }\n        .pcb-btn-back { padding: 14px 24px; border-radius: 40px; border: 1.5px solid var(--pcb-sand); background: var(--pcb-white); color: var(--pcb-coffee); font-size: 14px; font-weight: 500; transition: all 0.2s; }\n        .pcb-btn-back:hover { border-color: var(--pcb-taupe); color: var(--pcb-espresso); }\n        .pcb-btn-submit { flex: 1; padding: 14px 24px; border-radius: 40px; background: var(--pcb-espresso); color: var(--pcb-white); font-size: 14px; font-weight: 600; transition: opacity 0.2s; }\n        .pcb-btn-submit:hover { opacity: 0.9; }\n        .pcb-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }\n        .pcb-form-success { text-align: center; padding: 40px 24px; background: var(--pcb-linen); border-radius: var(--pcb-radius); }\n        .pcb-success-icon { width: 56px; height: 56px; border-radius: 50%; background: var(--pcb-sage); color: white; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px; }\n        .pcb-form-success h3 { font-family: var(--font-display); font-size: 20px; margin: 0 0 8px; color: var(--pcb-espresso); }\n        .pcb-form-success p { font-size: 14px; color: var(--pcb-coffee); margin: 0; }\n        @media (max-width: 480px) {\n          .pcb-form-grid { grid-template-columns: 1fr; }\n        }\n      `}</style>
    </div>
  );
}

/* ─────────────────────────── Cart ─────────────────────────── */

export function Cart({ domain, store }: { domain: string; store: Store }) {
  const [items, setItems] = useState<any[]>([]);
  const [fd, setFd] = useState({
    customerId: "", customerName: "", customerPhone: "",
    customerWelaya: "", customerCommune: "",
    typeLivraison: "home" as "home" | "office"
  });
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(domain);
      setItems(raw ? JSON.parse(raw) : []);
    } catch { setItems([]); }
  }, [domain]);

  useEffect(() => {
    if (store?.userId) {
      fetchWilayas(store.userId).then(setWilayas);
    }
  }, [store?.userId]);

  useEffect(() => {
    if (fd.customerWelaya) {
      fetchCommunes(fd.customerWelaya).then(setCommunes);
    } else {
      setCommunes([]);
    }
  }, [fd.customerWelaya]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("customerId");
      if (saved) setFd((f) => ({ ...f, customerId: saved }));
    } catch {}
  }, []);

  const getLiv = () => {
    const w = wilayas.find((w) => w.id === fd.customerWelaya);
    if (!w) return 0;
    return fd.typeLivraison === "home" ? w.livraisonHome : w.livraisonOfice;
  };

  const cartTotal = items.reduce((sum, it) => sum + (Number(it.finalPrice) || 0) * (Number(it.quantity) || 1), 0);
  const finalTotal = cartTotal + getLiv();

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    localStorage.setItem(domain, JSON.stringify(next));
    initCount(next.length);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fd.customerName.trim()) errs.customerName = "Le nom est requis";
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone))
      errs.customerPhone = "Numéro invalide";
    if (!fd.customerWelaya) errs.customerWelaya = "Sélectionnez une wilaya";
    if (!fd.customerCommune) errs.customerCommune = "Sélectionnez une commune";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || items.length === 0) return;
    setSubmitting(true);
    const payload = items.map((it) => ({
      ...fd, ...it, priceLivraison: getLiv(), totalPrice: (Number(it.finalPrice) || 0) * (Number(it.quantity) || 1) + getLiv()
    }));
    try {
      await axios.post(`${API_URL}/orders/create`, payload);
      localStorage.removeItem(domain);
      initCount(0);
      setItems([]);
      setOrdered(true);
    } catch {
      setErrors({ submit: "Erreur lors de l'envoi. Réessayez." });
    }
    setSubmitting(false);
  };

  if (ordered) {
    return (
      <div className="pcb-cart-page">
        <div className="pcb-cart-success">
          <div className="pcb-success-icon">✓</div>
          <h2>Commande confirmée !</h2>
          <p>Merci pour votre confiance. Nous vous contacterons bientôt.</p>
          <Link href="/" className="pcb-btn-primary">Continuer mes achats</Link>
        </div>
        <style jsx>{`\n          .pcb-cart-page { padding: 80px 24px; }\n          .pcb-cart-success { max-width: 480px; margin: 0 auto; text-align: center; padding: 48px 32px; background: var(--pcb-linen); border-radius: var(--pcb-radius); }\n          .pcb-success-icon { width: 64px; height: 64px; border-radius: 50%; background: var(--pcb-sage); color: white; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 20px; }\n          .pcb-cart-success h2 { font-family: var(--font-display); font-size: 24px; margin: 0 0 10px; color: var(--pcb-espresso); }\n          .pcb-cart-success p { font-size: 14px; color: var(--pcb-coffee); margin: 0 0 24px; }\n        `}</style>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pcb-cart-page">
        <div className="pcb-cart-empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--pcb-taupe)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <h2>Votre panier est vide</h2>
          <p>Découvrez nos vêtements en coton pur et ajoutez vos favoris.</p>
          <Link href="/" className="pcb-btn-primary">Découvrir la collection</Link>
        </div>
        <style jsx>{`\n          .pcb-cart-page { padding: 80px 24px; }\n          .pcb-cart-empty { max-width: 400px; margin: 0 auto; text-align: center; }\n          .pcb-cart-empty h2 { font-family: var(--font-display); font-size: 22px; margin: 20px 0 8px; color: var(--pcb-espresso); }\n          .pcb-cart-empty p { font-size: 14px; color: var(--pcb-coffee); margin: 0 0 24px; }\n        `}</style>
      </div>
    );
  }

  return (
    <div className="pcb-cart-page">
      <div className="pcb-cart-inner">
        <h1 className="pcb-cart-title">Mon panier</h1>
        <div className="pcb-cart-layout">
          <div className="pcb-cart-items">
            {items.map((item, idx) => (
              <div key={idx} className="pcb-cart-item">
                <div className="pcb-cart-item-img">
                  {item.product?.productImage ? (
                    <img src={item.product.productImage} alt="" />
                  ) : (
                    <div className="pcb-cart-item-placeholder">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    </div>
                  )}
                </div>
                <div className="pcb-cart-item-info">
                  <h4 className="pcb-cart-item-name">{item.product?.name}</h4>
                  <div className="pcb-cart-item-meta">
                    <span>Qté: {item.quantity}</span>
                    <span>{item.finalPrice} {store?.currency}</span>
                  </div>
                </div>
                <button className="pcb-cart-item-remove" onClick={() => removeItem(idx)} aria-label="Supprimer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            ))}
            <div className="pcb-cart-subtotal">
              <span>Sous-total</span>
              <span>{cartTotal} {store?.currency}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="pcb-cart-form">
            <h3 className="pcb-cart-form-title">Informations de livraison</h3>
            <div className="pcb-form-group">
              <label>Nom complet *</label>
              <input type="text" value={fd.customerName} onChange={(e) => setFd({ ...fd, customerName: e.target.value })} placeholder="Votre nom" />
              {errors.customerName && <span className="pcb-form-error">{errors.customerName}</span>}
            </div>
            <div className="pcb-form-group">
              <label>Téléphone *</label>
              <input type="tel" value={fd.customerPhone} onChange={(e) => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0555123456" />
              {errors.customerPhone && <span className="pcb-form-error">{errors.customerPhone}</span>}
            </div>
            <div className="pcb-form-group">
              <label>Wilaya *</label>
              <select value={fd.customerWelaya} onChange={(e) => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: "" })}>
                <option value="">Choisir...</option>
                {wilayas.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              {errors.customerWelaya && <span className="pcb-form-error">{errors.customerWelaya}</span>}
            </div>
            <div className="pcb-form-group">
              <label>Commune *</label>
              <select value={fd.customerCommune} onChange={(e) => setFd({ ...fd, customerCommune: e.target.value })}>
                <option value="">Choisir...</option>
                {communes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.customerCommune && <span className="pcb-form-error">{errors.customerCommune}</span>}
            </div>
            <div className="pcb-livraison">
              <label className="pcb-liv-label">Type de livraison</label>
              <div className="pcb-liv-toggle">
                <button type="button" className={fd.typeLivraison === "home" ? "pcb-liv-active" : ""} onClick={() => setFd({ ...fd, typeLivraison: "home" })}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  À domicile
                </button>
                <button type="button" className={fd.typeLivraison === "office" ? "pcb-liv-active" : ""} onClick={() => setFd({ ...fd, typeLivraison: "office" })}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                  Bureau de poste
                </button>
              </div>
            </div>
            <div className="pcb-cart-totalbox">
              <div className="pcb-total-row">
                <span>Sous-total</span>
                <span>{cartTotal} {store?.currency}</span>
              </div>
              <div className="pcb-total-row">
                <span>Livraison</span>
                <span>{getLiv() > 0 ? `${getLiv()} ${store?.currency}` : "—"}</span>
              </div>
              <div className="pcb-total-row pcb-total-grand">
                <span>Total</span>
                <span>{finalTotal} {store?.currency}</span>
              </div>
            </div>
            {errors.submit && <div className="pcb-form-error-block">{errors.submit}</div>}
            <button type="submit" className="pcb-btn-submit pcb-btn-full" disabled={submitting}>
              {submitting ? "Envoi..." : "Confirmer la commande"}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`\n        .pcb-cart-page { padding: 40px 24px; min-height: 60vh; }\n        .pcb-cart-inner { max-width: 1080px; margin: 0 auto; }\n        .pcb-cart-title { font-family: var(--font-display); font-size: 28px; font-weight: 600; margin: 0 0 32px; color: var(--pcb-espresso); }\n        .pcb-cart-layout { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 40px; align-items: start; }\n        .pcb-cart-items { background: var(--pcb-white); border-radius: var(--pcb-radius); padding: 24px; box-shadow: var(--pcb-shadow); }\n        .pcb-cart-item { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--pcb-sand); }\n        .pcb-cart-item:last-child { border-bottom: none; }\n        .pcb-cart-item-img { width: 72px; height: 72px; border-radius: var(--pcb-radius-sm); overflow: hidden; background: var(--pcb-linen); flex-shrink: 0; }\n        .pcb-cart-item-img img { width: 100%; height: 100%; object-fit: cover; }\n        .pcb-cart-item-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--pcb-taupe); }\n        .pcb-cart-item-info { flex: 1; min-width: 0; }\n        .pcb-cart-item-name { font-size: 14px; font-weight: 500; color: var(--pcb-espresso); margin: 0 0 6px; }\n        .pcb-cart-item-meta { display: flex; gap: 12px; font-size: 13px; color: var(--pcb-coffee); }\n        .pcb-cart-item-remove { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: var(--pcb-taupe); transition: all 0.2s; flex-shrink: 0; }\n        .pcb-cart-item-remove:hover { background: #fff0f0; color: #c44; }\n        .pcb-cart-subtotal { display: flex; justify-content: space-between; padding-top: 16px; margin-top: 8px; border-top: 2px solid var(--pcb-sand); font-size: 15px; font-weight: 600; color: var(--pcb-espresso); }\n        .pcb-cart-form { background: var(--pcb-linen); border-radius: var(--pcb-radius); padding: 28px; position: sticky; top: 100px; }\n        .pcb-cart-form-title { font-family: var(--font-display); font-size: 18px; font-weight: 600; margin: 0 0 20px; color: var(--pcb-espresso); }\n        .pcb-cart-totalbox { background: var(--pcb-white); border-radius: var(--pcb-radius-sm); padding: 16px; margin: 20px 0; display: flex; flex-direction: column; gap: 10px; }\n        .pcb-total-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--pcb-coffee); }\n        .pcb-total-grand { font-size: 16px; font-weight: 600; color: var(--pcb-espresso); padding-top: 8px; border-top: 1px solid var(--pcb-sand); }\n        .pcb-btn-full { width: 100%; }\n        @media (max-width: 768px) {\n          .pcb-cart-layout { grid-template-columns: 1fr; }\n          .pcb-cart-form { position: static; }\n        }\n      `}</style>
    </div>
  );
}

/* ─────────────────────────── Static Pages ─────────────────────────── */

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pcb-shell">
      <div className="pcb-shell-header">
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, var(--pcb-espresso) 0%, var(--pcb-coffee) 100%)" }} />
        </div>
        <h1 className="pcb-shell-title">{title}</h1>
      </div>
      <div className="pcb-shell-body">{children}</div>
      <style jsx>{`\n        .pcb-shell { min-height: 60vh; }\n        .pcb-shell-header { position: relative; padding: 80px 24px 60px; text-align: center; overflow: hidden; }\n        .pcb-shell-title { position: relative; z-index: 1; font-family: var(--font-display); font-size: 32px; font-weight: 600; color: var(--pcb-white); margin: 0; text-shadow: 0 2px 8px rgba(0,0,0,0.2); }\n        .pcb-shell-body { max-width: 800px; margin: 0 auto; padding: 48px 24px 80px; }\n      `}</style>
    </div>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="pcb-infoblock">
      <h3>{title}</h3>
      <p>{body}</p>
      <style jsx>{`\n        .pcb-infoblock { margin-bottom: 32px; }\n        .pcb-infoblock h3 { font-family: var(--font-display); font-size: 18px; font-weight: 600; color: var(--pcb-espresso); margin: 0 0 10px; }\n        .pcb-infoblock p { font-size: 14px; line-height: 1.7; color: var(--pcb-coffee); margin: 0; }\n      `}</style>
    </div>
  );
}

export function Privacy() {
  return (
    <Shell title="Politique de confidentialité">
      <InfoBlock title="Collecte des données" body="Nous collectons uniquement les informations nécessaires au traitement de vos commandes : nom, adresse, numéro de téléphone et détails de livraison." />
      <InfoBlock title="Utilisation" body="Vos données sont utilisées exclusivement pour la préparation et la livraison de vos articles. Nous ne vendons ni ne partageons vos informations avec des tiers." />
      <InfoBlock title="Sécurité" body="Toutes les transactions sont sécurisées. Vos informations sont stockées de manière cryptée et accessibles uniquement par notre équipe autorisée." />
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="Conditions d'utilisation">
      <InfoBlock title="Commandes" body="En passant commande, vous acceptez de fournir des informations exactes et complètes. Nous nous réservons le droit d'annuler toute commande suspecte." />
      <InfoBlock title="Livraison" body="Les délais de livraison sont indicatifs et peuvent varier selon la wilaya. Le paiement s'effectue à la réception de la commande." />
      <InfoBlock title="Retours" body="Les retours sont acceptés dans les 7 jours suivant la réception, sous réserve que l'article soit intact et dans son emballage d'origine." />
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="Politique des cookies">
      <InfoBlock title="Utilisation des cookies" body="Notre site utilise des cookies essentiels pour le fonctionnement du panier et de la navigation. Aucun cookie publicitaire n'est utilisé." />
      <InfoBlock title="Gestion" body="Vous pouvez désactiver les cookies via les paramètres de votre navigateur. Cela peut affecter certaines fonctionnalités du site." />
      <InfoBlock title="Consentement" body="En continuant à naviguer sur notre site, vous acceptez l'utilisation des cookies essentiels nécessaires à votre expérience." />
    </Shell>
  );
}

export function Contact({ store }: { store: Store }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store.id });
      setSent(true);
    } catch {}
    setSending(false);
  };

  if (sent) {
    return (
      <div className="pcb-contact-page">
        <div className="pcb-contact-success">
          <div className="pcb-success-icon">✓</div>
          <h2>Message envoyé !</h2>
          <p>Nous vous répondrons dans les plus brefs délais.</p>
          <button className="pcb-btn-primary" onClick={() => setSent(false)}>Envoyer un autre message</button>
        </div>
        <style jsx>{`\n          .pcb-contact-page { padding: 80px 24px; }\n          .pcb-contact-success { max-width: 480px; margin: 0 auto; text-align: center; padding: 48px 32px; background: var(--pcb-linen); border-radius: var(--pcb-radius); }\n          .pcb-success-icon { width: 64px; height: 64px; border-radius: 50%; background: var(--pcb-sage); color: white; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 20px; }\n          .pcb-contact-success h2 { font-family: var(--font-display); font-size: 24px; margin: 0 0 10px; color: var(--pcb-espresso); }\n          .pcb-contact-success p { font-size: 14px; color: var(--pcb-coffee); margin: 0 0 24px; }\n        `}</style>
      </div>
    );
  }

  return (
    <div className="pcb-contact-page">
      <div className="pcb-contact-inner">
        <div className="pcb-contact-info">
          <h2 className="pcb-contact-title">Contactez-nous</h2>
          <p className="pcb-contact-desc">Une question ? Notre équipe est là pour vous aider.</p>
          {store?.contact?.phone && (
            <div className="pcb-contact-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>{store.contact.phone}</span>
            </div>
          )}
          {(store?.contact?.wilaya || store?.contact?.address) && (
            <div className="pcb-contact-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{[store.contact.wilaya, store.contact.address].filter(Boolean).join(", ")}</span>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="pcb-contact-form">
          <div className="pcb-form-group">
            <label>Nom</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Votre nom" />
          </div>
          <div className="pcb-form-group">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="votre@email.com" />
          </div>
          <div className="pcb-form-group">
            <label>Téléphone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0555123456" />
          </div>
          <div className="pcb-form-group">
            <label>Message</label>
            <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Votre message..." />
          </div>
          <button type="submit" className="pcb-btn-submit" disabled={sending}>
            {sending ? "Envoi..." : "Envoyer le message"}
          </button>
        </form>
      </div>
      <style jsx>{`\n        .pcb-contact-page { padding: 64px 24px; }\n        .pcb-contact-inner { max-width: 960px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1.2fr; gap: 48px; align-items: start; }\n        .pcb-contact-info { padding-top: 8px; }\n        .pcb-contact-title { font-family: var(--font-display); font-size: 28px; font-weight: 600; color: var(--pcb-espresso); margin: 0 0 12px; }\n        .pcb-contact-desc { font-size: 14px; color: var(--pcb-coffee); margin: 0 0 24px; line-height: 1.6; }\n        .pcb-contact-row { display: flex; align-items: center; gap: 12px; font-size: 14px; color: var(--pcb-coffee); margin-bottom: 14px; }\n        .pcb-contact-row svg { color: var(--pcb-taupe); flex-shrink: 0; }\n        .pcb-contact-form { background: var(--pcb-linen); border-radius: var(--pcb-radius); padding: 32px; }\n        .pcb-contact-form .pcb-form-group { margin-bottom: 16px; }\n        .pcb-contact-form .pcb-form-group:last-child { margin-bottom: 0; }\n        .pcb-contact-form textarea { resize: vertical; min-height: 100px; padding: 12px 14px; border: 1.5px solid var(--pcb-sand); border-radius: var(--pcb-radius-sm); font-size: 14px; font-family: var(--font-body); background: var(--pcb-white); color: var(--pcb-espresso); outline: none; width: 100%; transition: border-color 0.2s; }\n        .pcb-contact-form textarea:focus { border-color: var(--pcb-taupe); }\n        @media (max-width: 768px) {\n          .pcb-contact-inner { grid-template-columns: 1fr; }\n        }\n      `}</style>
    </div>
  );
}

export function StaticPage({ staticPage, page, store }: { staticPage?: string; page?: string; store: Store }) {
  const p = (staticPage || page || "").toLowerCase();
  if (p === "privacy") return <Privacy />;
  if (p === "terms") return <Terms />;
  if (p === "cookies") return <Cookies />;
  if (p === "contact") return <Contact store={store} />;
  return <Privacy />;
}
