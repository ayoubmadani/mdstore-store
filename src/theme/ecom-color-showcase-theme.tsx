'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  ChevronDown, ChevronLeft, ChevronRight, AlertCircle, X, Phone, CheckCircle2, ArrowLeft, ArrowRight,
  Menu, Search, ShoppingCart, ShoppingBag, Minus, Plus, Trash2, Loader2, MapPin, Truck, Package,
  Mail, MessageCircle, Download, User, Home as HomeIcon, Building2, Share2, Check, Banknote, PhoneCall, Tag, Sparkles,
} from 'lucide-react';
// كل ما يحتاجه الثيم من المتجر يأتي من @mdstore/theme-kit — الثيم ملف واحد مستقل يُبنى ويُرفع من الـ API
import {
  useCartStore, WhatsAppOrderButton, WhatsAppGlyph, comingSoon,
} from '@mdstore/theme-kit';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/*
  ═══════ THEME: COLOR SHOWCASE (واجهة الألوان / Vitrine Couleurs)
  ═══════ الألوان من اختيار التاجر: store.design.primaryColor (--p) و store.design.secondaryColor (--s)
  ═══════ كل الدرجات الأخرى محسوبة منهما (color-mix)، ولون النص فوق الأزرار يُختار تلقائياً (أبيض/أسود) حسب التباين
*/

// ─── ألوان التاجر ────────────────────────────────────────────────────────────
const DEFAULT_P = '#4B16C9';
const DEFAULT_S = '#F5B400';
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const normHex = (v: any, fb: string) => {
  const s = String(v || '').trim();
  if (!HEX.test(s)) return fb;
  return s.length === 4 ? '#' + s.slice(1).split('').map((c) => c + c).join('') : s;
};
// نص مقروء فوق اللون: أسود على الألوان الفاتحة، أبيض على الغامقة (WCAG luminance)
const onColor = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const lin = (c: number) => { const x = c / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
  const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  return L > 0.45 ? '#111827' : '#FFFFFF';
};
const brandVars = (store: any): React.CSSProperties => {
  const p = normHex(store?.design?.primaryColor, DEFAULT_P);
  const s = normHex(store?.design?.secondaryColor, DEFAULT_S);
  // لون فاتح (نصه أسود): النصوص الملوّنة (الأسعار، الروابط) تأخذ درجة أغمق منه لتبقى مقروءة على الأبيض
  const light = onColor(p) !== '#FFFFFF';
  return { ['--p' as any]: p, ['--s' as any]: s, ['--on-p' as any]: onColor(p), ['--on-s' as any]: onColor(s),
    ['--p-ink' as any]: light ? `color-mix(in srgb, ${p} 45%, #000)` : p };
};

const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&family=Archivo:wght@500;700;800&display=swap');

  .cs-root {
    --ink: #111827; --muted: #6B7280; --line: #E5E7EB; --soft: #F6F7F9; --card: #FFFFFF;
    --p-soft: color-mix(in srgb, var(--p) 9%, #fff);
    --p-line: color-mix(in srgb, var(--p) 28%, #fff);
    --p-dark: color-mix(in srgb, var(--p) 82%, #000);
    --s-soft: color-mix(in srgb, var(--s) 12%, #fff);
    --s-line: color-mix(in srgb, var(--s) 55%, #fff);
    font-family: 'Archivo', 'Almarai', system-ui, sans-serif;
    background: #fff; color: var(--ink); min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }
  .cs-root *, .cs-root *::before, .cs-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .cs-root a { text-decoration: none; color: inherit; }
  .cs-root button { font-family: inherit; }
  .cs-wrap { max-width: 1240px; margin: 0 auto; padding: 0 1.25rem; width: 100%; }

  @keyframes csFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  @keyframes csPop  { from { transform: scale(.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes csSpin { to { transform: rotate(360deg); } }
  .cs-fade { animation: csFade .3s ease both; }
  .cs-pop  { animation: csPop .35s cubic-bezier(.34,1.56,.64,1) both; }
  .cs-spin { animation: csSpin 1s linear infinite; }
  @media (prefers-reduced-motion: reduce) { .cs-fade, .cs-pop { animation: none; } }

  /* شريط الإعلان + الرأس */
  .cs-topbar { background: var(--p); color: var(--on-p); text-align: center; font-size: .85rem; font-weight: 700; padding: .55rem 1rem; }
  .cs-nav { position: sticky; top: 0; z-index: 50; background: #fff; border-bottom: 1px solid var(--line); }
  .cs-nav-in { height: 68px; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
  .cs-links { display: none; align-items: center; gap: 2rem; }
  .cs-link { font-size: .95rem; color: #374151; transition: color .15s; }
  .cs-link:hover { color: var(--p-ink); }
  .cs-icon-btn { width: 40px; height: 40px; border-radius: 12px; border: 1px solid var(--line); background: #fff; display: inline-flex; align-items: center; justify-content: center; color: var(--ink); cursor: pointer; position: relative; }
  .cs-badge { position: absolute; top: -6px; inset-inline-end: -6px; min-width: 18px; height: 18px; padding: 0 4px; border-radius: 9px; background: var(--p); color: var(--on-p); font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; }
  .cs-mob { display: flex; gap: .5rem; }
  /* قائمة الهاتف: تطفو فوق المحتوى (لا تدفع الصورة للأسفل) */
  .cs-menu { position: absolute; top: 100%; inset-inline: 0; background: #fff; border-top: 1px solid var(--line); box-shadow: 0 18px 30px rgba(17,24,39,.12); max-height: calc(100vh - 80px); overflow-y: auto; }
  @media (min-width: 900px) { .cs-links { display: flex; } .cs-burger { display: none !important; } }

  /* الهيرو: صورة بعرض الشاشة + أسهم دائرية */
  .cs-hero { position: relative; background: var(--soft); overflow: hidden; }
  .cs-hero img { display: block; width: 100%; height: clamp(220px, 46vw, 560px); object-fit: cover; }
  .cs-arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 42px; height: 42px; border-radius: 50%; background: #111; color: #fff; border: 2px solid rgba(255,255,255,.85); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 2; }
  /* نص الهيرو فوق صورة الغلاف (العنوان والوصف من إعدادات المتجر) */
  .cs-hero-txt { position: absolute; inset: 0; display: flex; align-items: center; background: linear-gradient(var(--hdir), rgba(0,0,0,.62), rgba(0,0,0,.15) 70%, transparent); color: #fff; z-index: 1; }
  .cs-hero-txt > div { max-width: 1240px; margin: 0 auto; padding: 0 4.5rem; width: 100%; }
  .cs-hero-txt h1 { font-size: clamp(1.4rem, 4.4vw, 3.2rem); font-weight: 800; line-height: 1.2; max-width: 620px; word-break: break-word; text-shadow: 0 2px 12px rgba(0,0,0,.3); }
  .cs-hero-txt p { margin-top: .7rem; font-size: clamp(.85rem, 1.8vw, 1.1rem); opacity: .92; max-width: 520px; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .cs-hero-txt .cs-btn { width: auto; margin-top: 1.3rem; }
  @media (max-width: 640px) { .cs-hero-txt > div { padding: 0 1.25rem; } .cs-hero-txt p { -webkit-line-clamp: 2; } .cs-hero-txt .cs-btn { margin-top: .9rem; padding: .65rem 1rem; font-size: .85rem; } .cs-hero.has-txt img { height: clamp(280px, 70vw, 420px); } }
  /* غلاف الهاتف: يُعرض كاملاً بارتفاعه الطبيعي (لا يُقصّ) */
  @media (max-width: 640px) { .cs-hero.has-m img, .cs-hero.has-m.has-txt img { height: auto; max-height: none; object-fit: contain; } }
  .cs-hero-fallback { background: linear-gradient(135deg, var(--p), var(--p-dark)); color: var(--on-p); padding: clamp(3rem, 9vw, 6rem) 1.25rem; text-align: center; }
  .cs-hero-fallback h1 { font-size: clamp(1.8rem, 5vw, 3.2rem); font-weight: 800; line-height: 1.2; }
  .cs-hero-fallback p { opacity: .85; margin-top: .75rem; font-size: 1.02rem; }

  /* عنوان القسم مع خط تحته */
  .cs-title { text-align: center; margin-bottom: 2.25rem; }
  .cs-title h2 { font-size: clamp(1.6rem, 3.5vw, 2.3rem); font-weight: 800; color: var(--ink); }
  .cs-title i { display: block; width: 84px; height: 6px; border-radius: 6px; background: var(--p); margin: .9rem auto 0; }

  /* التصنيفات الدائرية */
  .cs-cats { display: flex; flex-wrap: wrap; justify-content: center; gap: clamp(1rem, 3vw, 2.5rem); }
  .cs-cat { display: flex; flex-direction: column; align-items: center; gap: .8rem; width: clamp(96px, 22vw, 150px); }
  .cs-cat-img { width: clamp(88px, 20vw, 140px); aspect-ratio: 1; border-radius: 50%; background: var(--soft); border: 4px solid #fff; box-shadow: 0 6px 20px rgba(17,24,39,.08); overflow: hidden; display: flex; align-items: center; justify-content: center; transition: transform .2s, box-shadow .2s; }
  .cs-cat-img img { width: 100%; height: 100%; object-fit: cover; }
  .cs-cat:hover .cs-cat-img { transform: translateY(-3px); }
  .cs-cat.on .cs-cat-img { box-shadow: 0 0 0 3px var(--p), 0 8px 22px rgba(17,24,39,.12); }
  .cs-cat span { font-weight: 800; font-size: .98rem; text-align: center; color: #374151; }
  .cs-cat.on span { color: var(--p-ink); }

  /* بطاقات المنتجات */
  .cs-products { background: var(--soft); padding: 4rem 0 4.5rem; }
  .cs-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .9rem; }
  @media (min-width: 768px)  { .cs-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.5rem; } }
  @media (min-width: 1180px) { .cs-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
  .cs-card { background: #fff; border: 1px solid var(--line); border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; height: 100%; transition: transform .2s, box-shadow .2s; }
  .cs-card:hover { transform: translateY(-4px); box-shadow: 0 16px 34px rgba(17,24,39,.1); }
  .cs-card-img { position: relative; aspect-ratio: 1; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .cs-card-img img { width: 100%; height: 100%; object-fit: contain; }
  .cs-card-body { padding: .9rem 1rem 1.1rem; display: flex; flex-direction: column; gap: .45rem; flex: 1; text-align: center; }
  .cs-card h3 { font-size: 1rem; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cs-price { color: var(--p-ink); font-weight: 800; font-size: 1.25rem; font-variant-numeric: tabular-nums; }
  .cs-price small { font-size: .72rem; font-weight: 700; color: var(--muted); margin-inline-end: 4px; }
  .cs-old { color: #9CA3AF; text-decoration: line-through; font-size: .8rem; font-weight: 600; }
  .cs-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--p); color: var(--on-p); font-weight: 800; border: none; border-radius: 12px; padding: .85rem 1.25rem; cursor: pointer; transition: background .15s, transform .1s; font-size: .95rem; width: 100%; }
  .cs-btn:hover { background: var(--p-dark); }
  .cs-btn:active { transform: scale(.98); }
  .cs-btn[disabled] { opacity: .65; cursor: not-allowed; }
  .cs-btn.ghost { background: #fff; color: var(--ink); border: 1.5px solid var(--line); }
  .cs-btn.ghost:hover { border-color: var(--p); color: var(--p-ink); background: #fff; }
  .cs-root a.cs-btn { color: var(--on-p); }
  .cs-root a.cs-btn.ghost { color: var(--ink); }
  .cs-card .cs-btn { white-space: nowrap; }
  @media (max-width: 520px) { .cs-card .cs-btn { padding: .7rem .4rem; font-size: .82rem; } .cs-card-body { padding: .75rem .7rem .9rem; } .cs-card .cs-price { font-size: 1.1rem; } }
  .cs-chip { position: absolute; top: 10px; inset-inline-start: 10px; background: var(--s); color: var(--on-s); font-size: .75rem; font-weight: 800; padding: 3px 9px; border-radius: 8px; }
  .cs-chip.alt { inset-inline-start: auto; inset-inline-end: 10px; background: var(--ink); color: #fff; display: flex; align-items: center; gap: 4px; }
  .cs-pages { display: flex; justify-content: center; gap: .4rem; flex-wrap: wrap; margin-top: 2.5rem; }
  .cs-pages a { min-width: 40px; height: 40px; border-radius: 10px; border: 1px solid var(--line); background: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; }
  .cs-pages a.on { background: var(--p); color: var(--on-p); border-color: var(--p); }

  /* صفحة المنتج */
  .cs-crumb { border-bottom: 1px solid var(--line); background: #fff; }
  .cs-crumb-in { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .8rem 1.25rem; font-size: .85rem; color: var(--muted); }
  .cs-crumb nav { display: flex; align-items: center; gap: .4rem; min-width: 0; }
  .cs-crumb nav b { color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 46vw; }
  .cs-stock { display: inline-flex; align-items: center; gap: 6px; background: #ECFDF5; color: #047857; font-weight: 800; font-size: .78rem; padding: 5px 11px; border-radius: 999px; }
  .cs-stock::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: #10B981; }
  .cs-stock.out { background: #FEF2F2; color: #B91C1C; } .cs-stock.out::before { background: #EF4444; }
  .cs-det { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1.75rem; padding-top: 1.5rem; padding-bottom: 4rem; }
  @media (min-width: 900px) { .cs-det { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 3rem; padding-top: 2.5rem; } .cs-gal { position: sticky; top: 92px; align-self: start; } }
  .cs-gal-main { position: relative; aspect-ratio: 1; background: #fff; border-radius: 20px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .cs-gal-main img { width: 100%; height: 100%; object-fit: contain; }
  .cs-thumbs { display: flex; gap: .7rem; margin-top: 1rem; flex-wrap: wrap; justify-content: center; }
  .cs-thumbs button { width: 72px; height: 72px; border-radius: 14px; overflow: hidden; border: 2px solid transparent; background: #fff; cursor: pointer; padding: 4px; }
  .cs-thumbs button.on { border-color: var(--ink); }
  .cs-thumbs img { width: 100%; height: 100%; object-fit: contain; }
  .cs-trust { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .7rem; margin-top: 1.5rem; }
  .cs-trust div { border: 1px solid var(--line); border-radius: 16px; padding: 1rem .6rem; text-align: center; background: #fff; }
  .cs-trust svg { color: var(--p-ink); margin: 0 auto .4rem; display: block; }
  .cs-trust b { display: block; font-size: .82rem; }
  .cs-trust small { color: var(--muted); font-size: .72rem; }
  .cs-show-m { display: grid; } .cs-hide-m { display: none; }
  @media (min-width: 900px) { .cs-show-m { display: none; } .cs-hide-m { display: grid; } }
  .cs-ptitle { font-size: clamp(1.6rem, 3.6vw, 2.4rem); font-weight: 800; line-height: 1.25; margin-bottom: 1rem; word-break: break-word; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .cs-pricebox { background: var(--soft); border-radius: 16px; padding: 1.1rem 1.3rem; display: flex; align-items: baseline; gap: .75rem; flex-wrap: wrap; margin-bottom: 1rem; }
  .cs-pricebox .cs-price { font-size: 2.1rem; color: var(--ink); }
  .cs-pricebox .cs-off { background: var(--s); color: var(--on-s); font-size: .78rem; font-weight: 800; padding: 3px 9px; border-radius: 8px; }
  .cs-note { display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--p-line); background: var(--p-soft); color: var(--p-dark); font-weight: 700; font-size: .85rem; padding: .5rem 1rem; border-radius: 999px; margin-bottom: 1.25rem; }
  .cs-offers { background: var(--s-soft); border-radius: 18px; padding: 1rem; margin-bottom: 1.4rem; }
  .cs-offers > p { display: flex; align-items: center; gap: 6px; font-weight: 800; font-size: .88rem; color: color-mix(in srgb, var(--s) 45%, #000); margin-bottom: .75rem; }
  .cs-offer { display: flex; align-items: center; justify-content: space-between; gap: .75rem; background: #fff; border: 2px solid var(--line); border-radius: 14px; padding: .9rem 1rem; cursor: pointer; margin-bottom: .6rem; transition: border-color .15s; }
  .cs-offer:last-child { margin-bottom: 0; }
  .cs-offer.on { border-color: var(--s); }
  .cs-radio { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #CBD5E1; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .cs-offer.on .cs-radio { border-color: var(--ink); } .cs-offer.on .cs-radio::after { content: ''; width: 10px; height: 10px; border-radius: 50%; background: var(--ink); }
  .cs-attr-name { font-size: .8rem; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: .6rem; }
  .cs-var-img { width: 72px; height: 72px; border-radius: 14px; border: 2px solid var(--line); background: #fff center/contain no-repeat; cursor: pointer; }
  .cs-var-img.on { border-color: var(--ink); }
  .cs-var-color { width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--line); cursor: pointer; }
  .cs-var-color.on { outline: 2.5px solid var(--ink); outline-offset: 3px; }
  .cs-var-text { padding: .5rem 1.1rem; border-radius: 10px; border: 1.5px solid var(--line); background: #fff; font-weight: 700; font-size: .88rem; cursor: pointer; color: #374151; }
  .cs-var-text.on { border-color: var(--ink); background: var(--ink); color: #fff; }
  .cs-var-off { opacity: .35; cursor: not-allowed !important; }
  .cs-addons { margin-bottom: 1.25rem; }
  .cs-addon { display: flex; align-items: center; gap: .6rem; border: 1.5px solid var(--line); border-radius: 14px; background: #fff; padding: .35rem .5rem .35rem .35rem; margin-bottom: .5rem; transition: border-color .15s; }
  .cs-addon.on { border-color: var(--p); background: var(--p-soft); }
  .cs-addon-main { flex: 1; min-width: 0; display: flex; align-items: center; gap: .6rem; background: none; border: none; padding: .45rem; cursor: pointer; color: var(--ink); text-align: start; font: inherit; }
  .cs-addon-main b { flex: 1; min-width: 0; font-size: .92rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cs-addon-main small { color: var(--muted); font-weight: 700; font-size: .8rem; white-space: nowrap; }
  .cs-addon.on .cs-addon-main small { color: var(--p-ink); }
  .cs-check-box { width: 20px; height: 20px; border-radius: 6px; border: 2px solid #CBD5E1; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--on-p); }
  .cs-addon.on .cs-check-box { background: var(--p); border-color: var(--p); }
  .cs-addon-qty { display: inline-flex; align-items: center; gap: .25rem; flex-shrink: 0; }
  .cs-addon-qty button { width: 32px; height: 32px; border-radius: 10px; border: 1.5px solid var(--line); background: #fff; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ink); }
  .cs-addon-qty button[disabled] { opacity: .4; cursor: not-allowed; }
  .cs-addon-qty span { min-width: 24px; text-align: center; font-weight: 800; }
  .cs-desc-html { font-size: .95rem; line-height: 1.85; color: #4B5563; }
  .cs-desc-html img { max-width: 100%; height: auto; border-radius: 12px; }

  /* نموذج الطلب */
  .cs-order { border: 1px solid var(--line); border-radius: 20px; background: #fff; overflow: hidden; margin-top: .5rem; }
  .cs-order-head { display: flex; align-items: flex-start; gap: .75rem; padding: 1.1rem 1.25rem; border-bottom: 1px solid var(--line); background: var(--soft); }
  .cs-order-head svg { color: var(--p-ink); flex-shrink: 0; margin-top: 2px; }
  .cs-order-head b { display: block; font-size: 1.05rem; }
  .cs-order-head small { color: var(--muted); font-size: .8rem; }
  .cs-order-body { padding: 1.25rem; }
  .cs-row2 { display: grid; grid-template-columns: minmax(0, 1fr); gap: .85rem; margin-bottom: .85rem; }
  @media (min-width: 520px) { .cs-row2 { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } }
  .cs-label { display: block; font-size: .8rem; font-weight: 800; color: #374151; margin-bottom: .4rem; }
  .cs-field { position: relative; }
  .cs-field > svg { position: absolute; top: 50%; transform: translateY(-50%); inset-inline-start: 12px; color: #9CA3AF; pointer-events: none; }
  .cs-field .cs-chev { inset-inline-start: auto; inset-inline-end: 12px; }
  .cs-input { width: 100%; height: 50px; padding: 0 1rem; padding-inline-start: 2.5rem; border: 1.5px solid var(--line); border-radius: 12px; background: #fff; font-size: .95rem; color: var(--ink); outline: none; appearance: none; font-family: inherit; transition: border-color .15s, box-shadow .15s; }
  .cs-input.plain { padding-inline-start: 1rem; }
  [dir=rtl] .cs-input[dir=ltr]:not(.plain) { padding-left: 1rem; padding-right: 2.5rem; }
  select.cs-input { padding-inline-end: 2.4rem; }
  .cs-input:focus { border-color: var(--p); box-shadow: 0 0 0 3px var(--p-soft); }
  .cs-input.err { border-color: #EF4444; }
  .cs-input:disabled { background: var(--soft); opacity: .75; }
  .cs-err { font-size: .76rem; color: #DC2626; margin-top: .35rem; display: flex; align-items: center; gap: 4px; }
  .cs-deliv { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: .75rem; }
  .cs-deliv button { border: 1.5px solid var(--line); border-radius: 16px; background: #fff; padding: 1rem .5rem; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: .35rem; color: #6B7280; transition: all .15s; }
  .cs-deliv button b { font-size: .9rem; color: var(--ink); }
  .cs-deliv button small { font-size: .82rem; font-weight: 700; }
  .cs-deliv button.on { background: var(--ink); border-color: var(--ink); color: #fff; }
  .cs-deliv button.on b { color: #fff; }
  .cs-qty { display: inline-flex; align-items: center; gap: .6rem; }
  .cs-qty button { width: 48px; height: 48px; border-radius: 12px; border: 1.5px solid var(--line); background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ink); }
  .cs-qty span { min-width: 48px; text-align: center; font-size: 1.25rem; font-weight: 800; }
  .cs-sum { background: var(--soft); border-radius: 16px; padding: 1rem 1.1rem; margin: 1.1rem 0; }
  .cs-sum div { display: flex; justify-content: space-between; gap: .75rem; padding: .45rem 0; font-size: .88rem; }
  .cs-sum div + div { border-top: 1px dashed #D1D5DB; }
  .cs-sum span { color: var(--muted); display: inline-flex; align-items: center; gap: 6px; }
  .cs-sum b { text-align: end; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cs-sum .cs-total b { color: var(--p-ink); font-size: 1.4rem; }
  .cs-offer-tag { background: var(--s-soft); color: color-mix(in srgb, var(--s) 45%, #000); border: 1px solid var(--s-line); font-size: .76rem; font-weight: 800; padding: 2px 9px; border-radius: 8px; }
  .cs-two { display: flex; flex-direction: column; gap: .7rem; margin-bottom: 1rem; }
  @media (min-width: 520px) { .cs-two { flex-direction: row; } }

  /* السلة */
  .cs-cart { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1.5rem; padding: 2rem 0 4rem; }
  @media (min-width: 1000px) { .cs-cart { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 2.5rem; } }
  .cs-box { background: #fff; border: 1px solid var(--line); border-radius: 20px; overflow: hidden; align-self: start; }

  /* النجاح */
  .cs-success { text-align: center; padding: 3.5rem 1.25rem 2rem; background: radial-gradient(60% 60% at 50% 30%, #ECFDF5, #fff 70%); }
  .cs-check { width: 92px; height: 92px; border-radius: 50%; background: #10B981; color: #fff; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; box-shadow: 0 0 0 12px #D1FAE5; }
  .cs-progress { height: 10px; border-radius: 10px; background: #E5E7EB; overflow: hidden; }
  .cs-progress i { display: block; height: 100%; width: 100%; background: #10B981; border-radius: 10px; }

  /* الفوتر */
  .cs-foot { background: var(--ink); color: #D1D5DB; padding: 3.5rem 0 1.5rem; margin-top: 0; }
  .cs-foot-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 2rem; padding-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,.08); }
  @media (min-width: 768px) { .cs-foot-grid { grid-template-columns: minmax(0, 1.6fr) repeat(3, minmax(0, 1fr)); } }
  .cs-foot h4 { color: #fff; font-size: .95rem; font-weight: 800; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px; }
  .cs-foot h4::before { content: ''; width: 16px; height: 4px; border-radius: 4px; background: var(--p); }
  .cs-foot a, .cs-foot p { display: block; font-size: .88rem; color: #9CA3AF; margin-bottom: .6rem; line-height: 1.6; }
  .cs-foot a:hover { color: #fff; }

  /* الصفحات الثابتة */
  .cs-page-head { background: var(--soft); padding: 3.5rem 1.25rem 2.5rem; text-align: center; border-bottom: 1px solid var(--line); }
  .cs-page-head h1 { font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 800; }
  .cs-page-head i { display: block; width: 70px; height: 5px; border-radius: 5px; background: var(--p); margin: .9rem auto 0; }
  .cs-contact { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1.5rem; padding-top: 3rem; padding-bottom: 5rem; }
  @media (min-width: 900px) { .cs-contact { grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr); } }

  .cs-drop { position: absolute; top: calc(100% + 8px); inset-inline: 0; background: #fff; border: 1px solid var(--line); border-radius: 14px; box-shadow: 0 16px 40px rgba(0,0,0,.12); z-index: 60; max-height: 340px; overflow-y: auto; }
`;

/* ─── TYPES ─── */
interface Offer { id: string; name: string; subTitle?: string; quantity: number; price: number; shippingFree?: boolean; }
interface Variant { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color' | 'image' | 'text' | null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color' | 'image' | 'text'; value: string; }
interface VariantDetail { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya { id: string; code?: number; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }
export interface Product {
  id: string; name: string; price: string | number; priceOriginal?: string | number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[]; offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean; shippingFree?: boolean;
  isDigital?: boolean; whatsappEnabled?: boolean; whatsappNumber?: string | null;
  addons?: { id: string; name: string; price: number | string; isActive?: boolean }[] | null;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; supportQty?: boolean; supportFreeShipping?: boolean; freeShippingMinAmount?: number | null; };
}
export interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>; platform?: string; priceLoss?: number;
  store?: any;
}

// نوع التوصيل المتاح في الولاية المختارة (منزل / مكتب) حسب حساب الشحن — قبل اختيار الولاية يظهر الاثنان
const deliveryAllowed = (list: any[], wilayaId: any, type: 'home' | 'office') => {
  const w = (list || []).find((x: any) => String(x.id) === String(wilayaId));
  return !w || (type === 'home' ? w.homeEnabled !== false : w.officeEnabled !== false);
};
// خيار نوع التوصيل يظهر فقط بعد اختيار الولاية، وحسب ما هو متاح فيها
const deliveryShown = (list: any[], wilayaId: any, type: 'home' | 'office') => !!wilayaId && deliveryAllowed(list, wilayaId, type);

function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
}
const fetchWilayas = async (uid: string, sid?: string): Promise<Wilaya[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}${sid ? `?storeId=${sid}` : ''}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data || []; } catch { return []; } };
const money = (n: any) => Number(n || 0).toLocaleString('en-US');
// حدّ لعدد حروف اسم المنتج (المسار والبطاقة والملخص) — الاسم الكامل في العنوان title
// ─── الإضافات بكمية مستقلة عن كمية المنتج: { معرّف: كمية } حتى (maxQty × عدد القطع) — maxQty لكل قطعة يحدده التاجر (الافتراضي 1) ───
// سعرها يُضاف مرة واحدة للطلب (لا لكل قطعة)، والسيرفر يعيد حسابه من أسعار المنتج (addonQty)
type Addon = { id: string; name: string; price: number | string; isActive?: boolean; maxQty?: number };
type AddonQty = Record<string, number>;
const addonList = (product: any): Addon[] => (product?.addons ?? []).filter((a: Addon) => a && a.isActive !== false && a.name);
const addonMax = (a: Addon, pieces = 1) => Math.max(1, Math.floor(Number(a.maxQty) || 1)) * Math.max(1, pieces);
const addonLines = (product: any, q: AddonQty = {}) => addonList(product).filter((a) => (q[a.id] || 0) > 0).map((a) => ({ a, n: q[a.id] }));
const addonExtra = (product: any, q: AddonQty = {}) => addonLines(product, q).reduce((s, { a, n }) => s + n * (Number(a.price) || 0), 0);
// سلة قديمة (addonIds لكل قطعة) أو جديدة (addonQty)
const addonNames = (product: any, q?: AddonQty, ids: string[] = []) => (q
  ? addonLines(product, q).map(({ a, n }) => (n > 1 ? `${a.name} ×${n}` : a.name))
  : addonList(product).filter((a) => ids.includes(a.id)).map((a) => a.name)).join('، ');

function AddonsPicker({ product, store, value, onChange, pieces = 1 }: { product: any; store: any; value: AddonQty; onChange: (v: AddonQty) => void; pieces?: number }) {
  const list = addonList(product);
  if (!list.length) return null;
  const t = T[getLang(store)];
  const cur = curOf(store);
  const setN = (id: string, n: number) => { const v = { ...value }; if (n > 0) v[id] = n; else delete v[id]; onChange(v); };
  return (
    <div className="cs-addons">
      <p className="cs-attr-name">{t.addonsTitle}</p>
      {list.map((a) => {
        const n = value[a.id] || 0; const max = addonMax(a, pieces); const price = Number(a.price) || 0;
        return (
          <div key={a.id} className={`cs-addon ${n ? 'on' : ''}`}>
            <button type="button" className="cs-addon-main" aria-pressed={n > 0} onClick={() => setN(a.id, n ? 0 : 1)}>
              <span className="cs-check-box">{n ? <Check size={13} /> : null}</span>
              <b>{a.name}</b>
              <small>{price ? <><bdi dir="ltr">+{money(price)}</bdi> {cur}</> : t.free}</small>
            </button>
            {max > 1 && n > 0 && (
              <div className="cs-addon-qty" dir="ltr">
                <button type="button" aria-label="-" onClick={() => setN(a.id, n - 1)}><Minus size={14} /></button>
                <span>{n}</span>
                <button type="button" aria-label="+" disabled={n >= max} onClick={() => setN(a.id, Math.min(max, n + 1))}><Plus size={14} /></button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
const clip = (s: any, n: number) => { const v = String(s || '').trim(); return v.length > n ? v.slice(0, n).trimEnd() + '…' : v; };

// ─── Translations ─────────────────────────────────────────────────────────────
const jsonAr = {
  dir: 'rtl',
  home: 'الرئيسية', contact: 'اتصل بنا', cart: 'السلة', categoriesNav: 'التصنيفات', productsNav: 'المنتجات',
  search: 'ابحث عن منتج...', searching: 'جاري البحث...', noResults: 'لا توجد نتائج', showAll: 'عرض كل النتائج',
  all: 'كل المنتجات', noProducts: 'لا توجد منتجات متاحة حالياً', shopNow: 'تسوّق الآن', searchResultsFor: 'نتائج البحث عن:',
  categories: 'التصنيفات', products: 'المنتجات', viewDetails: 'عرض التفاصيل', prev: 'السابق', next: 'التالي',
  fullName: 'الاسم الكامل', fullNamePh: 'أدخل اسمك', errName: 'الاسم مطلوب',
  phone: 'رقم الهاتف', phonePh: '05xxxxxxxx', errPhone: 'رقم الهاتف مطلوب', errPhoneInvalid: 'رقم هاتف غير صالح',
  orderEmail: 'البريد الإلكتروني', emailPh: 'example@email.com', errEmail: 'يرجى إدخال بريد إلكتروني صحيح',
  whatsapp: 'رقم واتساب', whatsappPh: '0550123456', errWhatsapp: 'رقم واتساب جزائري صحيح مطلوب (مثال: 0550123456)',
  contactQuestion: 'هل تملك بريداً إلكترونياً أم واتساب؟', contactViaEmail: 'البريد الإلكتروني', contactViaWhatsapp: 'واتساب',
  wilaya: 'الولاية', errWilaya: 'الولاية مطلوبة', wilayaPh: 'اختر الولاية', wilayaNA: 'التوصيل غير متاح حالياً',
  commune: 'البلدية', errCommune: 'البلدية مطلوبة', communePh: 'اختر البلدية', communeFirst: 'اختر الولاية أولاً', communeLoading: 'جاري التحميل...',
  deliveryType: 'نوع التوصيل', deliveryHome: 'توصيل للمنزل', deliveryOffice: 'استلام من المكتب', pickWilayaForPrice: 'اختر الولاية لعرض تكلفة التوصيل',
  qty: 'الكمية', piece: 'قطعة', product: 'المنتج', price: 'السعر', selectedOffer: 'العرض المختار',
  freeShippingBadge: 'توصيل مجاني', freeShippingThreshold: 'توصيل مجاني للطلبات بـ {{amount}} دج أو أكثر',
  freeShippingRemaining: 'أضف {{amount}} دج أخرى للحصول على توصيل مجاني', freeShippingReached: 'حصلت على توصيل مجاني!',
  delivery: 'التوصيل', total: 'الإجمالي', subtotal: 'المجموع الفرعي', orderInfo: 'ملخص الطلب',
  addToCart: 'أضف إلى السلة', orderNow: 'اطلب الآن', confirmOrder: 'تأكيد الطلب', sending: 'جاري الإرسال...', back: 'رجوع',
  addedMsg: 'تمت الإضافة إلى السلة', errSubmit: 'حدث خطأ أثناء إرسال الطلب، حاول مرة أخرى',
  orderCardTitle: 'أدخل بيانات التسليم', orderCardSub: 'سنتواصل معك هاتفياً لتأكيد طلبك',
  myCart: 'سلة المشتريات', cartEmpty: 'السلة فارغة', cartEmptyDesc: 'لم تقم بإضافة أي منتجات بعد',
  successBadge: 'طلب ناجح', successTitle: 'تم تأكيد طلبك!', successDesc: 'شكراً لثقتك بنا. طلبك في أيدٍ أمينة وسنتواصل معك قريباً لتأكيد التسليم',
  progressLabel: 'تقدّم الطلب', progressDone: 'استلمنا طلبك وبدأنا بمعالجته', backToShop: 'العودة للتسوق', checkoutTitle: 'إتمام الطلب',
  successSteps: [
    { title: 'تم استلام طلبك', desc: 'سُجّل طلبك بنجاح' },
    { title: 'تأكيد الطلب', desc: 'سنتصل بك قريباً' },
    { title: 'التجهيز والشحن', desc: 'نجهّز طلبك ونرسله' },
    { title: 'التوصيل', desc: 'يصلك وتدفع عند الاستلام' },
  ],
  addonsTitle: 'الإضافات', free: 'مجاناً',
  offersTitle: 'العروض المتاحة', piecesInOffer: '{{n}} قطع في العرض', descTitle: 'الوصف',
  share: 'مشاركة', linkCopied: 'تم نسخ الرابط', inStock: 'متوفر', outOfStock: 'غير متوفر', discountLabel: 'خصم',
  trust: [
    { t: 'توصيل لكل الولايات', d: 'للمنزل أو المكتب' },
    { t: 'الدفع عند الاستلام', d: 'ادفع عندما يصلك' },
    { t: 'تأكيد بالهاتف', d: 'قبل الشحن' },
  ],
  contactTagline: 'نحن هنا للإجابة على استفساراتكم', contactInfoTitle: 'معلومات الاتصال', contactPhone: 'الهاتف',
  contactLocation: 'الموقع', contactNA: 'غير متوفر', contactDefaultLocation: 'الجزائر', sendAnother: 'إرسال رسالة أخرى',
  email: 'البريد الإلكتروني', message: 'رسالتك', messagePh: 'كيف يمكننا مساعدتك؟', sendMsg: 'إرسال الرسالة', msgSent: 'تم إرسال رسالتك',
  footerDesc: 'متجر إلكتروني بتوصيل لكل الولايات والدفع عند الاستلام.',
  quickLinks: 'روابط سريعة', legalNav: 'قانوني', contactSect: 'تواصل معنا',
  privacy: 'سياسة الخصوصية', terms: 'شروط الاستخدام', cookies: 'ملفات الارتباط', rightsReserved: 'جميع الحقوق محفوظة',
  pages: {
    privacy: { title: 'سياسة الخصوصية', blocks: [
      { title: 'البيانات التي نجمعها', body: 'نجمع فقط المعلومات الضرورية لمعالجة طلباتكم، مثل الاسم ورقم الهاتف وعنوان التوصيل.' },
      { title: 'حماية البيانات', body: 'نحافظ على بياناتكم ولا نستعملها إلا لمعالجة طلباتكم والتواصل معكم بشأنها.' },
      { title: 'مشاركة المعلومات', body: 'لا نبيع بياناتكم ولا نشاركها مع أي جهة، باستثناء شركات التوصيل لإيصال طلبكم.' },
    ] },
    terms: { title: 'شروط الاستخدام', blocks: [
      { title: 'الطلبات', body: 'يتم تأكيد الطلبات عبر الهاتف قبل الشحن، والأسعار المعروضة هي الأسعار النهائية للمنتجات.' },
      { title: 'التوصيل والدفع', body: 'تكلفة التوصيل حسب الولاية ونوع التوصيل، والدفع عند الاستلام.' },
      { title: 'القانون الحاكم', body: 'تخضع كل التعاملات للقوانين المعمول بها في الجمهورية الجزائرية الديمقراطية الشعبية.' },
    ] },
    cookies: { title: 'ملفات تعريف الارتباط', blocks: [
      { title: 'الملفات الأساسية', body: 'نستعمل ملفات ضرورية لعمل سلة المشتريات وحفظ اختياراتكم في المتجر.' },
      { title: 'تحسين التجربة', body: 'تساعدنا بعض الملفات على فهم استعمال المتجر لتحسين خدماتنا.' },
    ] },
  },
};

const jsonFr: typeof jsonAr = {
  dir: 'ltr',
  home: 'Accueil', contact: 'Contact', cart: 'Panier', categoriesNav: 'Catégories', productsNav: 'Produits',
  search: 'Rechercher un produit...', searching: 'Recherche...', noResults: 'Aucun résultat', showAll: 'Voir tous les résultats',
  all: 'Tous les produits', noProducts: 'Aucun produit disponible pour le moment.', shopNow: 'Acheter', searchResultsFor: 'Résultats pour :',
  categories: 'Catégories', products: 'Produits', viewDetails: 'Voir les détails', prev: 'Précédent', next: 'Suivant',
  fullName: 'Nom complet', fullNamePh: 'Votre nom', errName: 'Le nom est requis',
  phone: 'Téléphone', phonePh: '0555 12 34 56', errPhone: 'Le numéro est requis', errPhoneInvalid: 'Numéro de téléphone invalide',
  orderEmail: 'E-mail', emailPh: 'exemple@email.com', errEmail: 'Veuillez saisir une adresse e-mail valide',
  whatsapp: 'Numéro WhatsApp', whatsappPh: '0550123456', errWhatsapp: 'Numéro WhatsApp algérien valide requis (ex : 0550123456)',
  contactQuestion: 'Avez-vous un e-mail ou un numéro WhatsApp ?', contactViaEmail: 'E-mail', contactViaWhatsapp: 'WhatsApp',
  wilaya: 'Wilaya', errWilaya: 'Sélectionnez une wilaya', wilayaPh: 'Choisir la wilaya', wilayaNA: 'Livraison indisponible pour le moment',
  commune: 'Commune', errCommune: 'Sélectionnez une commune', communePh: 'Choisir la commune', communeFirst: "Choisissez d'abord la wilaya", communeLoading: 'Chargement...',
  deliveryType: 'Type de livraison', deliveryHome: 'À domicile', deliveryOffice: 'Retrait au bureau', pickWilayaForPrice: 'Choisissez la wilaya pour voir le prix de livraison',
  qty: 'Quantité', piece: 'pièce(s)', product: 'Produit', price: 'Prix', selectedOffer: 'Offre choisie',
  freeShippingBadge: 'Livraison gratuite', freeShippingThreshold: "Livraison gratuite dès {{amount}} DA d'achat",
  freeShippingRemaining: 'Ajoutez {{amount}} DA pour la livraison gratuite', freeShippingReached: 'Livraison gratuite obtenue !',
  delivery: 'Livraison', total: 'Total', subtotal: 'Sous-total', orderInfo: 'Récapitulatif',
  addToCart: 'Ajouter au panier', orderNow: 'Commander', confirmOrder: 'Confirmer la commande', sending: 'Envoi en cours...', back: 'Retour',
  addedMsg: 'Ajouté au panier', errSubmit: 'Une erreur est survenue, veuillez réessayer.',
  orderCardTitle: 'Vos informations de livraison', orderCardSub: 'Nous vous appellerons pour confirmer la commande',
  myCart: 'Mon panier', cartEmpty: 'Votre panier est vide', cartEmptyDesc: "Vous n'avez encore ajouté aucun produit.",
  successBadge: 'Commande réussie', successTitle: 'Commande confirmée !', successDesc: 'Merci pour votre confiance. Nous vous contacterons très bientôt pour confirmer la livraison.',
  progressLabel: 'Avancement', progressDone: 'Commande reçue, nous la traitons', backToShop: 'Retour à la boutique', checkoutTitle: 'Finaliser la commande',
  successSteps: [
    { title: 'Commande reçue', desc: 'Enregistrée avec succès' },
    { title: 'Confirmation', desc: 'Nous vous appellerons bientôt' },
    { title: 'Préparation', desc: 'Nous préparons votre colis' },
    { title: 'Livraison', desc: 'Paiement à la réception' },
  ],
  addonsTitle: 'Suppléments', free: 'Gratuit',
  offersTitle: 'Offres disponibles', piecesInOffer: '{{n}} pièce(s) dans l’offre', descTitle: 'Description',
  share: 'Partager', linkCopied: 'Lien copié', inStock: 'En stock', outOfStock: 'Indisponible', discountLabel: 'Promo',
  trust: [
    { t: 'Livraison 58 wilayas', d: 'Domicile ou bureau' },
    { t: 'Paiement à la livraison', d: 'Payez à réception' },
    { t: 'Confirmation par appel', d: 'Avant expédition' },
  ],
  contactTagline: 'Nous sommes là pour répondre à vos questions', contactInfoTitle: 'Coordonnées', contactPhone: 'Téléphone',
  contactLocation: 'Adresse', contactNA: 'Non disponible', contactDefaultLocation: 'Algérie', sendAnother: 'Envoyer un autre message',
  email: 'E-mail', message: 'Message', messagePh: 'Comment pouvons-nous vous aider ?', sendMsg: 'Envoyer', msgSent: 'Message envoyé',
  footerDesc: 'Boutique en ligne avec livraison dans toute l’Algérie et paiement à la livraison.',
  quickLinks: 'Navigation', legalNav: 'Légal', contactSect: 'Contact',
  privacy: 'Confidentialité', terms: 'Conditions', cookies: 'Cookies', rightsReserved: 'Tous droits réservés.',
  pages: {
    privacy: { title: 'Politique de confidentialité', blocks: [
      { title: 'Données collectées', body: 'Uniquement le nécessaire au traitement de vos commandes : nom, téléphone et adresse de livraison.' },
      { title: 'Protection', body: 'Vos données servent uniquement à traiter vos commandes et à vous contacter à leur sujet.' },
      { title: 'Partage', body: 'Nous ne vendons pas vos données et ne les partageons qu’avec le transporteur pour la livraison.' },
    ] },
    terms: { title: "Conditions d'utilisation", blocks: [
      { title: 'Commandes', body: 'Les commandes sont confirmées par téléphone avant expédition. Les prix affichés sont définitifs.' },
      { title: 'Livraison et paiement', body: 'Le prix de livraison dépend de la wilaya et du mode choisi. Paiement à la réception.' },
      { title: 'Loi applicable', body: 'Toutes les transactions sont soumises aux lois en vigueur en Algérie.' },
    ] },
    cookies: { title: 'Cookies', blocks: [
      { title: 'Cookies essentiels', body: 'Nécessaires au panier et à la mémorisation de vos choix.' },
      { title: 'Amélioration', body: 'Certains cookies nous aident à comprendre l’usage de la boutique pour l’améliorer.' },
    ] },
  },
};

const jsonEn: typeof jsonAr = {
  dir: 'ltr',
  home: 'Home', contact: 'Contact', cart: 'Cart', categoriesNav: 'Categories', productsNav: 'Products',
  search: 'Search for a product...', searching: 'Searching...', noResults: 'No results found', showAll: 'View all results',
  all: 'All products', noProducts: 'No products available at the moment.', shopNow: 'Shop now', searchResultsFor: 'Search results for:',
  categories: 'Categories', products: 'Products', viewDetails: 'View details', prev: 'Previous', next: 'Next',
  fullName: 'Full name', fullNamePh: 'Enter your name', errName: 'Name is required',
  phone: 'Phone number', phonePh: '05xxxxxxxx', errPhone: 'Phone number is required', errPhoneInvalid: 'Invalid phone number',
  orderEmail: 'Email', emailPh: 'example@email.com', errEmail: 'Please enter a valid email address',
  whatsapp: 'WhatsApp number', whatsappPh: '0550123456', errWhatsapp: 'A valid Algerian WhatsApp number is required (e.g. 0550123456)',
  contactQuestion: 'Do you have an email or a WhatsApp number?', contactViaEmail: 'Email', contactViaWhatsapp: 'WhatsApp',
  wilaya: 'Wilaya', errWilaya: 'Please select a wilaya', wilayaPh: 'Choose wilaya', wilayaNA: 'Delivery not available',
  commune: 'Commune', errCommune: 'Please select a commune', communePh: 'Choose commune', communeFirst: 'Choose the wilaya first', communeLoading: 'Loading...',
  deliveryType: 'Delivery type', deliveryHome: 'Home delivery', deliveryOffice: 'Office pickup', pickWilayaForPrice: 'Choose the wilaya to see the delivery price',
  qty: 'Quantity', piece: 'item(s)', product: 'Product', price: 'Price', selectedOffer: 'Selected offer',
  freeShippingBadge: 'Free delivery', freeShippingThreshold: 'Free delivery on orders over {{amount}} DA',
  freeShippingRemaining: 'Add {{amount}} DA more for free delivery', freeShippingReached: 'You got free delivery!',
  delivery: 'Delivery', total: 'Total', subtotal: 'Subtotal', orderInfo: 'Order summary',
  addToCart: 'Add to cart', orderNow: 'Order now', confirmOrder: 'Confirm order', sending: 'Sending...', back: 'Back',
  addedMsg: 'Added to cart', errSubmit: 'An error occurred. Please try again.',
  orderCardTitle: 'Enter your delivery details', orderCardSub: 'We will call you to confirm your order',
  myCart: 'My cart', cartEmpty: 'Your cart is empty', cartEmptyDesc: 'You have not added any products yet.',
  successBadge: 'Order placed', successTitle: 'Your order is confirmed!', successDesc: 'Thank you for your trust. We will contact you shortly to confirm the delivery.',
  progressLabel: 'Order progress', progressDone: 'We received your order and started processing it', backToShop: 'Back to shop', checkoutTitle: 'Checkout',
  successSteps: [
    { title: 'Order received', desc: 'Registered successfully' },
    { title: 'Confirmation', desc: "We'll call you shortly" },
    { title: 'Packing & shipping', desc: 'We prepare and ship it' },
    { title: 'Delivery', desc: 'Pay when it arrives' },
  ],
  addonsTitle: 'Add-ons', free: 'Free',
  offersTitle: 'Available offers', piecesInOffer: '{{n}} item(s) in the offer', descTitle: 'Description',
  share: 'Share', linkCopied: 'Link copied', inStock: 'In stock', outOfStock: 'Out of stock', discountLabel: 'OFF',
  trust: [
    { t: 'Nationwide delivery', d: 'Home or office' },
    { t: 'Cash on delivery', d: 'Pay when it arrives' },
    { t: 'Phone confirmation', d: 'Before shipping' },
  ],
  contactTagline: 'We are here to answer your questions', contactInfoTitle: 'Contact information', contactPhone: 'Phone',
  contactLocation: 'Location', contactNA: 'Not available', contactDefaultLocation: 'Algeria', sendAnother: 'Send another message',
  email: 'Email', message: 'Your message', messagePh: 'How can we help you?', sendMsg: 'Send message', msgSent: 'Message sent',
  footerDesc: 'Online store with nationwide delivery and cash on delivery.',
  quickLinks: 'Quick links', legalNav: 'Legal', contactSect: 'Contact us',
  privacy: 'Privacy', terms: 'Terms', cookies: 'Cookies', rightsReserved: 'All rights reserved.',
  pages: {
    privacy: { title: 'Privacy policy', blocks: [
      { title: 'Data we collect', body: 'Only what is needed to process your orders: name, phone number and delivery address.' },
      { title: 'Data protection', body: 'Your data is used only to process your orders and contact you about them.' },
      { title: 'Sharing', body: 'We do not sell your data and only share it with the delivery company to deliver your order.' },
    ] },
    terms: { title: 'Terms of use', blocks: [
      { title: 'Orders', body: 'Orders are confirmed by phone before shipping. Displayed prices are final.' },
      { title: 'Delivery & payment', body: 'Delivery price depends on the wilaya and the delivery type. Payment on delivery.' },
      { title: 'Governing law', body: 'All transactions are subject to the laws in force in Algeria.' },
    ] },
    cookies: { title: 'Cookies', blocks: [
      { title: 'Essential cookies', body: 'Needed for the cart and to remember your choices.' },
      { title: 'Improvement', body: 'Some cookies help us understand how the store is used so we can improve it.' },
    ] },
  },
};

type Lang = 'ar' | 'fr' | 'en';
const T: Record<Lang, typeof jsonAr> = { ar: jsonAr, fr: jsonFr, en: jsonEn };
const getLang = (store?: any): Lang => (store?.language === 'fr' ? 'fr' : store?.language === 'en' ? 'en' : 'ar');
const curOf = (store: any) => store?.currency || 'DZD';

/* ═══════════ MAIN ═══════════ */
export default function Main({ store, children, domain }: any) {
  const pathname = usePathname();
  const isRTL = getLang(store) === 'ar';
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="cs-root" style={brandVars(store)}>
      <style>{THEME_CSS}</style>
      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ═══════════ NAVBAR ═══════════ */
export function Navbar({ store, domain }: { store: any; domain: string }) {
  const lang = getLang(store);
  const t = T[lang];
  const isRTL = lang === 'ar';
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const router = useRouter();
  const count = useCartStore((s) => s.count);
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => {
    if (domain) { try { initCount(JSON.parse(localStorage.getItem(domain) || '[]').length); } catch { initCount(0); } }
  }, [domain, initCount]);

  useEffect(() => {
    if (q.length < 2) { setResults([]); return; }
    const id = setTimeout(async () => {
      setLoading(true);
      try { const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: q } }); setResults(data.products || []); }
      catch { /* ignore */ } finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(id);
  }, [q, domain]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (q.trim()) { router.push(`/?search=${encodeURIComponent(q)}`); setResults([]); setShowSearch(false); }
  };
  const hasLogo = store?.design?.logoUrl && store.design.logoUrl !== '/default-logo.png' && !imgError;
  const links = [{ h: '/', l: t.home }, { h: '/#categories', l: t.categoriesNav }, { h: '/#products', l: t.productsNav }, { h: '/contact', l: t.contact }];

  return (
    <>
      {store?.topBar?.enabled && store?.topBar?.text && <div className="cs-topbar">{store.topBar.text}</div>}
      <nav className="cs-nav">
        <div className="cs-wrap cs-nav-in">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flexDirection: store?.design?.nameBeforeLogo ? 'row-reverse' : 'row' }}>
            {hasLogo && <img decoding="async" src={store.design.logoUrl} alt={store?.name || ''} onError={() => setImgError(true)} style={{ height: 40, width: 'auto', objectFit: 'contain' }} />}
            {(!hasLogo || store?.design?.showStoreName !== false) && (
              <span style={{ fontWeight: 800, fontSize: '1.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '52vw' }}>{store?.name}</span>
            )}
          </Link>

          <div className="cs-links">
            {links.map((l) => <Link key={l.h} href={l.h} className="cs-link">{l.l}</Link>)}
          </div>

          <div className="cs-mob">
            <button aria-label={t.search} className="cs-icon-btn" onClick={() => setShowSearch((s) => !s)}><Search size={17} /></button>
            {store?.cart !== false && (
              <Link href="/cart" aria-label={t.cart} className="cs-icon-btn">
                <ShoppingCart size={17} />
                {count > 0 && <span className="cs-badge">{count}</span>}
              </Link>
            )}
            <button aria-label="menu" className="cs-icon-btn cs-burger" onClick={() => setOpen((o) => !o)}>{open ? <X size={17} /> : <Menu size={17} />}</button>
          </div>
        </div>

        {showSearch && (
          <div className="cs-wrap cs-fade" style={{ paddingBottom: '.9rem' }}>
            <form onSubmit={submit} style={{ position: 'relative' }}>
              <div className="cs-field">
                <Search size={16} />
                <input autoFocus className="cs-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} />
              </div>
              {q.length >= 2 && (
                <div className="cs-drop">
                  {loading ? <p style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--p-ink)', fontWeight: 700 }}>{t.searching}</p>
                    : results.length ? (
                      <>
                        {results.map((p: any) => (
                          <Link key={p.id} href={`/product/${p.slug || p.id}`} onClick={() => setQ('')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '.7rem 1rem', borderBottom: '1px solid var(--line)' }}>
                            <img loading="lazy" decoding="async" src={p.productImage || p.imagesProduct?.[0]?.imageUrl} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0, background: 'var(--soft)' }} />
                            <span style={{ flex: 1, minWidth: 0 }}>
                              <b style={{ display: 'block', fontSize: '.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</b>
                              <span className="cs-price" style={{ fontSize: '.85rem' }}>{money(p.price)} <small>{curOf(store)}</small></span>
                            </span>
                          </Link>
                        ))}
                        <button type="submit" style={{ width: '100%', padding: '.8rem', border: 'none', background: 'var(--p-soft)', color: 'var(--p-ink)', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          {t.showAll} {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                        </button>
                      </>
                    ) : <p style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--muted)' }}>{t.noResults}</p>}
                </div>
              )}
            </form>
          </div>
        )}

        {open && (
          <div className="cs-menu cs-fade">
            <div className="cs-wrap" style={{ padding: '.25rem 1.25rem .75rem' }}>
              {links.map((l) => (
                <Link key={l.h} href={l.h} onClick={() => setOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.85rem 0', borderBottom: '1px solid var(--line)', fontWeight: 700 }}>
                  {l.l} {isRTL ? <ChevronLeft size={16} color="var(--p-ink)" /> : <ChevronRight size={16} color="var(--p-ink)" />}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

/* ═══════════ FOOTER ═══════════ */
export function Footer({ store }: any) {
  const t = T[getLang(store)];
  const c = store?.contact || {};
  return (
    <footer className="cs-foot">
      <div className="cs-wrap">
        <div className="cs-foot-grid">
          <div>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem', marginBottom: '.75rem' }}>{store?.name}</p>
            <p style={{ maxWidth: 340 }}>{store?.hero?.subtitle?.substring(0, 120) || t.footerDesc}</p>
          </div>
          <div>
            <h4>{t.quickLinks}</h4>
            {[{ h: '/', l: t.home }, { h: '/cart', l: t.cart }, { h: '/contact', l: t.contact }].filter((l) => l.h !== '/cart' || store?.cart !== false).map((l) => <Link key={l.h} href={l.h}>{l.l}</Link>)}
          </div>
          <div>
            <h4>{t.legalNav}</h4>
            {[{ h: '/Privacy', l: t.privacy }, { h: '/Terms', l: t.terms }, { h: '/cookies', l: t.cookies }].map((l) => <Link key={l.h} href={l.h}>{l.l}</Link>)}
          </div>
          <div>
            <h4>{t.contactSect}</h4>
            {[
              { icon: <Phone size={14} />, val: c.phone ? <span dir="ltr">{c.phone}</span> : comingSoon(store) },
              { icon: <WhatsAppGlyph size={14} />, val: c.whatsapp ? <span dir="ltr">{c.whatsapp}</span> : comingSoon(store) },
              { icon: <Mail size={14} />, val: c.email ? <span dir="ltr">{c.email}</span> : comingSoon(store) },
              ...(c.wilaya || c.address ? [{ icon: <MapPin size={14} />, val: [c.wilaya, c.address].filter(Boolean).join(' / ') }] : []),
            ].map((r, i) => (
              <p key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: 'var(--p-ink)', display: 'flex' }}>{r.icon}</span>{r.val}</p>
            ))}
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: '.8rem', color: '#6B7280', marginTop: '1.25rem', marginBottom: 0 }}>© {new Date().getFullYear()} {store?.name}. {t.rightsReserved}</p>
      </div>
    </footer>
  );
}

/* ═══════════ CARD ═══════════ */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const t = T[getLang(store)];
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  return (
    <Link href={`/product/${product.slug || product.id}`} className="cs-card">
      <div className="cs-card-img">
        {displayImage
          ? <img loading="lazy" decoding="async" src={displayImage} alt={product.name} />
          : <Package size={44} color="#D1D5DB" />}
        {discount > 0 && <span className="cs-chip"><bdi dir="ltr">-{discount}%</bdi></span>}
        {product.isDigital
          ? <span className="cs-chip alt"><Download size={12} /></span>
          : product.shippingFree ? <span className="cs-chip alt"><Truck size={12} /> 0</span> : null}
      </div>
      <div className="cs-card-body">
        <h3 title={product.name}>{clip(product.name, 40)}</h3>
        <div style={{ marginTop: 'auto' }}>
          {orig > price && <div className="cs-old">{money(orig)} {curOf(store)}</div>}
          <div className="cs-price"><small>{curOf(store)}</small>{money(price)}</div>
        </div>
        <span className="cs-btn" style={{ marginTop: '.4rem' }}>{viewDetails || t.viewDetails}</span>
      </div>
    </Link>
  );
}

/* ═══════════ HOME ═══════════ */
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="cs-title"><h2>{children}</h2><i /></div>
);

export function Home({ store, page }: any) {
  const lang = getLang(store);
  const t = T[lang];
  const isRTL = lang === 'ar';
  const products: any[] = store.products || [];
  const cats: any[] = store.categories || [];
  const sp = useSearchParams();
  const activeCategory = sp.get('category');
  const search = sp.get('search');
  const pg = Number(page || 1);
  const countPage = Math.ceil((store.count || products.length) / 48);
  // صور الهيرو: الصورة المحفوظة للمتجر (والأسهم تظهر فقط إن وُجدت أكثر من صورة)
  const slides: { img: string; mobile?: string | null }[] = store.hero?.imageUrl ? [{ img: store.hero.imageUrl, mobile: store.hero.mobileImageUrl }] : [];
  const [slide, setSlide] = useState(0);
  const go = (d: number) => setSlide((s) => (s + d + slides.length) % slides.length);
  const heroTitle = (store.hero?.title || '').replace(/<[^>]+>/g, '').trim();
  const heroSub = (store.hero?.subtitle || '').replace(/<[^>]+>/g, '').trim();
  const showHero = !search && !activeCategory && pg === 1;

  return (
    <div>
      {showHero && (slides.length > 0 ? (
        <section className={`cs-hero ${heroTitle || heroSub ? 'has-txt' : ''} ${store.hero?.mobileImageUrl ? 'has-m' : ''}`} aria-label={heroTitle || store.name}>
          <picture>
            {slides[slide].mobile && <source media="(max-width: 640px)" srcSet={slides[slide].mobile as string} />}
            <img fetchPriority="high" decoding="async" src={slides[slide].img} alt={heroTitle || store.name} />
          </picture>
          {(heroTitle || heroSub) && (
            <div className="cs-hero-txt" style={{ ['--hdir' as any]: isRTL ? 'to left' : 'to right' }}>
              <div dir={isRTL ? 'rtl' : 'ltr'} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {heroTitle && <h1>{heroTitle}</h1>}
                {heroSub && <p>{heroSub}</p>}
                <a href="#products" className="cs-btn"><ShoppingBag size={17} /> {t.shopNow}</a>
              </div>
            </div>
          )}
          {slides.length > 1 && (
            <>
              <button className="cs-arrow" aria-label={t.prev} onClick={() => go(-1)} style={{ insetInlineStart: 16 }}>{isRTL ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}</button>
              <button className="cs-arrow" aria-label={t.next} onClick={() => go(1)} style={{ insetInlineEnd: 16 }}>{isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}</button>
            </>
          )}
        </section>
      ) : (
        <section className="cs-hero-fallback">
          <h1 dir={isRTL ? 'rtl' : 'ltr'}>{heroTitle || store.name}</h1>
          {heroSub && <p>{heroSub}</p>}
          <a href="#products" className="cs-btn" style={{ width: 'auto', marginTop: '1.5rem', background: '#fff', color: 'var(--p-ink)' }}><ShoppingBag size={17} /> {t.shopNow}</a>
        </section>
      ))}

      {cats.length > 0 && !search && (
        <section id="categories" style={{ padding: '4rem 0 3.5rem', scrollMarginTop: 80 }}>
          <div className="cs-wrap">
            <SectionTitle>{t.categories}</SectionTitle>
            <div className="cs-cats">
              {[{ id: '', name: t.all }, ...cats].map((cat: any) => {
                const on = cat.id ? activeCategory === String(cat.id) : !activeCategory;
                return (
                  <Link key={cat.id || 'all'} href={cat.id ? `/?category=${cat.id}#products` : '/#products'} scroll={false} className={`cs-cat ${on ? 'on' : ''}`}>
                    <div className="cs-cat-img">
                      {cat.imageUrl ? <img loading="lazy" decoding="async" src={cat.imageUrl} alt={cat.name} /> : <ShoppingBag size={34} color="var(--p-ink)" />}
                    </div>
                    <span>{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section id="products" className="cs-products" style={{ scrollMarginTop: 80 }}>
        <div className="cs-wrap">
          <SectionTitle>{search ? `${t.searchResultsFor} «${search}»` : cats.find((c) => String(c.id) === activeCategory)?.name || t.products}</SectionTitle>
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#fff', borderRadius: 20, border: '1px dashed #D1D5DB' }}>
              <Package size={40} color="#D1D5DB" style={{ margin: '0 auto .75rem', display: 'block' }} />
              <p style={{ color: 'var(--muted)', fontWeight: 700 }}>{t.noProducts}</p>
            </div>
          ) : (
            <div className="cs-grid">
              {products.map((p: any) => {
                const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
                const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
                return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails={t.viewDetails} />;
              })}
            </div>
          )}
          {countPage > 1 && (
            <div className="cs-pages">
              {Array.from({ length: countPage }).map((_, i) => {
                const n = i + 1;
                return (
                  <Link key={n} scroll={false} className={n === pg ? 'on' : ''}
                    href={{ query: { ...(activeCategory ? { category: activeCategory } : {}), ...(search ? { search } : {}), page: n } }}>{n}</Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ═══════════ DETAILS ═══════════ */
export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, store }: any) {
  const st = store || product?.store;
  const lang = getLang(st);
  const t = T[lang];
  const isRTL = lang === 'ar';
  const [sel, setSel] = useState(0);
  const [copied, setCopied] = useState(false);
  const images: string[] = allImages || [];
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  // المخزون: يظهر «متوفر/غير متوفر» فقط إن كان المنتج يتتبع الكمية
  const tracked = product.variantDetails?.length ? product.variantDetails.some((v: any) => typeof v.stock === 'number') : typeof product.stock === 'number';
  const inStock = product.variantDetails?.length ? product.variantDetails.some((v: any) => v.autoGenerate || Number(v.stock) > 0) : Number(product.stock) > 0;
  const step = (d: number) => setSel((s) => (s + d + images.length) % images.length);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    } catch { /* أُلغيت المشاركة */ }
  };
  const trustIcons = [Truck, Banknote, PhoneCall];
  const trust = t.trust.map((x, i) => { const I = trustIcons[i]; return <div key={i}><I size={22} /><b>{x.t}</b><small>{x.d}</small></div>; });

  return (
    <div>
      <div className="cs-crumb">
        <div className="cs-wrap cs-crumb-in">
          <nav aria-label="breadcrumb">
            <Link href="/">{t.home}</Link>{isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            <Link href="/#products">{t.productsNav}</Link>{isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            <b title={product.name}>{clip(product.name, 28)}</b>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexShrink: 0 }}>
            <button className="cs-icon-btn" onClick={share} aria-label={t.share} title={copied ? t.linkCopied : t.share}>{copied ? <Check size={16} color="#10B981" /> : <Share2 size={16} />}</button>
            {tracked && <span className={`cs-stock ${inStock ? '' : 'out'}`}>{inStock ? t.inStock : t.outOfStock}</span>}
          </div>
        </div>
      </div>

      <div className="cs-wrap cs-det">
        <div className="cs-gal">
          <div className="cs-gal-main">
            {images[sel]
              ? <img fetchPriority="high" decoding="async" src={images[sel]} alt={product.name} />
              : <ShoppingBag size={56} color="#D1D5DB" />}
            {images.length > 1 && (
              <>
                <button className="cs-arrow" aria-label={t.prev} onClick={() => step(-1)} style={{ insetInlineStart: 12 }}>{isRTL ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}</button>
                <button className="cs-arrow" aria-label={t.next} onClick={() => step(1)} style={{ insetInlineEnd: 12 }}>{isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}</button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="cs-thumbs">
              {images.map((img, i) => (
                <button key={i} className={i === sel ? 'on' : ''} onClick={() => setSel(i)} aria-label={`${i + 1}`}><img loading="lazy" decoding="async" src={img} alt="" /></button>
              ))}
            </div>
          )}
          {!product.isDigital && <div className="cs-trust cs-hide-m">{trust}</div>}
        </div>

        <div>
          <h1 className="cs-ptitle" dir={isRTL ? 'rtl' : 'ltr'}>{product.name}</h1>

          <div className="cs-pricebox">
            <span className="cs-price">{money(finalPrice)} <small style={{ fontSize: '.9rem' }}>{curOf(st)}</small></span>
            {orig > Number(finalPrice) && <span className="cs-old" style={{ fontSize: '1rem' }}>{money(orig)}</span>}
            {discount > 0 && <span className="cs-off"><bdi dir="ltr">-{discount}%</bdi></span>}
          </div>

          {(product.shippingFree || (st?.supportFreeShipping && st?.freeShippingMinAmount != null)) && (
            <div className="cs-note"><Truck size={16} />{product.shippingFree ? t.freeShippingBadge : t.freeShippingThreshold.replace('{{amount}}', String(st.freeShippingMinAmount))}</div>
          )}

          {product.offers?.length > 0 && (
            <div className="cs-offers">
              <p><Sparkles size={15} /> {t.offersTitle}</p>
              {product.offers.map((o: any) => (
                <div key={o.id} role="radio" aria-checked={selectedOffer === o.id} tabIndex={0} className={`cs-offer ${selectedOffer === o.id ? 'on' : ''}`}
                  onClick={() => setSelectedOffer(selectedOffer === o.id ? null : o.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedOffer(selectedOffer === o.id ? null : o.id); } }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', minWidth: 0 }}>
                    <span className="cs-radio" />
                    <div style={{ minWidth: 0 }}>
                      <b style={{ display: 'block', fontSize: '.95rem' }}>{o.name}</b>
                      <small style={{ color: 'var(--muted)', fontSize: '.78rem' }}>{o.subTitle || t.piecesInOffer.replace('{{n}}', String(o.quantity))}</small>
                      {o.shippingFree && <small style={{ display: 'block', color: 'var(--p-ink)', fontWeight: 800, fontSize: '.74rem' }}>{t.freeShippingBadge}</small>}
                    </div>
                  </div>
                  <b className="cs-price" style={{ color: 'var(--ink)', fontSize: '1.15rem', whiteSpace: 'nowrap' }}>{money(o.price)} <small>{curOf(st)}</small></b>
                </div>
              ))}
            </div>
          )}

          {allAttrs.map((attr: any) => (
            <div key={attr.id} style={{ marginBottom: '1.25rem' }}>
              <p className="cs-attr-name">{attr.name}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {attr.variants.map((v: any) => {
                  const on = selectedVariants[attr.name] === v.value;
                  const isImgUrl = /^https?:\/\/|^\//.test(v.value);
                  const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) =>
                    Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)));
                  const cls = attr.displayMode === 'color' ? 'cs-var-color' : attr.displayMode === 'image' ? 'cs-var-img' : 'cs-var-text';
                  const style = attr.displayMode === 'color' ? { background: isImgUrl ? `url(${v.value}) center/cover` : v.value }
                    : attr.displayMode === 'image' ? { backgroundImage: `url(${v.value})` } : undefined;
                  return (
                    <button key={v.id} type="button" title={v.name} aria-label={v.name} aria-pressed={on}
                      className={`${cls} ${on ? 'on' : ''} ${available ? '' : 'cs-var-off'}`} style={style}
                      onClick={() => available && handleVariantSelection(attr.name, v.value)}>
                      {attr.displayMode !== 'color' && attr.displayMode !== 'image' && v.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <ProductForm product={product} userId={product.store.userId} domain={domain} store={store}
            selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />
          {!product.isDigital && <div className="cs-trust cs-show-m">{trust}</div>}

          {product.desc && (
            <div style={{ marginTop: '2rem' }}>
              <p className="cs-attr-name">{t.descTitle}</p>
              <div className="cs-desc-html" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════ PRODUCT FORM ═══════════ */
const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div>
    {label && <label className="cs-label">{label}</label>}
    {children}
    {error && <p className="cs-err"><AlertCircle size={12} />{error}</p>}
  </div>
);

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, store }: ProductFormProps) {
  const lang = getLang(store || product?.store);
  const t = T[lang];
  const router = useRouter();
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [fd, setFd] = useState({ customerId: '', customerName: '', customerPhone: '', customerEmail: '', customerWhatsapp: '', customerWelaya: '', customerCommune: '', quantity: 1, priceLoss: 0, typeLivraison: 'home' as 'home' | 'office' });
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp'>('email');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sub, setSub] = useState(false);
  const [orderNowState, setIsOrderNow] = useState(false);
  // بدون سلة: نموذج الطلب يظهر مباشرة (لا حاجة لزر «اطلب الآن»)
  const isOrderNow = orderNowState || (store ?? product?.store)?.cart === false;
  const [isAdded, setIsAdded] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [addonQty, setAddonQty] = useState<AddonQty>({});
  const initCount = useCartStore((s) => s.initCount);
  const cur = curOf(store || product.store);

  useEffect(() => { if (userId) fetchWilayas(userId, product?.store?.id).then(setWilayas); }, [userId]);
  // ولاية واحدة فقط في حساب الشحن: تُختار تلقائياً (والحقل مقفل)
  useEffect(() => { if (wilayas.length === 1) setFd((p: any) => (String(p.customerWelaya) === String(wilayas[0].id) ? p : { ...p, customerWelaya: String(wilayas[0].id), customerCommune: '' })); }, [wilayas]); // onlyOneWilaya
  // نوع التوصيل غير متاح في الولاية المختارة ← ينتقل للنوع المتاح
  useEffect(() => { if (!deliveryAllowed(wilayas, fd.customerWelaya, fd.typeLivraison === 'office' ? 'office' : 'home')) setFd((p: any) => ({ ...p, typeLivraison: p.typeLivraison === 'office' ? 'home' : 'office' })); }, [wilayas, fd.customerWelaya, fd.typeLivraison]); // deliveryTypeGuard
  useEffect(() => { const id = localStorage.getItem('customerId'); if (id) setFd((p) => ({ ...p, customerId: id })); }, []);
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLC(true); fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find((w) => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getFP = useCallback((): number => {
    const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
    const off = product.offers?.find((o: any) => o.id === selectedOffer);
    if (off) return off.price;
    if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
      const m = product.variantDetails.find((v: any) => variantMatches(v, selectedVariants));
      if (m && m.price !== -1) return m.price;
    }
    return base;
  }, [product, selectedOffer, selectedVariants]);
  const supportQty = (store?.supportQty ?? product.store?.supportQty) !== false;
  // سعر الوحدة = سعر المنتج/العرض/المتغير + الإضافات المختارة
  const selOfferObj = product.offers?.find((o: any) => o.id === selectedOffer);
  // سعر المنتج وحده؛ الإضافات بكميتها المستقلة تُضاف مرة واحدة للطلب
  const fp = getFP();
  const qty = supportQty ? fd.quantity : 1;
  // عدد القطع = الكمية × قطع العرض (عرض «قطعتين» = 2) — حد كل إضافة = maxQty × عدد القطع
  const pieces = qty * (selOfferObj ? Math.max(1, Number(selOfferObj.quantity) || 1) : 1);
  // نقصت القطع ← تنزل كمية الإضافات إلى الحد الجديد
  useEffect(() => {
    setAddonQty((q) => {
      let changed = false; const next: AddonQty = { ...q };
      for (const a of addonList(product)) { const m = addonMax(a, pieces); if ((next[a.id] || 0) > m) { next[a.id] = m; changed = true; } }
      return changed ? next : q;
    });
  }, [pieces, product]);
  const extra = addonExtra(product, addonQty);
  const storeInfo = store || product.store;
  const orderFreeShipping = !!(product.shippingFree || selOfferObj?.shippingFree ||
    (storeInfo?.supportFreeShipping && storeInfo?.freeShippingMinAmount != null && (fp * qty + extra) >= Number(storeInfo.freeShippingMinAmount)));
  const getLiv = useCallback((): number => {
    if (product.isDigital || orderFreeShipping || !selW) return 0;
    return Number(fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice);
  }, [selW, fd.typeLivraison, orderFreeShipping, product.isDigital]);
  const total = () => fp * qty + extra + +getLiv();
  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = t.errName;
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = t.errPhoneInvalid;
    if (product.isDigital) {
      if (contactMethod === 'email') { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fd.customerEmail.trim())) e.customerEmail = t.errEmail; }
      else if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerWhatsapp.trim())) e.customerWhatsapp = t.errWhatsapp;
    } else {
      if (!fd.customerWelaya) e.customerWelaya = t.errWilaya;
      if (!fd.customerCommune) e.customerCommune = t.errCommune;
    }
    return e;
  };
  const getVarId = useCallback(() => {
    if (!product.variantDetails?.length || !Object.keys(selectedVariants).length) return undefined;
    return product.variantDetails.find((v: any) => variantMatches(v, selectedVariants))?.id;
  }, [product.variantDetails, selectedVariants]);

  const addToCart = () => {
    setIsAdded(true);
    const cart = JSON.parse(localStorage.getItem(domain) || '[]');
    cart.push({ ...fd, quantity: qty, product, variantDetailId: getVarId(), productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, addonQty, addonsExtra: extra, platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv(), addedAt: Date.now() });
    localStorage.setItem(domain, JSON.stringify(cart));
    initCount(cart.length);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er = validate(); if (Object.keys(er).length) { setErrors(er); return; }
    setErrors({}); setSub(true); setSubmitError(null);
    try {
      const { customerWelaya, customerCommune, typeLivraison, priceLoss, customerEmail, customerWhatsapp, ...rest } = fd;
      const payload = product.isDigital
        ? { ...rest, ...(contactMethod === 'email' ? { customerEmail } : { customerWhatsapp }) }
        : { ...rest, customerWelaya, customerCommune, typeLivraison, priceLoss };
      await axios.post(`${API_URL}/orders/create`, { ...payload, ...(Object.keys(addonQty).length ? { addonQty } : {}), quantity: qty, productId: product.id, storeId: product.store.id, userId, selectedOffer, variantDetailId: getVarId(), platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv() });
      if (fd.customerId) localStorage.setItem('customerId', fd.customerId);
      router.push(`${window.location.origin}/successfully?productId=${product.id}`);
    } catch { setSubmitError(t.errSubmit); } finally { setSub(false); }
  };

  const cls = (err?: string, plain = false) => `cs-input ${plain ? 'plain' : ''} ${err ? 'err' : ''}`;

  return (
    <div style={{ marginTop: '1.25rem' }}>
      <AddonsPicker product={product} store={store || product.store} value={addonQty} onChange={setAddonQty} pieces={pieces} />
      {product.store.cart && !product.isDigital && !isOrderNow && (
        <div className="cs-two">
          <button type="button" onClick={addToCart} disabled={isAdded} className="cs-btn ghost" style={isAdded ? { borderColor: '#10B981', color: '#059669' } : undefined}>
            {isAdded ? <><CheckCircle2 size={16} className="cs-pop" />{t.addedMsg}</> : <><ShoppingCart size={16} />{t.addToCart}</>}
          </button>
          <button type="button" onClick={() => setIsOrderNow(true)} className="cs-btn">{t.orderNow}</button>
        </div>
      )}

      {(isOrderNow || !product.store.cart || product.isDigital) && (
        <div className="cs-order cs-fade">
          <div className="cs-order-head">
            <ShoppingCart size={20} />
            <div style={{ flex: 1, minWidth: 0 }}><b>{t.orderCardTitle}</b><small>{t.orderCardSub}</small></div>
            {orderNowState && product.store.cart && <button type="button" onClick={() => setIsOrderNow(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '.82rem', fontWeight: 700 }}>{t.back}</button>}
          </div>
          <form onSubmit={handleSubmit} className="cs-order-body">
            <div className="cs-row2">
              <FR error={errors.customerName} label={t.fullName}>
                <div className="cs-field"><User size={16} /><input className={cls(errors.customerName)} value={fd.customerName} onChange={(e) => setFd({ ...fd, customerName: e.target.value })} placeholder={t.fullNamePh} autoComplete="name" /></div>
              </FR>
              <FR error={errors.customerPhone} label={t.phone}>
                <div className="cs-field"><Phone size={16} /><input type="tel" dir="ltr" className={cls(errors.customerPhone)} value={fd.customerPhone} onChange={(e) => setFd({ ...fd, customerPhone: e.target.value })} placeholder={t.phonePh} autoComplete="tel" style={{ textAlign: lang === 'ar' ? 'right' : 'left' }} /></div>
              </FR>
            </div>

            {product.isDigital ? (
              <div style={{ marginBottom: '.85rem' }}>
                <label className="cs-label">{t.contactQuestion}</label>
                <div className="cs-deliv" style={{ marginBottom: '.75rem' }}>
                  {(['email', 'whatsapp'] as const).map((m) => (
                    <button key={m} type="button" className={contactMethod === m ? 'on' : ''}
                      onClick={() => { setContactMethod(m); setFd((p) => (m === 'email' ? { ...p, customerWhatsapp: '' } : { ...p, customerEmail: '' })); }}>
                      {m === 'email' ? <Mail size={20} /> : <MessageCircle size={20} />}<b>{m === 'email' ? t.contactViaEmail : t.contactViaWhatsapp}</b>
                    </button>
                  ))}
                </div>
                {contactMethod === 'email' ? (
                  <FR error={errors.customerEmail} label={t.orderEmail}>
                    <div className="cs-field"><Mail size={16} /><input type="email" dir="ltr" className={cls(errors.customerEmail)} value={fd.customerEmail} onChange={(e) => setFd({ ...fd, customerEmail: e.target.value })} placeholder={t.emailPh} /></div>
                  </FR>
                ) : (
                  <FR error={errors.customerWhatsapp} label={t.whatsapp}>
                    <div className="cs-field"><MessageCircle size={16} /><input type="tel" dir="ltr" className={cls(errors.customerWhatsapp)} value={fd.customerWhatsapp} onChange={(e) => setFd({ ...fd, customerWhatsapp: e.target.value })} placeholder={t.whatsappPh} /></div>
                  </FR>
                )}
              </div>
            ) : (
              <>
                <div className="cs-row2">
                  <FR error={errors.customerWelaya} label={t.wilaya}>
                    <div className="cs-field">
                      <MapPin size={16} /><ChevronDown size={15} className="cs-chev" />
                      <select className={cls(errors.customerWelaya)} value={fd.customerWelaya} disabled={wilayas.length === 1} onChange={(e) => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })}>
                        <option value="">{wilayas.length ? t.wilayaPh : t.wilayaNA}</option>
                        {wilayas.map((w) => <option key={w.id} value={w.id}>{w.code ?? w.id} - {lang === 'ar' ? w.ar_name : w.name}</option>)}
                      </select>
                    </div>
                  </FR>
                  <FR error={errors.customerCommune} label={t.commune}>
                    <div className="cs-field">
                      <MapPin size={16} /><ChevronDown size={15} className="cs-chev" />
                      <select className={cls(errors.customerCommune)} value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={(e) => setFd({ ...fd, customerCommune: e.target.value })}>
                        <option value="">{!fd.customerWelaya ? t.communeFirst : loadingC ? t.communeLoading : t.communePh}</option>
                        {communes.map((c) => <option key={c.id} value={c.id}>{lang === 'ar' ? c.ar_name : c.name}</option>)}
                      </select>
                    </div>
                  </FR>
                </div>

                <div style={{ marginBottom: '.85rem' }}>
                  <label className="cs-label">{t.deliveryType}</label>
                  {fd.customerWelaya ? (
                    <div className="cs-deliv">
                      {(['home', 'office'] as const).filter((dt) => deliveryShown(wilayas, fd.customerWelaya, dt)).map((dt) => (
                        <button data-delivery-option key={dt} type="button" className={fd.typeLivraison === dt ? 'on' : ''} onClick={() => setFd((p) => ({ ...p, typeLivraison: dt }))}>
                          {dt === 'home' ? <HomeIcon size={22} /> : <Building2 size={22} />}
                          <b>{dt === 'home' ? t.deliveryHome : t.deliveryOffice}</b>
                          {selW && <small>{orderFreeShipping ? t.freeShippingBadge : `${money(dt === 'home' ? selW.livraisonHome : selW.livraisonOfice)} ${cur}`}</small>}
                        </button>
                      ))}
                    </div>
                  ) : <p style={{ fontSize: '.82rem', color: 'var(--muted)', textAlign: 'center', padding: '.6rem', background: 'var(--soft)', borderRadius: 12 }}>{t.pickWilayaForPrice}</p>}
                </div>
              </>
            )}

            {supportQty && !product.isDigital && (
              <div style={{ marginBottom: '.5rem' }}>
                <label className="cs-label">{t.qty}</label>
                <div className="cs-qty">
                  <button type="button" aria-label="-" onClick={() => setFd((p) => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}><Minus size={16} /></button>
                  <span>{fd.quantity}</span>
                  <button type="button" aria-label="+" onClick={() => setFd((p) => ({ ...p, quantity: p.quantity + 1 }))}><Plus size={16} /></button>
                  <small style={{ color: 'var(--muted)' }}>{t.piece}</small>
                </div>
              </div>
            )}

            <div className="cs-sum">
              <div><span><Package size={14} />{t.product}</span><b title={product.name}>{clip(product.name, 32)}</b></div>
              {selOfferObj && <div><span><Tag size={14} />{t.selectedOffer}</span><span className="cs-offer-tag">{selOfferObj.name}</span></div>}
              <div><span>{t.price}</span><b>{money(fp)} {cur}{qty > 1 ? ` × ${qty}` : ''}</b></div>
              {addonLines(product, addonQty).map(({ a, n }) => (
                <div key={a.id}><span><Plus size={13} />{a.name}{n > 1 ? ` ×${n}` : ''}</span><b>{Number(a.price) ? `${money(Number(a.price) * n)} ${cur}` : t.free}</b></div>
              ))}
              {!product.isDigital && <div><span>{t.delivery}</span><b>{!selW ? '—' : orderFreeShipping ? t.freeShippingBadge : `${money(getLiv())} ${cur}`}</b></div>}
              <div className="cs-total"><span style={{ color: 'var(--ink)', fontWeight: 800 }}>{t.total}</span><b>{money(total())} {cur}</b></div>
            </div>

            {submitError && <p className="cs-err" style={{ justifyContent: 'center', marginBottom: '.6rem' }}><AlertCircle size={13} />{submitError}</p>}
            <button type="submit" disabled={sub} className="cs-btn" style={{ padding: '1rem', fontSize: '1.02rem' }}>
              {sub ? <><Loader2 size={17} className="cs-spin" /> {t.sending}</> : t.confirmOrder}
            </button>
          </form>
        </div>
      )}
      <WhatsAppOrderButton product={product} store={store} />
    </div>
  );
}

/* ═══════════ CART ═══════════ */
export function Cart({ domain, store }: { domain: string; store: any }) {
  const lang = getLang(store);
  const t = T[lang];
  const cur = curOf(store);
  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fd, setFd] = useState({ customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', typeLivraison: 'home' as 'home' | 'office' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem(domain) || '[]'));
    if (store?.user?.id) fetchWilayas(store.user.id, store?.id).then(setWilayas);
  }, [domain, store]);
  // ولاية واحدة فقط في حساب الشحن: تُختار تلقائياً (والحقل مقفل)
  useEffect(() => { if (wilayas.length === 1) setFd((p: any) => (String(p.customerWelaya) === String(wilayas[0].id) ? p : { ...p, customerWelaya: String(wilayas[0].id), customerCommune: '' })); }, [wilayas]); // onlyOneWilaya
  // نوع التوصيل غير متاح في الولاية المختارة ← ينتقل للنوع المتاح
  useEffect(() => { if (!deliveryAllowed(wilayas, fd.customerWelaya, fd.typeLivraison === 'office' ? 'office' : 'home')) setFd((p: any) => ({ ...p, typeLivraison: p.typeLivraison === 'office' ? 'home' : 'office' })); }, [wilayas, fd.customerWelaya, fd.typeLivraison]); // deliveryTypeGuard
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLC(true); fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find((w) => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const cartTotal = items.reduce((a, i) => a + i.finalPrice * i.quantity + (i.addonQty ? addonExtra(i.product, i.addonQty) : 0), 0);
  const hasFreeShippingItem = items.some((i) => i.product?.shippingFree || i.product?.offers?.find((o: any) => o.id === i.selectedOffer)?.shippingFree);
  const freeShippingMin = store?.supportFreeShipping ? store?.freeShippingMinAmount : null;
  const freeShippingReached = hasFreeShippingItem || (freeShippingMin != null && cartTotal >= Number(freeShippingMin));
  const freeShippingRemainingAmt = freeShippingMin != null ? Number(freeShippingMin) - cartTotal : 0;
  const getLiv = () => (freeShippingReached || !selW ? 0 : Number(fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice));
  const finalTotal = cartTotal + +getLiv();
  const update = (n: any[]) => { setItems(n); localStorage.setItem(domain, JSON.stringify(n)); initCount(n.length); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!fd.customerName.trim()) er.name = t.errName;
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) er.phone = t.errPhoneInvalid;
    if (!fd.customerWelaya) er.w = t.errWilaya;
    if (!fd.customerCommune) er.c = t.errCommune;
    if (Object.keys(er).length) { setErrors(er); return; }
    setErrors({}); setSubmitting(true); setSubmitError(null);
    try {
      await axios.post(`${API_URL}/orders/create`, items.map((i) => ({
        ...fd, productId: i.productId, storeId: i.storeId, userId: i.userId, selectedOffer: i.selectedOffer,
        variantDetailId: i.variantDetailId, selectedVariants: i.selectedVariants, ...(i.addonQty ? { addonQty: i.addonQty } : { addonIds: i.addonIds }),
        platform: i.platform || 'store', finalPrice: i.finalPrice, totalPrice: finalTotal, priceLivraison: +getLiv(),
        quantity: i.quantity, customerId: i.customerId || '', priceLoss: selW?.livraisonReturn ?? 0,
      })));
      setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
    } catch { setSubmitError(t.errSubmit); } finally { setSubmitting(false); }
  };

  const cls = (err?: string) => `cs-input ${err ? 'err' : ''}`;

  if (success) return <Success store={store} order={null} />;

  if (!items.length) return (
    <div className="cs-wrap" style={{ padding: '4rem 1.25rem', minHeight: '55vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--p-soft)', color: 'var(--p-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}><ShoppingBag size={38} /></div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '.4rem' }}>{t.cartEmpty}</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>{t.cartEmptyDesc}</p>
        <Link href="/" className="cs-btn" style={{ width: 'auto' }}><ShoppingBag size={17} /> {t.shopNow}</Link>
      </div>
    </div>
  );

  return (
    <div className="cs-wrap">
      <div style={{ paddingTop: '2.5rem' }}><SectionTitle>{t.myCart}</SectionTitle></div>
      {freeShippingMin != null && (
        <div className="cs-note" style={{ display: 'flex', justifyContent: 'center', borderRadius: 14, marginBottom: 0 }}>
          <Truck size={16} />{freeShippingReached ? t.freeShippingReached : t.freeShippingRemaining.replace('{{amount}}', String(freeShippingRemainingAmt))}
        </div>
      )}
      <div className="cs-cart">
        <div className="cs-box">
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid var(--line)', alignItems: 'center' }}>
              <img loading="lazy" decoding="async" src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} alt="" style={{ width: 76, height: 76, borderRadius: 14, objectFit: 'contain', background: 'var(--soft)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ display: 'block', fontSize: '.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product?.name}</b>
                {(item.addonQty ? Object.keys(item.addonQty).length > 0 : item.addonIds?.length > 0) && <small style={{ display: 'block', color: 'var(--p-ink)', fontWeight: 700 }}>+ {addonNames(item.product, item.addonQty, item.addonIds)}</small>}
                <span className="cs-price" style={{ fontSize: '1.05rem' }}>{money(item.finalPrice)} <small>{cur}</small></span>
                <small style={{ display: 'block', color: 'var(--muted)' }}>{t.qty}: {item.quantity}</small>
              </div>
              <button aria-label="delete" onClick={() => update(items.filter((_, idx) => idx !== i))} className="cs-icon-btn" style={{ color: '#DC2626' }}><Trash2 size={16} /></button>
            </div>
          ))}
          <div style={{ padding: '1rem', background: 'var(--soft)', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
            <span>{t.subtotal}</span><span>{money(cartTotal)} {cur}</span>
          </div>
        </div>

        <div className="cs-order" style={{ marginTop: 0 }}>
          <div className="cs-order-head"><ShoppingCart size={20} /><div><b>{t.checkoutTitle}</b><small>{t.orderCardSub}</small></div></div>
          <form onSubmit={handleSubmit} className="cs-order-body">
            <div className="cs-row2">
              <FR error={errors.name} label={t.fullName}><div className="cs-field"><User size={16} /><input className={cls(errors.name)} value={fd.customerName} onChange={(e) => setFd({ ...fd, customerName: e.target.value })} placeholder={t.fullNamePh} /></div></FR>
              <FR error={errors.phone} label={t.phone}><div className="cs-field"><Phone size={16} /><input type="tel" dir="ltr" className={cls(errors.phone)} value={fd.customerPhone} onChange={(e) => setFd({ ...fd, customerPhone: e.target.value })} placeholder={t.phonePh} style={{ textAlign: lang === 'ar' ? 'right' : 'left' }} /></div></FR>
            </div>
            <div className="cs-row2">
              <FR error={errors.w} label={t.wilaya}>
                <div className="cs-field"><MapPin size={16} /><ChevronDown size={15} className="cs-chev" />
                  <select className={cls(errors.w)} value={fd.customerWelaya} disabled={wilayas.length === 1} onChange={(e) => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })}>
                    <option value="">{t.wilayaPh}</option>{wilayas.map((w) => <option key={w.id} value={w.id}>{w.code ?? w.id} - {lang === 'ar' ? w.ar_name : w.name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.c} label={t.commune}>
                <div className="cs-field"><MapPin size={16} /><ChevronDown size={15} className="cs-chev" />
                  <select className={cls(errors.c)} value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={(e) => setFd({ ...fd, customerCommune: e.target.value })}>
                    <option value="">{!fd.customerWelaya ? t.communeFirst : loadingC ? t.communeLoading : t.communePh}</option>{communes.map((c) => <option key={c.id} value={c.id}>{lang === 'ar' ? c.ar_name : c.name}</option>)}
                  </select>
                </div>
              </FR>
            </div>
            <div style={{ marginBottom: '.85rem' }}>
              <label className="cs-label">{t.deliveryType}</label>
              {fd.customerWelaya ? (
                <div className="cs-deliv">
                  {(['home', 'office'] as const).filter((dt) => deliveryShown(wilayas, fd.customerWelaya, dt)).map((dt) => (
                    <button data-delivery-option key={dt} type="button" className={fd.typeLivraison === dt ? 'on' : ''} onClick={() => setFd((p) => ({ ...p, typeLivraison: dt }))}>
                      {dt === 'home' ? <HomeIcon size={22} /> : <Building2 size={22} />}<b>{dt === 'home' ? t.deliveryHome : t.deliveryOffice}</b>
                      {selW && <small>{freeShippingReached ? t.freeShippingBadge : `${money(dt === 'home' ? selW.livraisonHome : selW.livraisonOfice)} ${cur}`}</small>}
                    </button>
                  ))}
                </div>
              ) : <p style={{ fontSize: '.82rem', color: 'var(--muted)', textAlign: 'center', padding: '.6rem', background: 'var(--soft)', borderRadius: 12 }}>{t.pickWilayaForPrice}</p>}
            </div>
            <div className="cs-sum">
              <div><span>{t.subtotal}</span><b>{money(cartTotal)} {cur}</b></div>
              <div><span>{t.delivery}</span><b>{!selW ? '—' : freeShippingReached ? t.freeShippingBadge : `${money(getLiv())} ${cur}`}</b></div>
              <div className="cs-total"><span style={{ color: 'var(--ink)', fontWeight: 800 }}>{t.total}</span><b>{money(finalTotal)} {cur}</b></div>
            </div>
            {submitError && <p className="cs-err" style={{ justifyContent: 'center', marginBottom: '.6rem' }}><AlertCircle size={13} />{submitError}</p>}
            <button type="submit" disabled={submitting} className="cs-btn" style={{ padding: '1rem' }}>
              {submitting ? <><Loader2 size={17} className="cs-spin" /> {t.sending}</> : t.confirmOrder}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ SUCCESS ═══════════ */
export function Success({ store, order }: { store: any; domain?: string; order: any }) {
  const t = T[getLang(store)];
  const cur = curOf(store);
  const stepIcons = [CheckCircle2, PhoneCall, Package, Truck];
  return (
    <div>
      <section className="cs-success">
        <div className="cs-check cs-pop"><CheckCircle2 size={46} /></div>
        <p style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#D97706', fontWeight: 800, fontSize: '.9rem', marginBottom: '.6rem' }}><Sparkles size={15} /> {t.successBadge} <Sparkles size={15} /></p>
        <h1 style={{ fontSize: 'clamp(1.9rem, 5vw, 2.8rem)', fontWeight: 800, marginBottom: '.75rem' }}>{t.successTitle}</h1>
        <p style={{ color: 'var(--muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>{t.successDesc}</p>
      </section>
      <div className="cs-wrap" style={{ maxWidth: 760, paddingBottom: '4rem' }}>
        <div style={{ margin: '1rem 0 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', marginBottom: '.5rem' }}>
            <span style={{ color: 'var(--muted)' }}>{t.progressLabel}</span><b style={{ color: '#059669' }}>100%</b>
          </div>
          <div className="cs-progress"><i /></div>
          <p style={{ textAlign: 'center', fontSize: '.8rem', color: 'var(--muted)', marginTop: '.5rem' }}>{t.progressDone}</p>
        </div>

        {order && (order.productName || order.total != null) && (
          <div className="cs-sum" style={{ background: '#fff', border: '1px solid var(--line)' }}>
            {order.productName && <div><span>{t.product}</span><b>{order.productName}</b></div>}
            {order.total != null && <div className="cs-total"><span style={{ color: 'var(--ink)', fontWeight: 800 }}>{t.total}</span><b>{money(order.total)} {cur}</b></div>}
          </div>
        )}

        <div className="cs-box" style={{ marginBottom: '1.5rem' }}>
          {t.successSteps.map((s, i) => {
            const I = stepIcons[i] ?? CheckCircle2; const done = i === 0;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem 1.25rem', borderBottom: i < t.successSteps.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? '#10B981' : 'var(--soft)', color: done ? '#fff' : '#9CA3AF' }}><I size={18} /></div>
                <div><b style={{ display: 'block', fontSize: '.92rem', color: done ? 'var(--ink)' : '#6B7280' }}>{s.title}</b><small style={{ color: 'var(--muted)' }}>{s.desc}</small></div>
              </div>
            );
          })}
        </div>
        <Link href="/" className="cs-btn"><ShoppingBag size={17} /> {t.backToShop}</Link>
      </div>
    </div>
  );
}

/* ═══════════ STATIC PAGES ═══════════ */
const Shell = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <div>
    <div className="cs-page-head"><h1>{title}</h1><i /></div>
    <div className="cs-wrap" style={{ maxWidth: 860, padding: '2.5rem 1.25rem 5rem' }}>{children}</div>
  </div>
);
const InfoBlock = ({ title, body }: { title: string; body: string }) => (
  <div style={{ padding: '1.25rem 0', borderBottom: '1px solid var(--line)', display: 'flex', gap: '1rem' }}>
    <span style={{ width: 5, minWidth: 5, height: 22, borderRadius: 5, background: 'var(--p)', marginTop: 3 }} />
    <div><h3 style={{ fontWeight: 800, fontSize: '1.02rem', marginBottom: '.4rem' }}>{title}</h3><p style={{ color: '#4B5563', lineHeight: 1.8 }}>{body}</p></div>
  </div>
);
const LegalPage = ({ store, k }: { store: any; k: 'privacy' | 'terms' | 'cookies' }) => {
  const pg = T[getLang(store)].pages[k];
  return <Shell title={pg.title}><div className="cs-box" style={{ padding: '0 1.5rem' }}>{pg.blocks.map((b, i) => <InfoBlock key={i} title={b.title} body={b.body} />)}</div></Shell>;
};
export function Privacy({ store }: { store?: any }) { return <LegalPage store={store} k="privacy" />; }
export function Terms({ store }: { store?: any }) { return <LegalPage store={store} k="terms" />; }
export function Cookies({ store }: { store?: any }) { return <LegalPage store={store} k="cookies" />; }

export function Contact({ store }: { store: any }) {
  const lang = getLang(store);
  const t = T[lang];
  const isRTL = lang === 'ar';
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const c = store?.contact || {};
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setSubmitError(null);
    try { await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store.id }); setSent(true); }
    catch { setSubmitError(t.errSubmit); } finally { setLoading(false); }
  };
  return (
    <div>
      <div className="cs-page-head"><h1>{t.contactSect}</h1><i /><p style={{ color: 'var(--muted)', marginTop: '.9rem' }}>{t.contactTagline}</p></div>
      <div className="cs-wrap cs-contact">
        <div className="cs-box" style={{ padding: '1.5rem' }}>
          <p className="cs-attr-name">{t.contactInfoTitle}</p>
          {[
            { icon: <Phone size={17} />, label: t.contactPhone, val: c.phone ? <span dir="ltr">{c.phone}</span> : comingSoon(store) },
            { icon: <WhatsAppGlyph size={17} />, label: t.contactViaWhatsapp, val: c.whatsapp ? <span dir="ltr">{c.whatsapp}</span> : comingSoon(store) },
            { icon: <Mail size={17} />, label: t.email, val: c.email ? <span dir="ltr">{c.email}</span> : comingSoon(store) },
            { icon: <MapPin size={17} />, label: t.contactLocation, val: [c.wilaya, c.address].filter(Boolean).join(' / ') || t.contactDefaultLocation },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.85rem', marginBottom: '1rem' }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--p-soft)', color: 'var(--p-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{r.icon}</span>
              <div><small style={{ color: 'var(--muted)', fontWeight: 700 }}>{r.label}</small><b style={{ display: 'block', fontSize: '.92rem' }}>{r.val}</b></div>
            </div>
          ))}
        </div>
        <div className="cs-box" style={{ padding: '1.5rem' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div className="cs-check cs-pop" style={{ width: 72, height: 72, boxShadow: '0 0 0 9px #D1FAE5' }}><CheckCircle2 size={34} /></div>
              <h2 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '1.25rem' }}>{t.msgSent}</h2>
              <button className="cs-btn ghost" style={{ width: 'auto' }} onClick={() => setSent(false)}>{t.sendAnother}</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="cs-row2">
                <FR label={t.fullName}><input required className="cs-input plain" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t.fullNamePh} /></FR>
                <FR label={t.phone}><input required type="tel" dir="ltr" className="cs-input plain" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t.phonePh} style={{ textAlign: isRTL ? 'right' : 'left' }} /></FR>
              </div>
              <div style={{ marginBottom: '.85rem' }}><FR label={t.email}><input required type="email" dir="ltr" className="cs-input plain" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" style={{ textAlign: isRTL ? 'right' : 'left' }} /></FR></div>
              <div style={{ marginBottom: '1.25rem' }}><FR label={t.message}><textarea required rows={5} className="cs-input plain" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t.messagePh} style={{ height: 'auto', padding: '.8rem 1rem', resize: 'vertical' }} /></FR></div>
              {submitError && <p className="cs-err" style={{ justifyContent: 'center', marginBottom: '.6rem' }}><AlertCircle size={13} />{submitError}</p>}
              <button type="submit" disabled={loading} className="cs-btn">{loading ? <><Loader2 size={17} className="cs-spin" /> {t.sending}</> : <>{t.sendMsg} {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}</>}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function StaticPage({ staticPage, page, store }: any) {
  const p = (staticPage || page || '').toLowerCase();
  return (
    <>
      {p === 'privacy' && <Privacy store={store} />}
      {p === 'terms' && <Terms store={store} />}
      {p === 'cookies' && <Cookies store={store} />}
      {p === 'contact' && <Contact store={store} />}
    </>
  );
}
