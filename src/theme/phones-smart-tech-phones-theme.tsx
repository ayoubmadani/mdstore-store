'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';
import {
  Search, ShoppingCart, Menu, X, ChevronDown, ChevronLeft, ChevronRight,
  Star, Phone, Mail, MapPin, Trash2, AlertCircle, Plus, Minus, Cpu,
  ShieldCheck, Truck, Headset, Crosshair, ImageOff,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

/* ======================================================================
   1. TYPES
====================================================================== */
interface Offer { id: string; name: string; quantity: number; price: number; }
interface Variant { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color' | 'image' | 'text' | null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color' | 'image' | 'text'; value: string; }
interface VariantDetail { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }

interface Product {
  id: string; name: string; price: string | number; priceOriginal?: string | number; desc?: string;
  slug?: string;
  productImage?: string; imagesProduct?: ProductImage[]; offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; };
}

interface StoreShape {
  id: string; name: string; currency?: string; cart?: boolean;
  design?: { logoUrl?: string; };
  hero?: { title?: string; subtitle?: string; imageUrl?: string; };
  topBar?: { enabled?: boolean; text?: string; };
  contact?: { phone?: string; email?: string; wilaya?: string; address?: string; };
  categories?: { id: string; name: string; }[];
  products?: Product[];
  count?: number;
  user?: { id: string; };
}

/* ======================================================================
   2. HELPERS / FIXED API
====================================================================== */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some((e) => e.attrName === n && e.value === v));
}

const fetchWilayas = async (uid: string): Promise<Wilaya[]> => {
  if (!uid) return [];
  try {
    const r = await fetch(`${API_URL}/shipping/public/get-shipping/${uid}`);
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : [];
  } catch { return []; }
};

const fetchCommunes = async (wid: string): Promise<Commune[]> => {
  if (!wid) return [];
  try {
    const r = await fetch(`${API_URL}/shipping/get-communes/${wid}`);
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : [];
  } catch { return []; }
};

const fmtPrice = (n: number) => `${Math.round(n).toLocaleString('fr-FR')}`;
const sku = (id: string) => `SKU-${id.replace(/-/g, '').slice(-6).toUpperCase()}`;

/* ======================================================================
   3. GLOBAL STYLES (design tokens + component classes)
   Palette: clinical off-white "spec sheet" base, ink text, single
   restrained electric-blue accent used only for interaction/price.
   Signature element: corner-bracket "focus reticle" frame, echoed on
   hero, cards, gallery and image tiles — a diagnostics/precision motif
   grounded in the tech/gadget subject matter.
====================================================================== */
const THEME_CSS = `
:root{
  --bg:#F5F6F8; --surface:#FFFFFF; --card:#FFFFFF; --ink:#0E1116; --sub:#666E7A;
  --border:#DCE0E5; --border-strong:#0E1116; --accent:#2151FF; --accent-dark:#1638C4;
  --accent-light:#E9EDFF; --danger:#E4392E;
  --f-ar:'Segoe UI',Tahoma,Geneva,Arial,sans-serif;
  --f-mono:ui-monospace,'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;
  --radius:2px;
}
*{box-sizing:border-box;}
.mdst-root{font-family:var(--f-ar);color:var(--ink);background:var(--bg);min-height:100vh;}
.mdst-root a{text-decoration:none;color:inherit;}
.mdst-root button{font-family:inherit;cursor:pointer;}
.mdst-container{max-width:1280px;margin:0 auto;padding:0 1.25rem;}
.mono{font-family:var(--f-mono);letter-spacing:0.02em;}

/* ---------- NAVBAR ---------- */
.mdst-topbar{background:var(--ink);color:#fff;font-family:var(--f-mono);font-size:.72rem;text-align:center;padding:.4rem .75rem;letter-spacing:.04em;}
.mdst-navbar{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--border);transition:box-shadow .2s;}
.mdst-navbar.scrolled{box-shadow:0 2px 14px rgba(14,17,22,.08);}
.mdst-nav-inner{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.85rem 1.25rem;max-width:1280px;margin:0 auto;}
.mdst-logo{display:flex;align-items:center;gap:.5rem;font-weight:800;font-size:1.05rem;}
.mdst-logo-badge{width:34px;height:34px;border:1.5px solid var(--border-strong);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.mdst-nav-links{display:flex;align-items:center;gap:1.75rem;list-style:none;margin:0;padding:0;}
.mdst-nav-link{font-size:.92rem;font-weight:600;position:relative;padding:.25rem 0;}
.mdst-nav-link::after{content:'';position:absolute;bottom:-3px;right:0;left:0;height:2px;background:var(--accent);transform:scaleX(0);transition:transform .18s;}
.mdst-nav-link:hover::after{transform:scaleX(1);}
.mdst-nav-actions{display:flex;align-items:center;gap:.6rem;}
.mdst-icon-btn{width:38px;height:38px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border);background:#fff;position:relative;}
.mdst-icon-btn:hover{border-color:var(--border-strong);}
.mdst-cart-badge{position:absolute;top:-6px;left:-6px;background:var(--accent);color:#fff;font-family:var(--f-mono);font-size:.65rem;min-width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;padding:0 3px;}
.mdst-search-wrap{position:relative;}
.mdst-search-dropdown{position:absolute;top:calc(100% + 8px);left:0;width:340px;background:#fff;border:1px solid var(--border-strong);box-shadow:0 12px 24px rgba(14,17,22,.14);max-height:380px;overflow-y:auto;z-index:60;}
.mdst-search-row{display:flex;gap:.6rem;align-items:center;padding:.6rem .75rem;border-bottom:1px solid var(--border);}
.mdst-search-row img{width:42px;height:42px;object-fit:cover;border:1px solid var(--border);flex-shrink:0;}
.mdst-search-empty{padding:1rem;font-size:.85rem;color:var(--sub);text-align:center;}
.mdst-search-viewall{display:block;text-align:center;padding:.6rem;font-family:var(--f-mono);font-size:.75rem;font-weight:700;color:var(--accent);}
.mdst-burger{display:none;width:38px;height:38px;align-items:center;justify-content:center;border:1px solid var(--border);background:#fff;}
.mdst-mobile-menu{position:fixed;inset:0;background:#fff;z-index:100;padding:1.25rem;display:flex;flex-direction:column;}
.mdst-mobile-menu-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;}
.mdst-mobile-link{display:block;font-size:1.4rem;font-weight:800;padding:.9rem 0;border-bottom:1px solid var(--border);}
@media (max-width:1024px){
  .mdst-nav-links{display:none;}
  .mdst-burger{display:flex;}
}
@media (max-width:480px){
  .mdst-search-dropdown{position:fixed;top:64px;left:12px;right:12px;width:auto;}
}

/* ---------- HERO ---------- */
.mdst-hero{position:relative;min-height:clamp(480px,68vh,760px);display:flex;align-items:stretch;overflow:hidden;border-bottom:1px solid var(--border);background:
  linear-gradient(var(--border) 1px,transparent 1px) 0 0/40px 40px,
  linear-gradient(90deg,var(--border) 1px,transparent 1px) 0 0/40px 40px,
  var(--bg);
}
.mdst-hero-grid{max-width:1280px;margin:0 auto;width:100%;display:grid;grid-template-columns:1fr;align-items:center;padding:3rem 1.25rem;position:relative;gap:2rem;}
.mdst-hero-eyebrow{display:inline-flex;align-items:center;gap:.5rem;font-family:var(--f-mono);font-size:.75rem;font-weight:700;color:var(--accent);border:1px solid var(--accent);padding:.3rem .7rem;width:fit-content;margin-bottom:1.1rem;}
.mdst-hero-title{font-size:clamp(2.1rem,6vw,4.2rem);font-weight:800;line-height:1.08;margin:0 0 1.1rem;letter-spacing:-.01em;}
.mdst-hero-sub{font-size:clamp(1rem,2vw,1.2rem);color:var(--sub);max-width:520px;margin:0 0 1.75rem;line-height:1.6;}
.mdst-hero-ctas{display:flex;gap:.85rem;flex-wrap:wrap;}
.mdst-hero-media{position:relative;aspect-ratio:4/3;border:1.5px solid var(--border-strong);background:var(--surface);overflow:hidden;}
.mdst-hero-media img{width:100%;height:100%;object-fit:cover;display:block;}
.mdst-reticle{position:absolute;width:26px;height:26px;pointer-events:none;}
.mdst-reticle.tl{top:-1.5px;right:-1.5px;border-top:2.5px solid var(--accent);border-right:2.5px solid var(--accent);}
.mdst-reticle.tr{top:-1.5px;left:-1.5px;border-top:2.5px solid var(--accent);border-left:2.5px solid var(--accent);}
.mdst-reticle.bl{bottom:-1.5px;right:-1.5px;border-bottom:2.5px solid var(--accent);border-right:2.5px solid var(--accent);}
.mdst-reticle.br{bottom:-1.5px;left:-1.5px;border-bottom:2.5px solid var(--accent);border-left:2.5px solid var(--accent);}
@media (min-width:1024px){ .mdst-hero-grid{grid-template-columns:1.1fr .9fr;} }

/* ---------- BUTTONS ---------- */
.mdst-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;min-height:44px;padding:.85rem 1.5rem;font-weight:700;font-size:.9rem;border:1.5px solid var(--border-strong);border-radius:var(--radius);transition:all .15s;font-family:inherit;}
.mdst-btn-primary{background:var(--ink);color:#fff;}
.mdst-btn-primary:hover{background:var(--accent);border-color:var(--accent);}
.mdst-btn-secondary{background:transparent;color:var(--ink);}
.mdst-btn-secondary:hover{background:var(--ink);color:#fff;}
.mdst-btn-accent{background:var(--accent);color:#fff;border-color:var(--accent);width:100%;}
.mdst-btn-accent:hover{background:var(--accent-dark);border-color:var(--accent-dark);}
.mdst-btn-accent:disabled{opacity:.5;cursor:default;}
.mdst-btn-outline{background:transparent;color:var(--accent);border-color:var(--accent);width:100%;}
.mdst-btn-outline:hover{background:var(--accent);color:#fff;}

/* ---------- TRUST BAR ---------- */
.mdst-trust{border-bottom:1px solid var(--border);background:var(--surface);}
.mdst-trust-grid{max-width:1280px;margin:0 auto;padding:1.4rem 1.25rem;display:grid;grid-template-columns:repeat(2,1fr);gap:1.25rem;}
.mdst-trust-item{display:flex;align-items:center;gap:.7rem;}
.mdst-trust-item .ic{width:38px;height:38px;border:1px solid var(--border-strong);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.mdst-trust-item b{display:block;font-size:.85rem;}
.mdst-trust-item span{display:block;font-size:.72rem;color:var(--sub);}
@media (min-width:768px){ .mdst-trust-grid{grid-template-columns:repeat(4,1fr);} }

/* ---------- CATEGORIES ---------- */
.mdst-cats{padding:2rem 1.25rem 0;max-width:1280px;margin:0 auto;}
.mdst-cats-row{display:flex;gap:.6rem;flex-wrap:wrap;}
.mdst-cat-chip{font-family:var(--f-mono);font-size:.78rem;font-weight:700;padding:.5rem 1rem;border:1.5px solid var(--border);background:#fff;white-space:nowrap;}
.mdst-cat-chip.active{border-color:var(--ink);background:var(--ink);color:#fff;}

/* ---------- PRODUCTS GRID ---------- */
.mdst-products{padding:2rem 1.25rem 4rem;max-width:1280px;margin:0 auto;}
.mdst-section-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:1.25rem;}
.mdst-section-title{font-size:1.4rem;font-weight:800;}
.mdst-products-grid{display:grid;grid-template-columns:1fr;gap:1.1rem;}
@media (min-width:640px){ .mdst-products-grid{grid-template-columns:repeat(2,1fr);} }
@media (min-width:1024px){ .mdst-products-grid{grid-template-columns:repeat(3,1fr);} }
@media (min-width:1280px){ .mdst-products-grid{grid-template-columns:repeat(4,1fr);} }

/* ---------- CARD ---------- */
.mdst-card{position:relative;border:1px solid var(--border);background:var(--card);display:flex;flex-direction:column;transition:border-color .15s,transform .12s;}
.mdst-card:hover{border-color:var(--border-strong);}
.mdst-card:hover .mdst-reticle{opacity:1;}
.mdst-card .mdst-reticle{opacity:0;transition:opacity .15s;width:18px;height:18px;}
.mdst-card-imgwrap{position:relative;aspect-ratio:1/1;background:var(--bg);overflow:hidden;}
.mdst-card-imgwrap img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s;}
.mdst-card:hover .mdst-card-imgwrap img{transform:scale(1.04);}
.mdst-card-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--sub);}
.mdst-card-badge{position:absolute;top:8px;left:8px;background:var(--danger);color:#fff;font-family:var(--f-mono);font-size:.68rem;font-weight:700;padding:.2rem .5rem;}
.mdst-card-sku{position:absolute;top:8px;right:8px;font-family:var(--f-mono);font-size:.62rem;color:var(--sub);background:rgba(255,255,255,.9);padding:.15rem .4rem;border:1px solid var(--border);}
.mdst-card-body{padding:.9rem;display:flex;flex-direction:column;gap:.4rem;flex:1;}
.mdst-card-name{font-size:.9rem;font-weight:700;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.5em;}
.mdst-card-stars{display:flex;gap:2px;}
.mdst-card-price-row{display:flex;align-items:baseline;gap:.5rem;margin-top:auto;font-family:var(--f-mono);}
.mdst-price-now{font-size:1.05rem;font-weight:800;color:var(--ink);}
.mdst-price-orig{font-size:.8rem;color:var(--sub);text-decoration:line-through;}

/* ---------- PAGINATION ---------- */
.mdst-pagination{display:flex;justify-content:center;gap:.4rem;margin-top:2.5rem;flex-wrap:wrap;}
.mdst-page-btn{min-width:38px;height:38px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border);font-family:var(--f-mono);font-size:.82rem;font-weight:700;background:#fff;}
.mdst-page-btn.active{background:var(--ink);color:#fff;border-color:var(--ink);}

/* ---------- DETAILS ---------- */
.mdst-details{padding:2.5rem 1.25rem 4rem;max-width:1280px;margin:0 auto;}
.mdst-details-inner{display:grid;grid-template-columns:1fr;gap:2rem;}
@media (min-width:768px){ .mdst-details-inner{grid-template-columns:1fr 1fr;} }
.mdst-gallery-main{position:relative;aspect-ratio:1/1;border:1px solid var(--border);background:var(--surface);overflow:hidden;}
.mdst-gallery-main img{width:100%;height:100%;object-fit:cover;display:block;}
.mdst-gallery-navbtn{position:absolute;top:50%;transform:translateY(-50%);width:38px;height:38px;background:#fff;border:1px solid var(--border-strong);display:flex;align-items:center;justify-content:center;}
.mdst-gallery-navbtn.left{left:10px;} .mdst-gallery-navbtn.right{right:10px;}
.mdst-thumbs{display:flex;gap:.5rem;margin-top:.75rem;overflow-x:auto;}
.mdst-thumb{width:64px;height:64px;flex-shrink:0;border:1.5px solid var(--border);overflow:hidden;}
.mdst-thumb.active{border-color:var(--accent);}
.mdst-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
.mdst-details-name{font-size:1.6rem;font-weight:800;margin:0 0 .5rem;}
.mdst-final-price{font-family:var(--f-mono);font-size:1.9rem;font-weight:800;color:var(--accent);margin:.75rem 0;}
.mdst-offer-list{display:flex;flex-direction:column;gap:.5rem;margin:1rem 0;}
.mdst-offer-item{display:flex;align-items:center;gap:.6rem;border:1.5px solid var(--border);padding:.7rem .9rem;}
.mdst-offer-item.active{border-color:var(--accent);background:var(--accent-light);}
.mdst-attr-group{margin-bottom:1rem;}
.mdst-attr-label{font-family:var(--f-mono);font-size:.75rem;font-weight:700;color:var(--sub);margin-bottom:.5rem;display:block;}
.mdst-attr-row{display:flex;gap:.5rem;flex-wrap:wrap;}
.mdst-swatch-color{width:34px;height:34px;border:2px solid var(--border);cursor:pointer;}
.mdst-swatch-color.active{border-color:var(--ink);outline:2px solid var(--accent);outline-offset:2px;}
.mdst-swatch-image{width:44px;height:44px;border:2px solid var(--border);overflow:hidden;cursor:pointer;}
.mdst-swatch-image img{width:100%;height:100%;object-fit:cover;}
.mdst-swatch-image.active{border-color:var(--accent);}
.mdst-swatch-text{padding:.5rem 1rem;border:1.5px solid var(--border);font-size:.85rem;font-weight:600;cursor:pointer;}
.mdst-swatch-text.active{border-color:var(--ink);background:var(--ink);color:#fff;}
.mdst-desc{margin-top:2rem;padding-top:2rem;border-top:1px solid var(--border);line-height:1.9;color:var(--sub);font-size:.92rem;}

/* ---------- FORM ELEMENTS ---------- */
.mdst-input,.mdst-textarea{width:100%;padding:.75rem 1rem;font-size:.9rem;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);color:var(--ink);outline:none;appearance:none;transition:border-color .2s;font-family:inherit;min-height:44px;}
.mdst-input:focus,.mdst-textarea:focus{border-color:var(--accent);}
.mdst-input.err,.mdst-textarea.err{border-color:var(--danger);}
.mdst-textarea{resize:none;min-height:120px;}
.mdst-select-wrap{position:relative;}
.mdst-select-wrap .chev{position:absolute;left:14px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--sub);}
.mdst-select-wrap select{padding-left:36px;}
.mdst-error-text{font-size:.75rem;color:var(--danger);margin-top:.3rem;display:flex;align-items:center;gap:4px;}
.mdst-field-label{font-family:var(--f-mono);font-size:.72rem;font-weight:700;color:var(--sub);margin-bottom:.35rem;display:block;}
.mdst-form-row-2{display:grid;grid-template-columns:1fr;gap:.875rem;margin-bottom:.875rem;}
@media (min-width:500px){ .mdst-form-row-2{grid-template-columns:1fr 1fr;} }
.mdst-field{margin-bottom:.875rem;}
.mdst-qty-control{display:inline-flex;align-items:stretch;border:1px solid var(--border);width:fit-content;}
.mdst-qty-control button{width:38px;height:38px;display:flex;align-items:center;justify-content:center;background:#fff;border:none;}
.mdst-qty-control button:hover{background:var(--bg);}
.mdst-qty-control span{width:44px;display:flex;align-items:center;justify-content:center;font-family:var(--f-mono);font-weight:700;border-inline:1px solid var(--border);}
.mdst-delivery-toggle{display:grid;grid-template-columns:1fr 1fr;gap:.6rem;}
.mdst-delivery-opt{border:1.5px solid var(--border);padding:.7rem;text-align:center;font-size:.85rem;font-weight:700;}
.mdst-delivery-opt.active{border-color:var(--accent);background:var(--accent-light);color:var(--accent-dark);}

/* ---------- ORDER SUMMARY ---------- */
.mdst-summary{border:1px solid var(--border-strong);padding:1.1rem;margin-top:1rem;background:var(--surface);}
.mdst-summary-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:.4rem 0;font-size:.88rem;}
.mdst-summary-row span:first-child{flex-shrink:0;color:var(--sub);}
.mdst-summary-row span:last-child{white-space:nowrap;flex-shrink:0;font-family:var(--f-mono);font-weight:700;}
.mdst-summary-row.total{border-top:1.5px solid var(--border-strong);margin-top:.4rem;padding-top:.7rem;font-size:1.05rem;}
.mdst-summary-row.total span:last-child{font-size:1.2rem;color:var(--accent);}

/* ---------- CART ---------- */
.mdst-cart-page{padding:2.5rem 1.25rem 4rem;max-width:1280px;margin:0 auto;}
.mdst-cart-inner{display:grid;grid-template-columns:1fr;gap:2rem;}
@media (min-width:1024px){ .mdst-cart-inner{grid-template-columns:1.2fr 1fr;} }
.mdst-cart-item{display:flex;gap:1rem;border:1px solid var(--border);padding:1rem;margin-bottom:.85rem;align-items:center;}
.mdst-cart-item-img{width:76px;height:76px;flex-shrink:0;border:1px solid var(--border);overflow:hidden;background:var(--bg);display:flex;align-items:center;justify-content:center;}
.mdst-cart-item-img img{width:100%;height:100%;object-fit:cover;}
.mdst-cart-empty{text-align:center;padding:5rem 1rem;}
.mdst-trash-btn{width:36px;height:36px;flex-shrink:0;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--danger);}

/* ---------- FOOTER ---------- */
.mdst-footer{background:var(--ink);color:#EDEFF3;margin-top:2rem;}
.mdst-footer-grid{max-width:1280px;margin:0 auto;padding:3rem 1.25rem 2rem;display:grid;grid-template-columns:1fr;gap:2rem;}
@media (min-width:768px){ .mdst-footer-grid{grid-template-columns:1.3fr 1fr 1fr;} }
.mdst-footer h4{font-family:var(--f-mono);font-size:.78rem;letter-spacing:.05em;color:#8A93A3;margin:0 0 1rem;}
.mdst-footer-links{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.6rem;}
.mdst-footer-contact-row{display:flex;align-items:center;gap:.6rem;margin-bottom:.6rem;font-size:.88rem;color:#C7CCD4;}
.mdst-footer-bottom{border-top:1px solid #262B34;padding:1rem 1.25rem;text-align:center;font-size:.78rem;color:#6E7683;font-family:var(--f-mono);}

/* ---------- STATIC PAGES ---------- */
.mdst-static-shell{}
.mdst-static-hero{background:var(--ink);color:#fff;padding:3.5rem 1.25rem;text-align:center;}
.mdst-static-hero h1{font-size:clamp(1.8rem,4vw,2.6rem);font-weight:800;margin:0;}
.mdst-static-body{max-width:820px;margin:0 auto;padding:2.5rem 1.25rem 4rem;}
.mdst-info-block{margin-bottom:2rem;}
.mdst-info-block h3{font-size:1.15rem;font-weight:800;margin-bottom:.6rem;}
.mdst-info-block p{color:var(--sub);line-height:1.8;font-size:.92rem;}
.mdst-contact-grid{display:grid;grid-template-columns:1fr;gap:2.5rem;max-width:1000px;margin:0 auto;padding:3rem 1.25rem 4rem;}
@media (min-width:768px){ .mdst-contact-grid{grid-template-columns:1fr 1.2fr;} }
.mdst-success{text-align:center;padding:3rem 1rem;}
`;

/* ======================================================================
   4. MAIN (layout wrapper)
====================================================================== */

// ─── Translations ─────────────────────────────────────────────────────────────
const jsonAr = {
  dir: 'rtl',
  // Navbar
  home: 'الرئيسية',
  contact: 'اتصل بنا',
  cart: 'السلة',
  search: 'ابحث...',
  searching: 'جاري البحث...',
  noResults: 'لا توجد نتائج',
  showAll: 'عرض كل النتائج →',
  // Home
  all: 'الكل',
  noProducts: 'لا توجد منتجات متاحة حالياً',
  shopNow: 'تسوق الآن',
  searchResultsFor: 'نتائج البحث عن:',
  // Form
  fullName: 'الاسم الكامل',
  fullNamePh: 'أدخل اسمك',
  errName: 'الاسم مطلوب',
  phone: 'رقم الهاتف',
  phonePh: '05xxxxxxxx',
  errPhone: 'رقم الهاتف مطلوب',
  errPhoneInvalid: 'رقم هاتف غير صالح',
  wilaya: 'الولاية',
  errWilaya: 'الولاية مطلوبة',
  wilayaPh: 'اختر الولاية',
  wilayaNA: 'التوصيل غير متاح حالياً',
  commune: 'البلدية',
  errCommune: 'البلدية مطلوبة',
  communePh: 'اختر البلدية',
  communeLoading: 'جاري التحميل...',
  deliveryType: 'نوع التوصيل',
  deliveryHome: 'توصيل للمنزل',
  deliveryOffice: 'مكتب بريد',
  qty: 'الكمية',
  price: 'السعر',
  delivery: 'التوصيل',
  total: 'الإجمالي',
  subtotal: 'المجموع الفرعي',
  orderInfo: 'معلومات الطلب',
  addToCart: 'أضف إلى السلة',
  orderNow: 'اطلب الآن',
  confirmOrder: 'تأكيد الطلب',
  sending: 'جاري الإرسال...',
  back: 'رجوع',
  addedMsg: 'تمت الإضافة إلى السلة بنجاح!',
  errSubmit: 'حدث خطأ أثناء إرسال الطلب',
  // Cart & Success
  myCart: 'السلة',
  cartEmpty: 'السلة فارغة',
  cartEmptyDesc: 'لم تقم بإضافة أي منتجات بعد',
  successTitle: 'تم إرسال طلبك بنجاح!',
  successDesc: 'سنتواصل معك قريباً لتأكيد التفاصيل',
  backToShop: 'العودة للتسوق',
  checkoutTitle: 'إتمام الطلب',
  // Product
  offersTitle: 'العروض المتاحة',
  descTitle: 'الوصف',
  // Footer
  quickLinks: 'روابط سريعة',
  contactSect: 'تواصل معنا',
  privacy: 'الخصوصية',
  terms: 'الشروط',
  rightsReserved: 'جميع الحقوق محفوظة',
};

const jsonFr = {
  dir: 'ltr',
  // Navbar
  home: 'Accueil',
  contact: 'Contact',
  cart: 'Panier',
  search: 'Rechercher un produit...',
  searching: 'Recherche...',
  noResults: 'Aucun résultat',
  showAll: 'Voir tous les résultats',
  // Home
  all: 'Tout',
  noProducts: 'Aucun produit disponible pour le moment.',
  shopNow: 'Voir la boutique',
  searchResultsFor: 'Résultats pour :',
  // Form
  fullName: 'Nom complet',
  fullNamePh: 'Votre nom',
  errName: 'Le nom est requis',
  phone: 'Téléphone',
  phonePh: '0555 12 34 56',
  errPhone: 'Le numéro de téléphone est requis',
  errPhoneInvalid: 'Numéro de téléphone invalide',
  wilaya: 'Wilaya',
  errWilaya: 'Sélectionnez une wilaya',
  wilayaPh: 'Choisir la wilaya',
  wilayaNA: 'Livraison indisponible pour le moment',
  commune: 'Commune',
  errCommune: 'Sélectionnez une commune',
  communePh: 'Choisir la commune',
  communeLoading: 'Chargement...',
  deliveryType: 'Type de livraison',
  deliveryHome: 'À domicile',
  deliveryOffice: 'Point relais',
  qty: 'Quantité',
  price: 'Prix',
  delivery: 'Livraison',
  total: 'Total',
  subtotal: 'Sous-total',
  orderInfo: 'Informations de commande',
  addToCart: 'Ajouter au panier',
  orderNow: 'Commander maintenant',
  confirmOrder: 'Confirmer la commande',
  sending: 'Envoi en cours...',
  back: 'Annuler',
  addedMsg: 'Ajouté au panier ✓',
  errSubmit: 'Une erreur est survenue, veuillez réessayer.',
  // Cart & Success
  myCart: 'Mon Panier',
  cartEmpty: 'Votre panier est vide',
  cartEmptyDesc: 'Découvrez notre sélection.',
  successTitle: 'Commande confirmée',
  successDesc: 'Merci pour votre commande, notre équipe vous contactera bientôt.',
  backToShop: 'Retour à la boutique',
  checkoutTitle: 'Finaliser la commande',
  // Product
  offersTitle: 'Offres groupées',
  descTitle: 'Description',
  // Footer
  quickLinks: 'Navigation',
  contactSect: 'Contact',
  privacy: 'Confidentialité',
  terms: 'Conditions',
  rightsReserved: 'Tous droits réservés.',
};

export default function Main({ store, children, domain }: { store: StoreShape; children: React.ReactNode; domain: string; }) {
  const pathname = usePathname();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="mdst-root" dir="rtl">
      <style>{THEME_CSS}</style>
      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ======================================================================
   5. NAVBAR
====================================================================== */
export function Navbar({ store, domain }: { store: StoreShape; domain: string; }) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const count = useCartStore((s: any) => s.count);
  const initCount = useCartStore((s: any) => s.initCount);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(domain);
      const arr = raw ? JSON.parse(raw) : [];
      initCount(Array.isArray(arr) ? arr.length : 0);
    } catch { initCount(0); }
  }, [domain, initCount]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setListSearch([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(searchQuery)}`);
        const d = await r.json();
        setListSearch(Array.isArray(d) ? d : d?.products || []);
      } catch { setListSearch([]); }
      setLoading(false);
    }, 380);
    return () => clearTimeout(t);
  }, [searchQuery, domain]);

  const submitSearch = () => {
    router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    setShowSearch(false);
  };

  const mobileLinks = [
    { h: '/', l: 'الرئيسية' },
    { h: '/contact', l: 'تواصل معنا' },
  ];

  return (
    <>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div className="mdst-topbar">{store.topBar.text}</div>
      )}
      <nav className={`mdst-navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="mdst-nav-inner">
          <Link href="/" className="mdst-logo">
            {store?.design?.logoUrl && !imgError ? (
              <img src={store.design.logoUrl} alt={store.name} style={{ height: 34, width: 34, objectFit: 'contain' }} onError={() => setImgError(true)} />
            ) : (
              <span className="mdst-logo-badge"><Cpu size={18} /></span>
            )}
            <span>{store?.name}</span>
          </Link>

          <ul className="mdst-nav-links">
            <li><Link href="/" className="mdst-nav-link">الرئيسية</Link></li>
            <li><Link href="/contact" className="mdst-nav-link">تواصل معنا</Link></li>
          </ul>

          <div className="mdst-nav-actions">
            <div className="mdst-search-wrap">
              <button className="mdst-icon-btn" onClick={() => setShowSearch((s) => !s)} aria-label="بحث">
                <Search size={17} />
              </button>
              {showSearch && (
                <div className="mdst-search-dropdown">
                  <div style={{ padding: '.6rem .75rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '.5rem' }}>
                    <input
                      className="mdst-input"
                      autoFocus
                      placeholder="ابحث عن منتج..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
                    />
                  </div>
                  {loading && <div className="mdst-search-empty">جاري البحث...</div>}
                  {!loading && searchQuery.length >= 2 && listSearch.length === 0 && (
                    <div className="mdst-search-empty">لا توجد نتائج</div>
                  )}
                  {!loading && listSearch.slice(0, 6).map((p) => {
                    const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
                    return (
                      <Link key={p.id} href={`/product/${p.slug || p.id}`} className="mdst-search-row" onClick={() => setShowSearch(false)}>
                        {img ? <img src={img} alt={p.name} /> : <div className="mdst-card-placeholder" style={{ width: 42, height: 42 }}><ImageOff size={16} /></div>}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                          <div className="mono" style={{ fontSize: '.78rem', color: 'var(--accent)', fontWeight: 700 }}>{fmtPrice(Number(p.price))} {store?.currency || 'دج'}</div>
                        </div>
                      </Link>
                    );
                  })}
                  {searchQuery.length >= 2 && (
                    <div className="mdst-search-viewall" role="button" onClick={submitSearch}>عرض كل النتائج</div>
                  )}
                </div>
              )}
            </div>

            {store?.cart !== false && (
              <Link href="/cart" className="mdst-icon-btn" aria-label="السلة">
                <ShoppingCart size={17} />
                {count > 0 && <span className="mdst-cart-badge">{count}</span>}
              </Link>
            )}

            <button className="mdst-burger" onClick={() => setOpen(true)} aria-label="القائمة">
              <Menu size={19} />
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <div className="mdst-mobile-menu">
          <div className="mdst-mobile-menu-top">
            <span className="mdst-logo"><span className="mdst-logo-badge"><Cpu size={18} /></span> {store?.name}</span>
            <button className="mdst-icon-btn" onClick={() => setOpen(false)} aria-label="إغلاق"><X size={18} /></button>
          </div>
          {mobileLinks.map((l) => (
            <Link key={l.h} href={l.h} className="mdst-mobile-link" onClick={() => setOpen(false)}>{l.l}</Link>
          ))}
        </div>
      )}
    </>
  );
}

/* ======================================================================
   6. FOOTER
====================================================================== */
export function Footer({ store }: { store: StoreShape; }) {
  const pageLinks = [
    { h: '/', l: 'الرئيسية' },
    { h: '/cart', l: 'السلة' },
    { h: '/contact', l: 'تواصل معنا' },
    { h: '/privacy', l: 'سياسة الخصوصية' },
    { h: '/terms', l: 'الشروط والأحكام' },
  ].filter((lnk) => lnk.h !== '/cart' || store?.cart !== false);

  return (
    <footer className="mdst-footer">
      <div className="mdst-footer-grid">
        <div>
          <h4 className="mono">{store?.name}</h4>
          <p style={{ color: '#C7CCD4', fontSize: '.88rem', lineHeight: 1.7, maxWidth: 320 }}>
            {store?.hero?.subtitle || 'وجهتك للتقنية والهواتف الذكية بجودة موثوقة.'}
          </p>
          <p style={{ color: '#6E7683', fontSize: '.78rem', marginTop: '1.2rem' }} className="mono">
            © {new Date().getFullYear()} {store?.name}
          </p>
        </div>
        <div>
          <h4>روابط الصفحة</h4>
          <ul className="mdst-footer-links">
            {pageLinks.map((l) => <li key={l.h}><Link href={l.h}>{l.l}</Link></li>)}
          </ul>
        </div>
        <div>
          <h4>تواصل معنا</h4>
          {store?.contact?.phone && (
            <div className="mdst-footer-contact-row"><Phone size={15} /> <span className="mono">{store.contact.phone}</span></div>
          )}
          {store?.contact?.email && (
            <div className="mdst-footer-contact-row"><Mail size={15} /> <span>{store.contact.email}</span></div>
          )}
          {(store?.contact?.wilaya || store?.contact?.address) && (
            <div className="mdst-footer-contact-row"><MapPin size={15} /> <span>{[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' - ')}</span></div>
          )}
        </div>
      </div>
      <div className="mdst-footer-bottom">MDSTORE // POWERED-BY-TECH-LAB</div>
    </footer>
  );
}

/* ======================================================================
   7. CARD
====================================================================== */
export function Card({ product, displayImage, discount, store, viewDetails }: {
  product: Product; displayImage?: string; discount?: number; store: StoreShape; viewDetails?: boolean;
}) {
  const img = displayImage || product.productImage || product.imagesProduct?.[0]?.imageUrl;
  return (
    <Link href={`/product/${product.slug || product.id}`} className="mdst-card">
      <span className="mdst-reticle tl" /><span className="mdst-reticle tr" /><span className="mdst-reticle bl" /><span className="mdst-reticle br" />
      <div className="mdst-card-imgwrap">
        {img ? <img src={img} alt={product.name} /> : <div className="mdst-card-placeholder"><ImageOff size={28} /></div>}
        {!!discount && discount > 0 && <span className="mdst-card-badge">-{discount}%</span>}
        <span className="mdst-card-sku mono">{sku(product.id)}</span>
      </div>
      <div className="mdst-card-body">
        <div className="mdst-card-name">{product.name}</div>
        <div className="mdst-card-stars">
          {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill="#0E1116" color="#0E1116" />)}
        </div>
        <div className="mdst-card-price-row">
          <span className="mdst-price-now">{fmtPrice(Number(product.price))} {store?.currency || 'دج'}</span>
          {product.priceOriginal && Number(product.priceOriginal) > Number(product.price) && (
            <span className="mdst-price-orig">{fmtPrice(Number(product.priceOriginal))}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ======================================================================
   8. HOME
====================================================================== */
export function Home({ store, page }: { store: StoreShape; page?: number; }) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  const products = store?.products || [];
  const cats = store?.categories || [];
  const currentPage = page || Number(searchParams.get('page')) || 1;
  const countPage = Math.max(1, Math.ceil((store?.count || products.length) / 48));

  return (
    <div>
      <section className="mdst-hero">
        <div className="mdst-hero-grid">
          <div>
            <span className="mdst-hero-eyebrow"><Crosshair size={13} /> تقنية موثوقة، مضمونة</span>
            <h1 className="mdst-hero-title" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store?.hero?.title || 'أحدث الأجهزة الذكية بين يديك') }} />
            <p className="mdst-hero-sub">{store?.hero?.subtitle || 'هواتف، إكسسوارات وأدوات تقنية مختارة بعناية، مع ضمان الجودة وتوصيل سريع لجميع الولايات.'}</p>
            <div className="mdst-hero-ctas">
              <Link href="#products" className="mdst-btn mdst-btn-primary">تسوق الآن</Link>
              {store?.cart !== false && <Link href="/cart" className="mdst-btn mdst-btn-secondary"><ShoppingCart size={16} /> السلة</Link>}
            </div>
          </div>
          <div className="mdst-hero-media">
            {store?.hero?.imageUrl && (
              <img src={store.hero.imageUrl} alt={store?.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            <span className="mdst-reticle tl" /><span className="mdst-reticle tr" /><span className="mdst-reticle bl" /><span className="mdst-reticle br" />
          </div>
        </div>
      </section>

      <section className="mdst-trust">
        <div className="mdst-trust-grid">
          <div className="mdst-trust-item"><span className="ic"><Truck size={17} /></span><div><b>توصيل سريع</b><span>لكل الولايات</span></div></div>
          <div className="mdst-trust-item"><span className="ic"><ShieldCheck size={17} /></span><div><b>جودة مضمونة</b><span>منتجات أصلية</span></div></div>
          <div className="mdst-trust-item"><span className="ic"><Cpu size={17} /></span><div><b>دفع آمن</b><span>عند الاستلام</span></div></div>
          <div className="mdst-trust-item"><span className="ic"><Headset size={17} /></span><div><b>دعم فني</b><span>مساعدة دائمة</span></div></div>
        </div>
      </section>

      {cats.length > 0 && (
        <section className="mdst-cats">
          <div className="mdst-cats-row">
            <Link href="/" className={`mdst-cat-chip mono${!activeCategory ? ' active' : ''}`}>الكل</Link>
            {cats.map((cat) => (
              <Link key={cat.id} href={`?category=${cat.id}`} className={`mdst-cat-chip mono${activeCategory === String(cat.id) ? ' active' : ''}`}>
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section id="products" className="mdst-products">
        <div className="mdst-section-head">
          <h2 className="mdst-section-title">المنتجات</h2>
          <span className="mono" style={{ fontSize: '.78rem', color: 'var(--sub)' }}>{store?.count ?? products.length} منتج</span>
        </div>
        <div className="mdst-products-grid">
          {products.map((p) => {
            const disc = p.priceOriginal && Number(p.priceOriginal) > Number(p.price)
              ? Math.round(((Number(p.priceOriginal) - Number(p.price)) / Number(p.priceOriginal)) * 100)
              : 0;
            return <Card key={p.id} product={p} discount={disc} store={store} viewDetails />;
          })}
        </div>

        {countPage > 1 && (
          <div className="mdst-pagination">
            {Array.from({ length: countPage }).map((_, i) => {
              const pn = i + 1;
              return (
                <Link key={pn} href={{ query: { ...(activeCategory ? { category: activeCategory } : {}), page: pn } }} scroll={false}
                  className={`mdst-page-btn${pn === currentPage ? ' active' : ''}`}>
                  {pn}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* ======================================================================
   9. DETAILS
====================================================================== */
export function Details({
  product, discount, allImages, allAttrs, finalPrice, selectedVariants,
  setSelectedOffer, selectedOffer, handleVariantSelection, domain,
}: {
  product: Product; discount?: number; allImages: string[]; allAttrs: Attribute[]; finalPrice: number;
  selectedVariants: Record<string, string>; setSelectedOffer: (id: string | null) => void; selectedOffer: string | null;
  handleVariantSelection: (attrName: string, value: string) => void; domain: string;
}) {
  const [sel, setSel] = useState(0);
  const images = allImages && allImages.length > 0 ? allImages : ['__none__'];

  return (
    <div className="mdst-details">
      <div className="mdst-details-inner">
        <div>
          <div className="mdst-gallery-main">
            {images[sel] !== '__none__' ? (
              <img src={images[sel]} alt={product.name} />
            ) : (
              <div className="mdst-card-placeholder" style={{ width: '100%', height: '100%' }}><ImageOff size={40} /></div>
            )}
            {images.length > 1 && (
              <>
                <button className="mdst-gallery-navbtn left" onClick={() => setSel((s) => (s - 1 + images.length) % images.length)}><ChevronRight size={18} /></button>
                <button className="mdst-gallery-navbtn right" onClick={() => setSel((s) => (s + 1) % images.length)}><ChevronLeft size={18} /></button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="mdst-thumbs">
              {images.map((img, i) => (
                <button key={i} className={`mdst-thumb${i === sel ? ' active' : ''}`} onClick={() => setSel(i)}>
                  <img src={img} alt={`${product.name}-${i}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <span className="mono" style={{ fontSize: '.72rem', color: 'var(--sub)' }}>{sku(product.id)}</span>
          <h1 className="mdst-details-name">{product.name}</h1>
          <div className="mdst-card-stars" style={{ marginBottom: '.5rem' }}>
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="#0E1116" color="#0E1116" />)}
          </div>
          <div className="mdst-final-price">{fmtPrice(finalPrice)} {product.store ? 'دج' : ''}</div>

          {product.offers && product.offers.length > 0 && (
            <div className="mdst-offer-list">
              {product.offers.map((o) => (
                <label key={o.id} className={`mdst-offer-item${selectedOffer === o.id ? ' active' : ''}`}>
                  <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} />
                  <span style={{ flex: 1 }}>{o.name}</span>
                  <span className="mono" style={{ fontWeight: 700 }}>{fmtPrice(o.price)} دج</span>
                </label>
              ))}
            </div>
          )}

          {allAttrs.map((attr) => (
            <div key={attr.id} className="mdst-attr-group">
              <span className="mdst-attr-label mono">{attr.name}</span>
              <div className="mdst-attr-row">
                {attr.variants.map((v) => {
                  const active = selectedVariants[attr.name] === v.value;
                  if (attr.displayMode === 'color') {
                    return <span key={v.id} className={`mdst-swatch-color${active ? ' active' : ''}`} style={{ background: v.value }} onClick={() => handleVariantSelection(attr.name, v.value)} title={v.name} />;
                  }
                  if (attr.displayMode === 'image') {
                    return <span key={v.id} className={`mdst-swatch-image${active ? ' active' : ''}`} onClick={() => handleVariantSelection(attr.name, v.value)}><img src={v.value} alt={v.name} /></span>;
                  }
                  return <span key={v.id} className={`mdst-swatch-text${active ? ' active' : ''}`} onClick={() => handleVariantSelection(attr.name, v.value)}>{v.name}</span>;
                })}
              </div>
            </div>
          ))}

          <ProductForm
            product={product}
            userId={product.store.userId}
            domain={domain}
            selectedOffer={selectedOffer}
            setSelectedOffer={setSelectedOffer}
            selectedVariants={selectedVariants}
          />

          {product.desc && (
            <div className="mdst-desc" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ======================================================================
   10. PRODUCT FORM
====================================================================== */
export function ProductForm({
  product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform,
}: {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>; platform?: string; priceLoss?: number;
}) {
  const router = useRouter();
  const initCount = useCartStore((s: any) => s.initCount);

  const [fd, setFd] = useState({
    customerId: '', customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    quantity: 1, priceLoss: 0,
    typeLivraison: 'home' as 'home' | 'office',
  });
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find((w) => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);

  const getFP = useCallback((): number => {
    if (selectedOffer && product.offers) {
      const o = product.offers.find((x) => x.id === selectedOffer);
      if (o) return o.price;
    }
    if (product.variantDetails && product.variantDetails.length > 0) {
      const match = product.variantDetails.find((d) => variantMatches(d, selectedVariants));
      if (match && match.price !== -1) return match.price;
    }
    return Number(product.price);
  }, [selectedOffer, product, selectedVariants]);

  const getVarId = useCallback((): string | number | undefined => {
    if (!product.variantDetails || product.variantDetails.length === 0) return undefined;
    const match = product.variantDetails.find((d) => variantMatches(d, selectedVariants));
    return match?.id;
  }, [product.variantDetails, selectedVariants]);

  const getLiv = useCallback((): number => {
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison]);

  const fp = getFP();
  const total = () => fp * fd.quantity + getLiv();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = 'الاسم مطلوب';
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone)) e.customerPhone = 'رقم هاتف غير صحيح';
    if (!fd.customerWelaya) e.customerWelaya = 'اختر الولاية';
    if (!fd.customerCommune) e.customerCommune = 'اختر البلدية';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addToCart = () => {
    try {
      const raw = localStorage.getItem(domain);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push({
        ...fd, product, variantDetailId: getVarId(), productId: product.id,
        storeId: product.store.id, userId, selectedOffer, selectedVariants, platform,
        finalPrice: fp, totalPrice: total(), priceLivraison: getLiv(), addedAt: Date.now(),
      });
      localStorage.setItem(domain, JSON.stringify(arr));
      initCount(arr.length);
    } catch { /* noop */ }
  };

  const submitOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...fd, product, variantDetailId: getVarId(), productId: product.id,
        storeId: product.store.id, userId, selectedOffer, selectedVariants, platform,
        finalPrice: fp, totalPrice: total(), priceLivraison: getLiv(),
      };
      const r = await fetch(`${API_URL}/orders/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (data?.customerId) localStorage.setItem('customerId', data.customerId);
      router.push(`/successfully?productId=${product.id}`);
    } catch { /* noop */ }
    setSubmitting(false);
  };

  return (
    <div className="mdst-product-form">
      {isOrderNow && (
        <>
          <div className="mdst-field">
            <span className="mdst-field-label">الاسم الكامل</span>
            <input className={`mdst-input${errors.customerName ? ' err' : ''}`} value={fd.customerName} onChange={(e) => setFd({ ...fd, customerName: e.target.value })} placeholder="الاسم و اللقب" />
            {errors.customerName && <p className="mdst-error-text"><AlertCircle size={11} /> {errors.customerName}</p>}
          </div>
          <div className="mdst-field">
            <span className="mdst-field-label">رقم الهاتف</span>
            <input className={`mdst-input${errors.customerPhone ? ' err' : ''}`} value={fd.customerPhone} onChange={(e) => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0555 12 34 56" />
            {errors.customerPhone && <p className="mdst-error-text"><AlertCircle size={11} /> {errors.customerPhone}</p>}
          </div>
          <div className="mdst-form-row-2">
            <div>
              <span className="mdst-field-label">الولاية</span>
              <div className="mdst-select-wrap">
                <ChevronDown size={13} className="chev" />
                <select className={`mdst-input${errors.customerWelaya ? ' err' : ''}`} disabled={wilayas.length === 0}
                  value={fd.customerWelaya} onChange={(e) => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })}>
                  <option value="">{wilayas.length === 0 ? 'التوصيل غير متاح حالياً' : 'اختر الولاية'}</option>
                  {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                </select>
              </div>
              {errors.customerWelaya && <p className="mdst-error-text"><AlertCircle size={11} /> {errors.customerWelaya}</p>}
            </div>
            <div>
              <span className="mdst-field-label">البلدية</span>
              <div className="mdst-select-wrap">
                <ChevronDown size={13} className="chev" />
                <select className={`mdst-input${errors.customerCommune ? ' err' : ''}`} disabled={communes.length === 0}
                  value={fd.customerCommune} onChange={(e) => setFd({ ...fd, customerCommune: e.target.value })}>
                  <option value="">{loadingC ? 'جاري التحميل...' : 'اختر البلدية'}</option>
                  {communes.map((c) => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                </select>
              </div>
              {errors.customerCommune && <p className="mdst-error-text"><AlertCircle size={11} /> {errors.customerCommune}</p>}
            </div>
          </div>
          <div className="mdst-field">
            <span className="mdst-field-label">نوع التوصيل</span>
            <div className="mdst-delivery-toggle">
              <div className={`mdst-delivery-opt${fd.typeLivraison === 'home' ? ' active' : ''}`} onClick={() => setFd({ ...fd, typeLivraison: 'home' })}>للمنزل</div>
              <div className={`mdst-delivery-opt${fd.typeLivraison === 'office' ? ' active' : ''}`} onClick={() => setFd({ ...fd, typeLivraison: 'office' })}>للمكتب</div>
            </div>
          </div>
        </>
      )}

      <div className="mdst-field">
        <span className="mdst-field-label">الكمية</span>
        <div className="mdst-qty-control">
          <button onClick={() => setFd({ ...fd, quantity: Math.max(1, fd.quantity - 1) })}><Minus size={14} /></button>
          <span>{fd.quantity}</span>
          <button onClick={() => setFd({ ...fd, quantity: fd.quantity + 1 })}><Plus size={14} /></button>
        </div>
      </div>

      <div className="mdst-summary">
        <div className="mdst-summary-row"><span>السعر</span><span>{fmtPrice(fp)} دج</span></div>
        <div className="mdst-summary-row"><span>الكمية</span><span>× {fd.quantity}</span></div>
        <div className="mdst-summary-row"><span>التوصيل</span><span>{selW ? `${fmtPrice(getLiv())} دج` : '—'}</span></div>
        <div className="mdst-summary-row total"><span>المجموع</span><span>{fmtPrice(total())} دج</span></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginTop: '1rem' }}>
        {product.store?.cart === true && !isOrderNow && (
          <button className="mdst-btn mdst-btn-outline" onClick={addToCart}><ShoppingCart size={16} /> أضف إلى السلة</button>
        )}
        {!isOrderNow && (
          <button className="mdst-btn mdst-btn-accent" onClick={() => setIsOrderNow(true)}>اطلب الآن</button>
        )}
        {isOrderNow && (
          <>
            <button className="mdst-btn mdst-btn-accent" disabled={submitting} onClick={submitOrder}>
              {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
            </button>
            <button className="mdst-btn mdst-btn-outline" disabled={submitting} onClick={() => setIsOrderNow(false)}>
              إلغاء
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ======================================================================
   11. CART
====================================================================== */
export function Cart({ domain, store }: { domain: string; store: StoreShape; }) {
  const router = useRouter();
  const initCount = useCartStore((s: any) => s.initCount);
  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fd, setFd] = useState({
    customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '',
    typeLivraison: 'home' as 'home' | 'office',
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(domain);
      setItems(raw ? JSON.parse(raw) : []);
    } catch { setItems([]); }
  }, [domain]);

  useEffect(() => {
    if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas);
  }, [store]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find((w) => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getLiv = useCallback((): number => {
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison]);

  const cartTotal = items.reduce((s, it) => s + Number(it.finalPrice || 0) * Number(it.quantity || 1), 0);
  const finalTotal = cartTotal + getLiv();

  const removeItem = (idx: number) => {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    localStorage.setItem(domain, JSON.stringify(next));
    initCount(next.length);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = 'الاسم مطلوب';
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone)) e.customerPhone = 'رقم هاتف غير صحيح';
    if (!fd.customerWelaya) e.customerWelaya = 'اختر الولاية';
    if (!fd.customerCommune) e.customerCommune = 'اختر البلدية';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitOrder = async () => {
    if (!validate() || items.length === 0) return;
    setSubmitting(true);
    try {
      const payload = items.map((it) => ({
        ...fd, ...it, priceLivraison: getLiv(), totalPrice: Number(it.finalPrice || 0) * Number(it.quantity || 1) + getLiv(),
      }));
      await fetch(`${API_URL}/orders/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      localStorage.removeItem(domain);
      initCount(0);
      setItems([]);
      setSuccess(true);
    } catch { /* noop */ }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="mdst-success">
        <ShieldCheck size={48} color="var(--accent)" />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '1rem 0 .5rem' }}>تم تأكيد طلبك بنجاح</h2>
        <p style={{ color: 'var(--sub)', marginBottom: '1.5rem' }}>سنتواصل معك قريباً لتأكيد التوصيل.</p>
        <Link href="/" className="mdst-btn mdst-btn-primary" style={{ display: 'inline-flex' }}>متابعة التسوق</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mdst-cart-empty">
        <ShoppingCart size={44} color="var(--sub)" />
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '1rem 0 .5rem' }}>سلتك فارغة</h2>
        <p style={{ color: 'var(--sub)', marginBottom: '1.5rem' }}>لم تقم بإضافة أي منتج بعد.</p>
        <Link href="/" className="mdst-btn mdst-btn-primary" style={{ display: 'inline-flex' }}>تسوق الآن</Link>
      </div>
    );
  }

  return (
    <div className="mdst-cart-page">
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.5rem' }}>سلة المشتريات</h1>
      <div className="mdst-cart-inner">
        <div>
          {items.map((it, idx) => {
            const img = it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl;
            return (
              <div key={idx} className="mdst-cart-item">
                <div className="mdst-cart-item-img">
                  {img ? <img src={img} alt={it.product?.name} /> : <ImageOff size={22} color="var(--sub)" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '.92rem', marginBottom: '.25rem' }}>{it.product?.name}</div>
                  <div className="mono" style={{ fontSize: '.85rem', color: 'var(--accent)', fontWeight: 700 }}>
                    {fmtPrice(Number(it.finalPrice || 0))} دج × {it.quantity || 1}
                  </div>
                </div>
                <button className="mdst-trash-btn" onClick={() => removeItem(idx)} aria-label="حذف"><Trash2 size={16} /></button>
              </div>
            );
          })}
        </div>

        <div>
          <div className="mdst-field">
            <span className="mdst-field-label">الاسم الكامل</span>
            <input className={`mdst-input${errors.customerName ? ' err' : ''}`} value={fd.customerName} onChange={(e) => setFd({ ...fd, customerName: e.target.value })} placeholder="الاسم و اللقب" />
            {errors.customerName && <p className="mdst-error-text"><AlertCircle size={11} /> {errors.customerName}</p>}
          </div>
          <div className="mdst-field">
            <span className="mdst-field-label">رقم الهاتف</span>
            <input className={`mdst-input${errors.customerPhone ? ' err' : ''}`} value={fd.customerPhone} onChange={(e) => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0555 12 34 56" />
            {errors.customerPhone && <p className="mdst-error-text"><AlertCircle size={11} /> {errors.customerPhone}</p>}
          </div>
          <div className="mdst-form-row-2">
            <div>
              <span className="mdst-field-label">الولاية</span>
              <div className="mdst-select-wrap">
                <ChevronDown size={13} className="chev" />
                <select className={`mdst-input${errors.customerWelaya ? ' err' : ''}`} disabled={wilayas.length === 0}
                  value={fd.customerWelaya} onChange={(e) => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })}>
                  <option value="">{wilayas.length === 0 ? 'التوصيل غير متاح حالياً' : 'اختر الولاية'}</option>
                  {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                </select>
              </div>
              {errors.customerWelaya && <p className="mdst-error-text"><AlertCircle size={11} /> {errors.customerWelaya}</p>}
            </div>
            <div>
              <span className="mdst-field-label">البلدية</span>
              <div className="mdst-select-wrap">
                <ChevronDown size={13} className="chev" />
                <select className={`mdst-input${errors.customerCommune ? ' err' : ''}`} disabled={communes.length === 0}
                  value={fd.customerCommune} onChange={(e) => setFd({ ...fd, customerCommune: e.target.value })}>
                  <option value="">{loadingC ? 'جاري التحميل...' : 'اختر البلدية'}</option>
                  {communes.map((c) => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                </select>
              </div>
              {errors.customerCommune && <p className="mdst-error-text"><AlertCircle size={11} /> {errors.customerCommune}</p>}
            </div>
          </div>
          <div className="mdst-field">
            <span className="mdst-field-label">نوع التوصيل</span>
            <div className="mdst-delivery-toggle">
              <div className={`mdst-delivery-opt${fd.typeLivraison === 'home' ? ' active' : ''}`} onClick={() => setFd({ ...fd, typeLivraison: 'home' })}>للمنزل</div>
              <div className={`mdst-delivery-opt${fd.typeLivraison === 'office' ? ' active' : ''}`} onClick={() => setFd({ ...fd, typeLivraison: 'office' })}>للمكتب</div>
            </div>
          </div>

          <div className="mdst-summary">
            <div className="mdst-summary-row"><span>المجموع الفرعي</span><span>{fmtPrice(cartTotal)} دج</span></div>
            <div className="mdst-summary-row"><span>Livraison</span><span>{selW ? fmtPrice(getLiv()) + ' دج' : '—'}</span></div>
            <div className="mdst-summary-row total"><span>المجموع الكلي</span><span>{fmtPrice(finalTotal)} دج</span></div>
          </div>

          <button className="mdst-btn mdst-btn-accent" style={{ marginTop: '1rem' }} disabled={submitting} onClick={submitOrder}>
            {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ======================================================================
   12. STATIC PAGES
====================================================================== */
function Shell({ title, children }: { title: string; children: React.ReactNode; }) {
  return (
    <div className="mdst-static-shell">
      <div className="mdst-static-hero"><h1>{title}</h1></div>
      <div className="mdst-static-body">{children}</div>
    </div>
  );
}

function InfoBlock({ title, body }: { title: string; body: string; }) {
  return (
    <div className="mdst-info-block">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية">
      <InfoBlock title="جمع المعلومات" body="نقوم بجمع المعلومات الضرورية فقط لإتمام عمليات الطلب والتوصيل، مثل الاسم ورقم الهاتف والعنوان." />
      <InfoBlock title="استخدام البيانات" body="تُستخدم بياناتك حصرياً لمعالجة طلبك والتواصل معك بخصوص التوصيل، ولا تتم مشاركتها مع أي طرف ثالث لأغراض تسويقية." />
      <InfoBlock title="حماية المعلومات" body="نعتمد إجراءات تقنية وتنظيمية لحماية بياناتك من الوصول غير المصرح به أو الفقدان." />
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="الشروط والأحكام">
      <InfoBlock title="الطلبات" body="يتم تأكيد الطلب بعد التواصل الهاتفي مع الزبون، ويحق للمتجر إلغاء أي طلب يحتوي على معلومات غير صحيحة." />
      <InfoBlock title="التوصيل" body="مدة التوصيل تختلف حسب الولاية، وتُحسب تكلفة الشحن بشكل منفصل عن سعر المنتج وتُعرض بوضوح قبل تأكيد الطلب." />
      <InfoBlock title="الإرجاع والاستبدال" body="يمكن إرجاع المنتج في حال وجود عيب مصنعي خلال مدة محددة، شرط أن يكون المنتج في حالته الأصلية." />
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="سياسة ملفات تعريف الارتباط">
      <InfoBlock title="ما هي ملفات تعريف الارتباط" body="ملفات صغيرة تُخزَّن في متصفحك لتحسين تجربة التصفح وحفظ محتوى سلة الشراء." />
      <InfoBlock title="كيفية استخدامها" body="نستخدمها لتذكر منتجات سلتك ولتحسين أداء الموقع، ولا نستخدمها لتتبعك عبر مواقع أخرى." />
      <InfoBlock title="التحكم" body="يمكنك تعطيل ملفات تعريف الارتباط من إعدادات متصفحك، مع العلم أن ذلك قد يؤثر على عمل السلة." />
    </Shell>
  );
}

export function Contact({ store }: { store: StoreShape; }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await fetch(`${API_URL}/user/contact-user/message`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, storeId: store?.id }),
      });
      setSent(true);
    } catch { /* noop */ }
    setSubmitting(false);
  };

  if (sent) {
    return (
      <div className="mdst-success">
        <ShieldCheck size={44} color="var(--accent)" />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '1rem 0 .5rem' }}>تم إرسال رسالتك</h2>
        <p style={{ color: 'var(--sub)', marginBottom: '1.5rem' }}>سنقوم بالرد عليك في أقرب وقت ممكن.</p>
        <button className="mdst-btn mdst-btn-primary" onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }); }}>
          إرسال رسالة أخرى
        </button>
      </div>
    );
  }

  return (
    <div className="mdst-contact-grid">
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>معلومات التواصل</h2>
        {store?.contact?.phone && <div className="mdst-footer-contact-row" style={{ color: 'var(--ink)' }}><Phone size={16} /> <span className="mono">{store.contact.phone}</span></div>}
        {store?.contact?.email && <div className="mdst-footer-contact-row" style={{ color: 'var(--ink)' }}><Mail size={16} /> <span>{store.contact.email}</span></div>}
        {(store?.contact?.wilaya || store?.contact?.address) && (
          <div className="mdst-footer-contact-row" style={{ color: 'var(--ink)' }}><MapPin size={16} /> <span>{[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' - ')}</span></div>
        )}
      </div>
      <div>
        <div className="mdst-field">
          <span className="mdst-field-label">الاسم</span>
          <input className="mdst-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسمك الكامل" />
        </div>
        <div className="mdst-field">
          <span className="mdst-field-label">البريد الإلكتروني</span>
          <input className="mdst-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@mail.com" />
        </div>
        <div className="mdst-field">
          <span className="mdst-field-label">رقم الهاتف</span>
          <input className="mdst-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0555 12 34 56" />
        </div>
        <div className="mdst-field">
          <span className="mdst-field-label">الرسالة</span>
          <textarea className="mdst-textarea" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="اكتب رسالتك هنا..." />
        </div>
        <button className="mdst-btn mdst-btn-accent" disabled={submitting} onClick={submit}>
          {submitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
        </button>
      </div>
    </div>
  );
}

export function StaticPage({ staticPage, page, store }: { staticPage?: string; page?: string; store: StoreShape; }) {
  const p = (staticPage || page || '').toLowerCase();
  if (p === 'privacy') return <Privacy />;
  if (p === 'terms') return <Terms />;
  if (p === 'cookies') return <Cookies />;
  if (p === 'contact') return <Contact store={store} />;
  return null;
}