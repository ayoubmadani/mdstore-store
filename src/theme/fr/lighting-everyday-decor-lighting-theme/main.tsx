"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import axios from "axios";
import {
  ShoppingCart, Search, Menu, X, Phone, Mail, MapPin,
  ChevronDown, ChevronLeft, ChevronRight, Star, Trash2,
  Package, ShieldCheck, CreditCard, Headphones, Minus, Plus,
  AlertCircle, Send, Building2, CheckCircle, ArrowRight,
  Sun, Lamp, Sparkles,
  HomeIcon
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

/* ────────────────────────────────────────────────
   Types (preserved as-is from reference)
   ──────────────────────────────────────────────── */
interface Offer { id: string; name: string; quantity: number; price: number; }
interface Variant { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: "color" | "image" | "text" | null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: "color" | "image" | "text"; value: string; }
interface VariantDetail { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }

interface Product {
  id: string; name: string; price: string | number; priceOriginal?: string | number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[]; offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; };
}

interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>; platform?: string; priceLoss?: number;
}

/* ────────────────────────────────────────────────
   Theme Tokens — Warm Light Decor Palette
   ──────────────────────────────────────────────── */
const BG = "#FDF8F3";
const CARD = "#FFFFFF";
const TXT = "#2D2420";
const SUB = "#8B7D77";
const A = "#D4A574";
const AL = "#F5E6D3";
const BD = "#E8DDD4";
const DARK = "#1A1410";
const DARK2 = "#2A2018";
const ERR = "#EF4444";

const THEME_CSS = `
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(212,165,116,0.4); }
  50%       { box-shadow: 0 0 0 12px rgba(212,165,116,0); }
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
@keyframes badgeBounce {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.4); }
  70%  { transform: scale(0.9); }
  100% { transform: scale(1); }
}

.card-wrap {
  transition: transform 0.28s cubic-bezier(.22,.68,0,1.2), box-shadow 0.28s ease;
}
.card-wrap:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 20px 40px rgba(45,36,32,0.12);
}
.card-img-wrap { overflow: hidden; }
.card-img-wrap img { transition: transform 0.5s ease; }
.card-wrap:hover .card-img-wrap img { transform: scale(1.08); }

.btn-primary {
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease;
}
.btn-primary:hover  { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(212,165,116,0.35); }
.btn-primary:active { transform: translateY(0px) scale(0.97); }

.btn-icon { transition: transform 0.2s ease; }
.btn-primary:hover .btn-icon { transform: translateX(4px); }

.nav-link { position: relative; }
.nav-link::after {
  content: '';
  position: absolute; bottom: -2px; left: 0; right: 0;
  height: 2px; background: ${A};
  transform: scaleX(0); transform-origin: center;
  transition: transform 0.25s ease;
}
.nav-link:hover::after,
.nav-link.active::after { transform: scaleX(1); }

.skeleton {
  background: linear-gradient(90deg, #e8ddd4 25%, #f5ebe4 50%, #e8ddd4 75%);
  background-size: 400px 100%;
  animation: shimmer 1.4s infinite linear;
  border-radius: 6px;
}

.input-field { transition: border-color 0.2s, box-shadow 0.2s; }
.input-field:focus {
  border-color: ${A};
  box-shadow: 0 0 0 3px rgba(212,165,116,0.15);
  outline: none;
}

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}

.products-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
@media (min-width: 640px)  { .products-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1280px) { .products-grid { grid-template-columns: repeat(4, 1fr); } }

.form-row-2 { display: grid; grid-template-columns: 1fr; gap: 0.875rem; margin-bottom: 0.875rem; }
@media (min-width: 500px) { .form-row-2 { grid-template-columns: 1fr 1fr; } }

.cart-inner    { display: grid; grid-template-columns: 1fr; gap: 2rem; }
.details-inner { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 1024px) { .cart-inner { grid-template-columns: 1.2fr 1fr; } }
@media (min-width: 768px)  { .details-inner { grid-template-columns: 1fr 1fr; } }

.nav-links  { display: flex; align-items: center; gap: 24px; }
.nav-burger { display: none; }
@media (max-width: 700px) {
  .nav-links { display: none; }
  .nav-burger { display: flex; }
}
`;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";

/* ────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────── */
function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some((e) => e.attrName === n && e.value === v));
}

const fetchWilayas = async (uid: string): Promise<Wilaya[]> => {
  const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`);
  return data;
};

const fetchCommunes = async (wid: string): Promise<Commune[]> => {
  const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`);
  return data;
};

/* ────────────────────────────────────────────────
   Main (Wrapper)
   ──────────────────────────────────────────────── */
export default function Main({ store, children, domain }: any) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div dir="ltr" style={{ background: BG, color: TXT, minHeight: "100vh", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{THEME_CSS}</style>
      <Navbar store={store} domain={domain} />
      <main style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }}>
        {children}
      </main>
      <Footer store={store} />
    </div>
  );
}

/* ────────────────────────────────────────────────
   Navbar
   ──────────────────────────────────────────────── */
export function Navbar({ store, domain }: { store: any; domain: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [listSearch, setListSearch] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const count = useCartStore((s) => s.count);
  const initCount = useCartStore((s) => s.initCount);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(domain);
    if (saved) initCount(JSON.parse(saved).length);
  }, [domain, initCount]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.length < 2) { setListSearch([]); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await axios.get(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(searchQuery)}`);
        setListSearch(data.products || []);
      } catch { setListSearch([]); }
      setLoading(false);
    }, 380);
  }, [searchQuery, domain]);

  const mobileLinks = [
    { h: "/", l: "Accueil" },
    { h: "/contact", l: "Contact" },
  ];

  return (
    <>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div style={{
          background: DARK, color: "#fff", textAlign: "center", padding: "6px 1rem",
          fontSize: "0.8rem", letterSpacing: "0.5px"
        }}>
          {store.topBar.text}
        </div>
      )}
      <header style={{
        position: "sticky", top: 0, zIndex: 200,
        background: scrolled ? "rgba(253,248,243,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${BD}` : "1px solid transparent",
        transition: "all 0.3s ease"
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: TXT }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: A, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lamp size={22} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.3px" }}>
              {store?.name || "Lumina"}
            </span>
          </Link>

          <nav className="nav-links">
            <Link href="/" className="nav-link" style={{ color: TXT, textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>Accueil</Link>
            <Link href="/contact" className="nav-link" style={{ color: TXT, textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>Contact</Link>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowSearch(!showSearch)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: SUB }}>
                <Search size={20} />
              </button>
              {showSearch && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  width: 320, background: CARD, borderRadius: 12,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.12)", border: `1px solid ${BD}`,
                  padding: "0.75rem", zIndex: 300
                }} className="search-dropdown">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${BD}`, borderRadius: 8, padding: "0 12px", marginBottom: 8 }}>
                    <Search size={16} color={SUB} />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { router.push(`/?search=${encodeURIComponent(searchQuery)}`); setShowSearch(false); }}}
                      placeholder="Rechercher des produits..."
                      style={{ border: "none", outline: "none", background: "none", padding: "10px 0", fontSize: "0.85rem", width: "100%", color: TXT, fontFamily: "inherit" }}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                        <X size={14} color={SUB} />
                      </button>
                    )}
                  </div>
                  {loading && <div className="skeleton" style={{ height: 60, borderRadius: 8, marginBottom: 6 }} />}
                  {!loading && listSearch.length > 0 && (
                    <>
                      {listSearch.slice(0, 5).map((p) => (
                        <Link key={p.id} href={`/product/${p.id}`} onClick={() => setShowSearch(false)}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px", borderRadius: 8, textDecoration: "none", color: TXT, transition: "background 0.15s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = AL)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <div style={{ width: 40, height: 40, borderRadius: 6, overflow: "hidden", background: BG, flexShrink: 0 }}>
                            <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                          <span style={{ fontSize: "0.8rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                        </Link>
                      ))}
                      <Link href={`/?search=${encodeURIComponent(searchQuery)}`} onClick={() => setShowSearch(false)}
                        style={{ display: "block", textAlign: "center", padding: "8px", fontSize: "0.8rem", color: A, textDecoration: "none", fontWeight: 600, marginTop: 4 }}>
                        Voir tous les resultats
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {store?.cart !== false && (
              <Link href="/cart" style={{ position: "relative", color: TXT, textDecoration: "none", padding: 8 }}>
                <ShoppingCart size={20} />
                {count > 0 && (
                  <span style={{
                    position: "absolute", top: 0, right: 0,
                    background: A, color: "#fff", fontSize: "0.65rem",
                    fontWeight: 700, width: 18, height: 18, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "badgeBounce 0.4s ease"
                  }}>{count}</span>
                )}
              </Link>
            )}

            <button className="nav-burger" onClick={() => setOpen(!open)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: TXT }}>
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {open && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "rgba(26,20,16,0.5)", backdropFilter: "blur(4px)"
          }} onClick={() => setOpen(false)}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0,
              background: CARD, borderRadius: "0 0 20px 20px",
              padding: "1.5rem", boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>Menu</span>
                <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  <X size={24} />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {mobileLinks.map((lnk) => (
                  <Link key={lnk.h} href={lnk.h} onClick={() => setOpen(false)}
                    style={{ padding: "12px 0", color: TXT, textDecoration: "none", fontSize: "1rem", fontWeight: 500, borderBottom: `1px solid ${BD}` }}>
                    {lnk.l}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

/* ────────────────────────────────────────────────
   Footer
   ──────────────────────────────────────────────── */
export function Footer({ store }: { store: any }) {
  const year = new Date().getFullYear();
  const links = [
    { h: "/", l: "Accueil" },
    { h: "/cart", l: "Panier" },
    { h: "/contact", l: "Contact" },
    { h: "/privacy", l: "Confidentialite" },
    { h: "/terms", l: "Conditions" },
  ].filter((lnk) => lnk.h !== "/cart" || store?.cart !== false);

  return (
    <footer style={{ background: DARK, color: "#fff", padding: "3rem 0 1.5rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
        <style>{`@media (min-width:768px){.fr-footer-grid{grid-template-columns:1.3fr 1fr 1fr !important;}}`}</style>
        <div className="fr-footer-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem", marginBottom: "2.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: A, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Lamp size={18} color="#fff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>{store?.name || "Lumina"}</span>
            </div>
            <p style={{ color: "#aaa", fontSize: "0.85rem", lineHeight: 1.6, maxWidth: 320 }}>
              {store?.hero?.subtitle || "Eclairez votre quotidien avec style et elegance."}
            </p>
            <p style={{ color: "#777", fontSize: "0.75rem", marginTop: 16 }}>&copy; {year} {store?.name}. Tous droits reserves.</p>
          </div>

          <div>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: 16, letterSpacing: "1px", textTransform: "uppercase", color: "#aaa" }}>Pages</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {links.map((lnk) => (
                <Link key={lnk.h} href={lnk.h} style={{ color: "#ccc", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = A)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#ccc")}>
                  {lnk.l}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: 16, letterSpacing: "1px", textTransform: "uppercase", color: "#aaa" }}>Contact</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {store?.contact?.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#ccc", fontSize: "0.85rem" }}>
                  <Phone size={14} color={A} /> {store.contact.phone}
                </div>
              )}
              {store?.contact?.email && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#ccc", fontSize: "0.85rem" }}>
                  <Mail size={14} color={A} /> {store.contact.email}
                </div>
              )}
              {store?.contact?.wilaya && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#ccc", fontSize: "0.85rem" }}>
                  <MapPin size={14} color={A} /> {store.contact.wilaya} {store.contact.address || ""}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ────────────────────────────────────────────────
   Card
   ──────────────────────────────────────────────── */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const [imgErr, setImgErr] = useState(false);
  const img = displayImage || product.productImage || product.imagesProduct?.[0]?.imageUrl;

  return (
    <Link href={`/product/${product.slug || product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div className="card-wrap" style={{
        background: CARD, borderRadius: 16, overflow: "hidden",
        border: `1px solid ${BD}`, position: "relative"
      }}>
        <div className="card-img-wrap" style={{ aspectRatio: "1 / 1", background: BG, position: "relative" }}>
          {img && !imgErr ? (
            <img src={img} alt={product.name} onError={() => setImgErr(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lamp size={40} color={BD} />
            </div>
          )}
          {discount > 0 && (
            <div style={{
              position: "absolute", top: 12, left: 12,
              background: "#E74C3C", color: "#fff", fontSize: "0.7rem",
              fontWeight: 700, padding: "4px 10px", borderRadius: 20
            }}>
              -{discount}%
            </div>
          )}
        </div>

        <div style={{ padding: "1rem" }}>
          <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={12} fill={s <= 4 ? "#F1C40F" : "none"} color={s <= 4 ? "#F1C40F" : BD} />
            ))}
          </div>
          <h3 style={{
            fontSize: "0.9rem", fontWeight: 600, marginBottom: 10,
            lineHeight: 1.4, overflow: "hidden", display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
          }}>
            {product.name}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: "1rem", color: A }}>
              {Number(product.price).toLocaleString()} {store?.currency || "DA"}
            </span>
            {product.priceOriginal && Number(product.priceOriginal) > Number(product.price) && (
              <span style={{ fontSize: "0.8rem", color: SUB, textDecoration: "line-through" }}>
                {Number(product.priceOriginal).toLocaleString()} {store?.currency || "DA"}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ────────────────────────────────────────────────
   Home
   ──────────────────────────────────────────────── */
export function Home({ store, page }: { store: any; page: number }) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const products = store.products || [];
  const cats = store.categories || [];
  const countPage = Math.ceil((store.count || products.length) / 48);

  const trustItems = [
    { icon: <Package size={22} color={A} />, title: "Livraison rapide", desc: "Partout en Algerie" },
    { icon: <ShieldCheck size={22} color={A} />, title: "Qualite garantie", desc: "Produits verifies" },
    { icon: <CreditCard size={22} color={A} />, title: "Paiement securise", desc: "A la livraison" },
    { icon: <Headphones size={22} color={A} />, title: "Support 24/7", desc: "A votre ecoute" },
  ];

  return (
    <div>
      <section style={{ position: "relative", minHeight: "clamp(480px, 68vh, 760px)", display: "flex", alignItems: "center", overflow: "hidden" }}>
        {store?.hero?.imageUrl && (
          <img src={store.hero.imageUrl} alt="" style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", display: "block", zIndex: 0
          }} />
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: store?.hero?.imageUrl
            ? "linear-gradient(to right, rgba(26,20,16,0.85) 0%, rgba(26,20,16,0.4) 100%)"
            : "linear-gradient(135deg, #2A2018 0%, #1A1410 100%)",
          zIndex: 1
        }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", width: "100%" }}>
          <div style={{ maxWidth: 600 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(212,165,116,0.2)", color: A, padding: "6px 16px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, marginBottom: 20, animation: "fadeUp 0.7s ease 0.1s both" }}>
              <Sparkles size={14} /> Nouvelle Collection
            </div>
            <h1 className="hero-title" style={{
              fontSize: "clamp(1.75rem, 5vw, 3.5rem)", fontWeight: 800, color: "#fff",
              lineHeight: 1.1, marginBottom: 20, animation: "fadeUp 0.7s ease 0.1s both"
            }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store?.hero?.title || "Eclairez votre<br/>interieur avec style") }} />
            <p className="hero-sub" style={{
              fontSize: "clamp(1rem, 2vw, 1.25rem)", color: "rgba(255,255,255,0.75)",
              lineHeight: 1.6, marginBottom: 32, maxWidth: 480, animation: "fadeUp 0.7s ease 0.25s both"
            }}>
              {store?.hero?.subtitle || "Des lampes et luminaires soigneusement selectionnes pour sublimer chaque coin de votre maison."}
            </p>
            <div className="hero-cta" style={{ display: "flex", gap: 12, flexWrap: "wrap", animation: "fadeUp 0.7s ease 0.4s both" }}>
              <Link href="/#products" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "0.875rem 1.75rem", background: A, color: "#fff",
                fontWeight: 700, fontSize: "0.9rem", borderRadius: 10,
                textDecoration: "none", minHeight: 44
              }} className="btn-primary">
                Decouvrir <ArrowRight size={16} className="btn-icon" />
              </Link>
              {store?.cart !== false && (
                <Link href="/cart" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "0.875rem 1.75rem", background: "transparent", color: "#fff",
                  fontWeight: 700, fontSize: "0.9rem", borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.3)", textDecoration: "none", minHeight: 44
                }}>
                  Mon Panier
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: CARD, borderBottom: `1px solid ${BD}`, padding: "2rem 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
          {trustItems.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: AL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {t.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.85rem", color: TXT }}>{t.title}</div>
                <div style={{ fontSize: "0.75rem", color: SUB }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "3rem 0", maxWidth: 1280, margin: "0 auto", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: "2rem" }}>
          <Link href="/" style={{
            padding: "8px 20px", borderRadius: 30, fontSize: "0.85rem", fontWeight: 600,
            textDecoration: "none", border: `1px solid ${BD}`,
            background: !activeCategory ? A : CARD,
            color: !activeCategory ? "#fff" : TXT,
            transition: "all 0.2s ease"
          }}>Tous</Link>
          {cats.map((cat: any) => (
            <Link key={cat.id} href={`?category=${cat.id}`} style={{
              padding: "8px 20px", borderRadius: 30, fontSize: "0.85rem", fontWeight: 600,
              textDecoration: "none", border: `1px solid ${BD}`,
              background: activeCategory === String(cat.id) ? A : CARD,
              color: activeCategory === String(cat.id) ? "#fff" : TXT,
              transition: "all 0.2s ease"
            }}>{cat.name}</Link>
          ))}
        </div>

        <div className="products-grid" id="products">
          {products.map((p: Product, i: number) => {
            const price = Number(p.price);
            const priceO = p.priceOriginal ? Number(p.priceOriginal) : price;
            const discount = priceO > price ? Math.round(((priceO - price) / priceO) * 100) : 0;
            return (
              <div key={p.id} style={{ animation: "fadeUp 0.5s ease both", animationDelay: `${i * 0.07}s` }}>
                <Card
                  product={p}
                  displayImage={p.productImage || p.imagesProduct?.[0]?.imageUrl}
                  discount={discount}
                  store={store}
                  viewDetails={() => {}}
                />
              </div>
            );
          })}
        </div>

        {countPage > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: "2.5rem" }}>
            {Array.from({ length: countPage }, (_, i) => i + 1).map((pg) => (
              <Link key={pg} href={{ query: { page: pg } }} scroll={false} style={{
                width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
                background: page === pg ? A : CARD,
                color: page === pg ? "#fff" : TXT,
                border: `1px solid ${page === pg ? A : BD}`
              }}>{pg}</Link>
            ))}
          </div>
        )}
      </section>

      <section style={{ background: DARK2, padding: "4rem 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <Sun size={40} color={A} style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            Transformez votre espace
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 24 }}>
            Des milliers de clients nous font confiance pour illuminer leurs interieurs.
          </p>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "0.875rem 2rem", background: A, color: "#fff",
            fontWeight: 700, borderRadius: 10, textDecoration: "none"
          }} className="btn-primary">
            Explorer la boutique <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ────────────────────────────────────────────────
   Details
   ──────────────────────────────────────────────── */
export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
  const [sel, setSel] = useState(0);
  const [imgErr, setImgErr] = useState<Record<number, boolean>>({});

  const nextImg = () => setSel((s) => (s + 1) % allImages.length);
  const prevImg = () => setSel((s) => (s - 1 + allImages.length) % allImages.length);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div className="details-inner">
        <div>
          <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: BG, aspectRatio: "1 / 1", marginBottom: 12 }}>
            {allImages[sel] && !imgErr[sel] ? (
              <img src={allImages[sel]} alt={product.name} onError={() => setImgErr((p) => ({ ...p, [sel]: true }))}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Lamp size={60} color={BD} />
              </div>
            )}
            {allImages.length > 1 && (
              <>
                <button onClick={prevImg} style={{
                  position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                  width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.9)",
                  border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}><ChevronLeft size={20} /></button>
                <button onClick={nextImg} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.9)",
                  border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}><ChevronRight size={20} /></button>
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {allImages.map((img: string, i: number) => (
              <button key={i} onClick={() => setSel(i)} style={{
                width: 72, height: 72, borderRadius: 10, overflow: "hidden",
                border: sel === i ? `2px solid ${A}` : `2px solid ${BD}`,
                padding: 0, cursor: "pointer", flexShrink: 0, background: BG
              }}>
                <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, marginBottom: 12 }}>{product.name}</h1>
          <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={16} fill={s <= 4 ? "#F1C40F" : "none"} color={s <= 4 ? "#F1C40F" : BD} />
            ))}
            <span style={{ fontSize: "0.8rem", color: SUB, marginLeft: 6 }}>(24 avis)</span>
          </div>

          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: A, marginBottom: 20 }}>
            {Number(finalPrice).toLocaleString()} DA
            {discount > 0 && (
              <span style={{ fontSize: "1rem", color: SUB, textDecoration: "line-through", marginLeft: 12, fontWeight: 500 }}>
                {Number(product.priceOriginal).toLocaleString()} DA
              </span>
            )}
          </div>

          {product.offers && product.offers.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 10, color: SUB }}>Offres speciales</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {product.offers.map((o: Offer) => (
                  <label key={o.id} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                    borderRadius: 10, border: selectedOffer === o.id ? `2px solid ${A}` : `1px solid ${BD}`,
                    background: selectedOffer === o.id ? AL : CARD, cursor: "pointer"
                  }}>
                    <input type="radio" name="offer" checked={selectedOffer === o.id}
                      onChange={() => setSelectedOffer(o.id)} style={{ accentColor: A }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{o.name}</div>
                      <div style={{ fontSize: "0.75rem", color: SUB }}>{o.quantity} unites</div>
                    </div>
                    <div style={{ fontWeight: 700, color: A }}>{o.price.toLocaleString()} DA</div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {allAttrs && allAttrs.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              {allAttrs.map((attr: Attribute) => (
                <div key={attr.id} style={{ marginBottom: 14 }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 8, color: SUB }}>{attr.name}</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {attr.variants.map((v: Variant) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      if (attr.displayMode === "color") {
                        return (
                          <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)}
                            style={{
                              width: 32, height: 32, borderRadius: "50%",
                              background: v.value, border: isSel ? `3px solid ${A}` : "2px solid transparent",
                              boxShadow: isSel ? `0 0 0 2px ${AL}` : "none", cursor: "pointer"
                            }} title={v.value} />
                        );
                      }
                      if (attr.displayMode === "image") {
                        return (
                          <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)}
                            style={{
                              width: 40, height: 40, borderRadius: 8, overflow: "hidden",
                              border: isSel ? `2px solid ${A}` : `1px solid ${BD}`,
                              padding: 0, cursor: "pointer"
                            }}>
                            <img src={v.value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </button>
                        );
                      }
                      return (
                        <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)}
                          style={{
                            padding: "6px 16px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600,
                            border: isSel ? `2px solid ${A}` : `1px solid ${BD}`,
                            background: isSel ? AL : CARD, color: TXT, cursor: "pointer"
                          }}>
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
            userId={product.store.userId}
            domain={domain}
            selectedOffer={selectedOffer}
            setSelectedOffer={setSelectedOffer}
            selectedVariants={selectedVariants}
            platform="web"
          />

          {product.desc && (
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${BD}` }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 12 }}>Description</h3>
              <div style={{ fontSize: "0.9rem", lineHeight: 1.7, color: SUB }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   ProductForm
   ──────────────────────────────────────────────── */
export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform }: ProductFormProps) {
  const [fd, setFd] = useState({
    customerId: "", customerName: "", customerPhone: "",
    customerWelaya: "", customerCommune: "",
    quantity: 1, priceLoss: 0,
    typeLivraison: "home" as "home" | "office"
  });
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => {
    if (userId) fetchWilayas(userId).then(setWilayas);
  }, [userId]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const getVarId = useCallback(() => {
    if (!product.variantDetails || product.variantDetails.length === 0) return null;
    const match = product.variantDetails.find((d) => variantMatches(d, selectedVariants));
    return match ? match.id : null;
  }, [product.variantDetails, selectedVariants]);

  const getFP = useCallback((): number => {
    if (selectedOffer) {
      const o = product.offers?.find((x) => x.id === selectedOffer);
      if (o) return o.price;
    }
    if (product.variantDetails && product.variantDetails.length > 0) {
      const match = product.variantDetails.find((d) => variantMatches(d, selectedVariants));
      if (match && match.price !== -1) return match.price;
    }
    return Number(product.price);
  }, [selectedOffer, product, selectedVariants]);

  const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));

  const getLiv = useCallback((): number => {
    if (!selW) return 0;
    return fd.typeLivraison === "home" ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison]);

  const total = () => getFP() * fd.quantity + getLiv();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = "Le nom est requis";
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone)) e.customerPhone = "Numero invalide";
    if (!fd.customerWelaya) e.customerWelaya = "Selectionnez une wilaya";
    if (!fd.customerCommune) e.customerCommune = "Selectionnez une commune";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addToCart = () => {
    const arr = JSON.parse(localStorage.getItem(domain) || "[]");
    arr.push({
      ...fd, product, variantDetailId: getVarId(), productId: product.id,
      storeId: product.store.id, userId, selectedOffer, selectedVariants,
      platform, finalPrice: getFP(), totalPrice: total(), priceLivraison: getLiv(),
      addedAt: new Date().toISOString()
    });
    localStorage.setItem(domain, JSON.stringify(arr));
    initCount(arr.length);
  };

  const submitOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/orders/create`, {
        ...fd, product, variantDetailId: getVarId(), productId: product.id,
        storeId: product.store.id, userId, selectedOffer, selectedVariants,
        platform, finalPrice: getFP(), totalPrice: total(), priceLivraison: getLiv()
      });
      localStorage.setItem("customerId", fd.customerId || "");
      setSuccess(true);
      setTimeout(() => router.push(`/successfully?productId=${product.id}`), 800);
    } catch {
      setErrors({ submit: "Erreur lors de l'envoi. Reessayez." });
    }
    setSubmitting(false);
  };

  const inputBase: React.CSSProperties = {
    width: "100%", padding: "0.75rem 1rem", fontSize: "0.9rem",
    border: `1px solid ${BD}`, borderRadius: 10, background: BG,
    color: TXT, outline: "none", appearance: "none",
    fontFamily: "inherit"
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", background: AL, borderRadius: 16 }}>
        <CheckCircle size={48} color={A} style={{ marginBottom: 12 }} />
        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Commande envoyee !</h3>
        <p style={{ color: SUB, fontSize: "0.85rem" }}>Redirection en cours...</p>
      </div>
    );
  }

  return (
    <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BD}`, padding: "1.5rem" }}>
      {!isOrderNow && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: SUB }}>Quantite</span>
            <div style={{ display: "inline-flex", alignItems: "center", border: `1px solid ${BD}`, borderRadius: 10, overflow: "hidden" }}>
              <button onClick={() => setFd((p) => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                style={{ width: 36, height: 36, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Minus size={14} />
              </button>
              <span style={{ width: 40, textAlign: "center", fontWeight: 700 }}>{fd.quantity}</span>
              <button onClick={() => setFd((p) => ({ ...p, quantity: p.quantity + 1 }))}
                style={{ width: 36, height: 36, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            {product.store.cart === true && (
              <button onClick={addToCart} style={{
                flex: 1, padding: "0.875rem", background: BG, color: TXT,
                border: `1px solid ${BD}`, borderRadius: 10, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
              }}>
                <ShoppingCart size={16} /> Ajouter au panier
              </button>
            )}
            <button onClick={() => setIsOrderNow(true)} style={{
              flex: 1, padding: "0.875rem", background: A, color: "#fff",
              border: "none", borderRadius: 10, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit"
            }} className="btn-primary">
              Commander maintenant
            </button>
          </div>
        </>
      )}

      {isOrderNow && (
        <div style={{ animation: "fadeUp 0.4s ease" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16 }}>Informations de livraison</h3>

          <div className="form-row-2">
            <div>
              <input type="text" placeholder="Nom complet" value={fd.customerName}
                onChange={(e) => setFd((p) => ({ ...p, customerName: e.target.value }))}
                style={{ ...inputBase, borderColor: errors.customerName ? ERR : BD }} className="input-field" />
              {errors.customerName && <p style={{ fontSize: "0.75rem", color: ERR, marginTop: "0.3rem", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} /> {errors.customerName}</p>}
            </div>
            <div>
              <input type="tel" placeholder="Telephone (05/06/07...)" value={fd.customerPhone}
                onChange={(e) => setFd((p) => ({ ...p, customerPhone: e.target.value }))}
                style={{ ...inputBase, borderColor: errors.customerPhone ? ERR : BD }} className="input-field" />
              {errors.customerPhone && <p style={{ fontSize: "0.75rem", color: ERR, marginTop: "0.3rem", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} /> {errors.customerPhone}</p>}
            </div>
          </div>

          <div className="form-row-2">
            <div style={{ position: "relative" }}>
              <ChevronDown size={12} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: SUB }} />
              <select value={fd.customerWelaya} disabled={wilayas.length === 0}
                onChange={(e) => setFd((p) => ({ ...p, customerWelaya: e.target.value, customerCommune: "" }))}
                style={{ ...inputBase, paddingRight: 36, borderColor: errors.customerWelaya ? ERR : BD }} className="input-field">
                <option value="">{wilayas.length === 0 ? "Livraison indisponible" : "Selectionnez la wilaya"}</option>
                {wilayas.map((w) => (
                  <option key={w.id} value={w.id}>{w.id} - {w.name}</option>
                ))}
              </select>
              {errors.customerWelaya && <p style={{ fontSize: "0.75rem", color: ERR, marginTop: "0.3rem", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} /> {errors.customerWelaya}</p>}
            </div>
            <div style={{ position: "relative" }}>
              <ChevronDown size={12} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: SUB }} />
              <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC}
                onChange={(e) => setFd((p) => ({ ...p, customerCommune: e.target.value }))}
                style={{ ...inputBase, paddingRight: 36, borderColor: errors.customerCommune ? ERR : BD }} className="input-field">
                <option value="">{loadingC ? "Chargement..." : "Selectionnez la commune"}</option>
                {communes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.customerCommune && <p style={{ fontSize: "0.75rem", color: ERR, marginTop: "0.3rem", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} /> {errors.customerCommune}</p>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <button onClick={() => setFd((p) => ({ ...p, typeLivraison: "home" }))}
              style={{
                padding: "0.75rem", borderRadius: 10, fontWeight: 600, fontSize: "0.85rem",
                border: fd.typeLivraison === "home" ? `2px solid ${A}` : `1px solid ${BD}`,
                background: fd.typeLivraison === "home" ? AL : CARD, color: fd.typeLivraison === "home" ? A : SUB,
                cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
              }}>
              <HomeIcon size={16} /> A domicile
            </button>
            <button onClick={() => setFd((p) => ({ ...p, typeLivraison: "office" }))}
              style={{
                padding: "0.75rem", borderRadius: 10, fontWeight: 600, fontSize: "0.85rem",
                border: fd.typeLivraison === "office" ? `2px solid ${A}` : `1px solid ${BD}`,
                background: fd.typeLivraison === "office" ? AL : CARD, color: fd.typeLivraison === "office" ? A : SUB,
                cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
              }}>
              <Building2 size={16} /> Bureau de poste
            </button>
          </div>

          <div style={{ background: BG, borderRadius: 12, padding: "1rem", marginBottom: 16 }}>
            {[
              { l: "Prix unitaire", v: `${getFP().toLocaleString()} DA` },
              { l: "Quantite", v: `x ${fd.quantity}` },
              { l: "Livraison", v: selW ? `${getLiv().toLocaleString()} DA` : "—" },
            ].map((row) => (
              <div key={row.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${BD}` }}>
                <span style={{ color: SUB, fontSize: "0.85rem", flexShrink: 0 }}>{row.l}</span>
                <span style={{ whiteSpace: "nowrap", fontWeight: 600, fontSize: "0.9rem" }}>{row.v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, marginTop: 4 }}>
              <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Total</span>
              <span style={{ whiteSpace: "nowrap", fontWeight: 800, fontSize: "1.1rem", color: A }}>{total().toLocaleString()} DA</span>
            </div>
          </div>

          {errors.submit && (
            <p style={{ color: ERR, fontSize: "0.85rem", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <AlertCircle size={14} /> {errors.submit}
            </p>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={submitOrder} disabled={submitting} style={{
              flex: 1, padding: "0.875rem", background: A, color: "#fff",
              border: "none", borderRadius: 10, fontWeight: 700,
              cursor: submitting ? "default" : "pointer", fontFamily: "inherit",
              opacity: submitting ? 0.65 : 1
            }} className="btn-primary">
              {submitting ? "Envoi en cours..." : "Confirmer la commande"}
            </button>
            <button onClick={() => setIsOrderNow(false)} disabled={submitting} style={{
              flex: 1, padding: "0.875rem", background: "transparent", color: SUB,
              border: `1px solid ${BD}`, borderRadius: 10, fontWeight: 600,
              cursor: submitting ? "default" : "pointer", fontFamily: "inherit"
            }}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────
   Cart
   ──────────────────────────────────────────────── */
export function Cart({ domain, store }: { domain: string; store: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [fd, setFd] = useState({
    customerId: "", customerName: "", customerPhone: "",
    customerWelaya: "", customerCommune: "",
    typeLivraison: "home" as "home" | "office"
  });
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => {
    const saved = localStorage.getItem(domain);
    if (saved) setItems(JSON.parse(saved));
  }, [domain]);

  useEffect(() => {
    if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas);
  }, [store]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const removeItem = (idx: number) => {
    const arr = [...items];
    arr.splice(idx, 1);
    setItems(arr);
    localStorage.setItem(domain, JSON.stringify(arr));
    initCount(arr.length);
  };

  const cartTotal = items.reduce((sum, it) => sum + (Number(it.finalPrice || it.product?.price || 0) * (it.quantity || 1)), 0);

  const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));

  const getLiv = useCallback((): number => {
    if (!selW) return 0;
    return fd.typeLivraison === "home" ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison]);

  const finalTotal = cartTotal + getLiv();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = "Le nom est requis";
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone)) e.customerPhone = "Numero invalide";
    if (!fd.customerWelaya) e.customerWelaya = "Selectionnez une wilaya";
    if (!fd.customerCommune) e.customerCommune = "Selectionnez une commune";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      for (const it of items) {
        await axios.post(`${API_URL}/orders/create`, {
          ...fd, ...it, priceLivraison: getLiv(), totalPrice: (Number(it.finalPrice || it.product?.price || 0) * (it.quantity || 1)) + getLiv()
        });
      }
      localStorage.removeItem(domain);
      initCount(0);
      setSuccess(true);
    } catch {
      setErrors({ submit: "Erreur lors de l'envoi. Reessayez." });
    }
    setSubmitting(false);
  };

  const inputBase: React.CSSProperties = {
    width: "100%", padding: "0.75rem 1rem", fontSize: "0.9rem",
    border: `1px solid ${BD}`, borderRadius: 10, background: BG,
    color: TXT, outline: "none", appearance: "none",
    fontFamily: "inherit"
  };

  if (success) {
    return (
      <div style={{ maxWidth: 600, margin: "4rem auto", textAlign: "center", padding: "2rem" }}>
        <CheckCircle size={64} color={A} style={{ marginBottom: 16 }} />
        <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Commande confirmee !</h2>
        <p style={{ color: SUB, marginBottom: 24 }}>Merci pour votre achat. Nous vous contacterons bientot.</p>
        <Link href="/" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "0.875rem 1.5rem", background: A, color: "#fff",
          fontWeight: 700, borderRadius: 10, textDecoration: "none"
        }} className="btn-primary">
          Continuer les achats <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: "4rem auto", textAlign: "center", padding: "2rem" }}>
        <ShoppingCart size={64} color={BD} style={{ marginBottom: 16 }} />
        <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Votre panier est vide</h2>
        <p style={{ color: SUB, marginBottom: 24 }}>Decouvrez nos produits et ajoutez-les a votre panier.</p>
        <Link href="/" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "0.875rem 1.5rem", background: A, color: "#fff",
          fontWeight: 700, borderRadius: 10, textDecoration: "none"
        }} className="btn-primary">
          Explorer les produits <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Mon Panier ({items.length})</h1>
      <div className="cart-inner">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((it, idx) => {
            const img = it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl;
            const price = Number(it.finalPrice || it.product?.price || 0);
            const qty = it.quantity || 1;
            return (
              <div key={idx} style={{ display: "flex", gap: 16, background: CARD, borderRadius: 16, border: `1px solid ${BD}`, padding: "1rem", alignItems: "center" }}>
                <div style={{ width: 80, height: 80, borderRadius: 10, overflow: "hidden", background: BG, flexShrink: 0 }}>
                  {img ? (
                    <img src={img} alt={it.product?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Lamp size={28} color={BD} />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.product?.name}</h4>
                  <p style={{ fontSize: "0.8rem", color: SUB, marginBottom: 4 }}>Qte: {qty}</p>
                  <p style={{ fontWeight: 700, color: A, fontSize: "0.95rem" }}>{(price * qty).toLocaleString()} {store?.currency || "DA"}</p>
                </div>
                <button onClick={() => removeItem(idx)} style={{
                  background: "none", border: "none", cursor: "pointer", padding: 8, color: ERR,
                  borderRadius: 8, transition: "background 0.2s"
                }} onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BD}`, padding: "1.5rem", height: "fit-content" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16 }}>Informations de livraison</h3>

          <div className="form-row-2">
            <div>
              <input type="text" placeholder="Nom complet" value={fd.customerName}
                onChange={(e) => setFd((p) => ({ ...p, customerName: e.target.value }))}
                style={{ ...inputBase, borderColor: errors.customerName ? ERR : BD }} className="input-field" />
              {errors.customerName && <p style={{ fontSize: "0.75rem", color: ERR, marginTop: "0.3rem", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} /> {errors.customerName}</p>}
            </div>
            <div>
              <input type="tel" placeholder="Telephone" value={fd.customerPhone}
                onChange={(e) => setFd((p) => ({ ...p, customerPhone: e.target.value }))}
                style={{ ...inputBase, borderColor: errors.customerPhone ? ERR : BD }} className="input-field" />
              {errors.customerPhone && <p style={{ fontSize: "0.75rem", color: ERR, marginTop: "0.3rem", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} /> {errors.customerPhone}</p>}
            </div>
          </div>

          <div className="form-row-2">
            <div style={{ position: "relative" }}>
              <ChevronDown size={12} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: SUB }} />
              <select value={fd.customerWelaya} disabled={wilayas.length === 0}
                onChange={(e) => setFd((p) => ({ ...p, customerWelaya: e.target.value, customerCommune: "" }))}
                style={{ ...inputBase, paddingRight: 36, borderColor: errors.customerWelaya ? ERR : BD }} className="input-field">
                <option value="">{wilayas.length === 0 ? "Livraison indisponible" : "Selectionnez la wilaya"}</option>
                {wilayas.map((w) => (
                  <option key={w.id} value={w.id}>{w.id} - {w.name}</option>
                ))}
              </select>
              {errors.customerWelaya && <p style={{ fontSize: "0.75rem", color: ERR, marginTop: "0.3rem", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} /> {errors.customerWelaya}</p>}
            </div>
            <div style={{ position: "relative" }}>
              <ChevronDown size={12} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: SUB }} />
              <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC}
                onChange={(e) => setFd((p) => ({ ...p, customerCommune: e.target.value }))}
                style={{ ...inputBase, paddingRight: 36, borderColor: errors.customerCommune ? ERR : BD }} className="input-field">
                <option value="">{loadingC ? "Chargement..." : "Selectionnez la commune"}</option>
                {communes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.customerCommune && <p style={{ fontSize: "0.75rem", color: ERR, marginTop: "0.3rem", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} /> {errors.customerCommune}</p>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <button onClick={() => setFd((p) => ({ ...p, typeLivraison: "home" }))}
              style={{
                padding: "0.75rem", borderRadius: 10, fontWeight: 600, fontSize: "0.85rem",
                border: fd.typeLivraison === "home" ? `2px solid ${A}` : `1px solid ${BD}`,
                background: fd.typeLivraison === "home" ? AL : CARD, color: fd.typeLivraison === "home" ? A : SUB,
                cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
              }}>
              <HomeIcon size={16} /> A domicile
            </button>
            <button onClick={() => setFd((p) => ({ ...p, typeLivraison: "office" }))}
              style={{
                padding: "0.75rem", borderRadius: 10, fontWeight: 600, fontSize: "0.85rem",
                border: fd.typeLivraison === "office" ? `2px solid ${A}` : `1px solid ${BD}`,
                background: fd.typeLivraison === "office" ? AL : CARD, color: fd.typeLivraison === "office" ? A : SUB,
                cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
              }}>
              <Building2 size={16} /> Bureau de poste
            </button>
          </div>

          <div style={{ background: BG, borderRadius: 12, padding: "1rem", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${BD}` }}>
              <span style={{ color: SUB, fontSize: "0.85rem", flexShrink: 0 }}>Sous-total</span>
              <span style={{ whiteSpace: "nowrap", fontWeight: 600, fontSize: "0.9rem" }}>{cartTotal.toLocaleString()} {store?.currency || "DA"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${BD}` }}>
              <span style={{ color: SUB, fontSize: "0.85rem", flexShrink: 0 }}>Livraison</span>
              <span style={{ whiteSpace: "nowrap", fontWeight: 600, fontSize: "0.9rem" }}>{selW ? `${getLiv().toLocaleString()} ${store?.currency || "DA"}` : "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, marginTop: 4 }}>
              <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Total</span>
              <span style={{ whiteSpace: "nowrap", fontWeight: 800, fontSize: "1.1rem", color: A }}>{finalTotal.toLocaleString()} {store?.currency || "DA"}</span>
            </div>
          </div>

          {errors.submit && (
            <p style={{ color: ERR, fontSize: "0.85rem", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <AlertCircle size={14} /> {errors.submit}
            </p>
          )}

          <button onClick={submitOrder} disabled={submitting} style={{
            width: "100%", padding: "0.875rem", background: A, color: "#fff",
            border: "none", borderRadius: 10, fontWeight: 700,
            cursor: submitting ? "default" : "pointer", fontFamily: "inherit",
            opacity: submitting ? 0.65 : 1, minHeight: 44
          }} className="btn-primary">
            {submitting ? "Envoi en cours..." : "Confirmer la commande"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   Static Pages
   ──────────────────────────────────────────────── */
function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        background: DARK, color: "#fff", padding: "4rem 1.5rem 3rem",
        textAlign: "center", position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle at 50% 50%, rgba(212,165,116,0.1) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, position: "relative", zIndex: 1 }}>{title}</h1>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.5rem" }}>
        {children}
      </div>
    </div>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 10, color: TXT }}>{title}</h3>
      <p style={{ color: SUB, lineHeight: 1.7, fontSize: "0.9rem" }}>{body}</p>
    </div>
  );
}

export function Privacy() {
  return (
    <Shell title="Politique de Confidentialite">
      <InfoBlock title="1. Collecte des donnees" body="Nous collectons uniquement les informations necessaires au traitement de vos commandes : nom, telephone, adresse de livraison. Ces donnees ne sont jamais partagees avec des tiers." />
      <InfoBlock title="2. Utilisation des cookies" body="Notre site utilise des cookies essentiels pour le fonctionnement du panier et de la navigation. Aucun cookie publicitaire n'est utilise." />
      <InfoBlock title="3. Vos droits" body="Vous pouvez demander la suppression de vos donnees a tout moment en nous contactant via la page de contact." />
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="Conditions Generales">
      <InfoBlock title="1. Commandes" body="Toute commande passee sur notre boutique engage l'acheteur. Le paiement s'effectue a la livraison selon les modalites convenues." />
      <InfoBlock title="2. Livraison" body="Les delais de livraison sont indicatifs et peuvent varier selon la wilaya de destination. Les frais de livraison sont calcules automatiquement." />
      <InfoBlock title="3. Retours" body="Les retours sont acceptes dans un delai de 7 jours suivant la reception, sous reserve que le produit soit dans son etat d'origine." />
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="Politique des Cookies">
      <InfoBlock title="1. Cookies essentiels" body="Ces cookies sont necessaires au fonctionnement du site (panier, preferences de langue, session)." />
      <InfoBlock title="2. Cookies analytiques" body="Nous utilisons des outils anonymises pour comprendre comment les visiteurs utilisent notre site et l'ameliorer." />
      <InfoBlock title="3. Gestion des preferences" body="Vous pouvez modifier vos preferences de cookies a tout moment via les parametres de votre navigateur." />
    </Shell>
  );
}

export function Contact({ store }: { store: any }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store?.id });
      setSent(true);
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  if (sent) {
    return (
      <div style={{ maxWidth: 600, margin: "4rem auto", textAlign: "center", padding: "2rem" }}>
        <CheckCircle size={64} color={A} style={{ marginBottom: 16 }} />
        <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Message envoye !</h2>
        <p style={{ color: SUB, marginBottom: 24 }}>Nous vous repondrons dans les plus brefs delais.</p>
        <button onClick={() => setSent(false)} style={{
          padding: "0.875rem 1.5rem", background: A, color: "#fff",
          fontWeight: 700, borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit"
        }} className="btn-primary">
          Envoyer un autre message
        </button>
      </div>
    );
  }

  const inputBase: React.CSSProperties = {
    width: "100%", padding: "0.75rem 1rem", fontSize: "0.9rem",
    border: `1px solid ${BD}`, borderRadius: 10, background: BG,
    color: TXT, outline: "none", fontFamily: "inherit"
  };

  return (
    <div>
      <div style={{
        background: DARK, color: "#fff", padding: "4rem 1.5rem 3rem", textAlign: "center"
      }}>
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, marginBottom: 12 }}>Contactez-nous</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 500, margin: "0 auto" }}>Une question ? Nous sommes la pour vous aider.</p>
      </div>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "3rem 1.5rem", display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 20 }}>Informations de contact</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {store?.contact?.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: AL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Phone size={18} color={A} />
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: SUB }}>Telephone</div>
                  <div style={{ fontWeight: 600 }}>{store.contact.phone}</div>
                </div>
              </div>
            )}
            {store?.contact?.email && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: AL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Mail size={18} color={A} />
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: SUB }}>Email</div>
                  <div style={{ fontWeight: 600 }}>{store.contact.email}</div>
                </div>
              </div>
            )}
            {store?.contact?.wilaya && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: AL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MapPin size={18} color={A} />
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: SUB }}>Adresse</div>
                  <div style={{ fontWeight: 600 }}>{store.contact.wilaya} {store.contact.address || ""}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={submit} style={{ background: CARD, borderRadius: 16, border: `1px solid ${BD}`, padding: "1.5rem" }}>
          <div className="form-row-2">
            <input type="text" placeholder="Votre nom" required value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              style={inputBase} className="input-field" />
            <input type="email" placeholder="Votre email" required value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              style={inputBase} className="input-field" />
          </div>
          <div style={{ marginBottom: "0.875rem" }}>
            <input type="tel" placeholder="Telephone" value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              style={inputBase} className="input-field" />
          </div>
          <div style={{ marginBottom: "0.875rem" }}>
            <textarea placeholder="Votre message..." required rows={5} value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              style={{ ...inputBase, resize: "none" }} className="input-field" />
          </div>
          <button type="submit" disabled={submitting} style={{
            width: "100%", padding: "0.875rem", background: A, color: "#fff",
            border: "none", borderRadius: 10, fontWeight: 700,
            cursor: submitting ? "default" : "pointer", fontFamily: "inherit",
            opacity: submitting ? 0.65 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8
          }} className="btn-primary">
            <Send size={16} /> {submitting ? "Envoi..." : "Envoyer le message"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function StaticPage({ staticPage, page, store }: { staticPage?: string; page?: string; store: any }) {
  const p = (staticPage || page || "").toLowerCase();
  if (p.includes("privacy")) return <Privacy />;
  if (p.includes("terms")) return <Terms />;
  if (p.includes("cookies")) return <Cookies />;
  if (p.includes("contact")) return <Contact store={store} />;
  return <Privacy />;
}
