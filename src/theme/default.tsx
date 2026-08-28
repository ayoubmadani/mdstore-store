'use client';

// ─────────────────────────────────────────────────────────────
// DEFAULT — ثيم فارغ (fallback) يُستخدم عندما لا يوجد ثيم مُختار للمتجر
// (store.themeId فارغ). لا يعرض أي منتجات أو تصميم متجر حقيقي — فقط رسالة
// توجّه صاحب المتجر لشراء وتفعيل أحد الثيمات.
// ─────────────────────────────────────────────────────────────

import React from 'react';

function Placeholder({ store }: { store?: any }) {
  const isRTL = (store?.language || 'ar') === 'ar';
  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        background: '#fff',
        color: '#111',
        fontFamily: 'system-ui, -apple-system, Arial, sans-serif',
        fontSize: '1.15rem',
        fontWeight: 700,
      }}
    >
      {isRTL ? 'لا يوجد ثيم مختار لحد الآن' : 'No theme selected yet'}
    </div>
  );
}

export default function Main({ store }: any) {
  return <Placeholder store={store} />;
}

export function Navbar() {
  return null;
}

export function Footer() {
  return null;
}

export function Card() {
  return null;
}

export function Home({ store }: any) {
  return <Placeholder store={store} />;
}

export function Details({ store }: any) {
  return <Placeholder store={store} />;
}

export function ProductForm() {
  return null;
}

export function Cart({ store }: any) {
  return <Placeholder store={store} />;
}

export function Privacy({ store }: any) {
  return <Placeholder store={store} />;
}

export function Terms({ store }: any) {
  return <Placeholder store={store} />;
}

export function Cookies({ store }: any) {
  return <Placeholder store={store} />;
}

export function Contact({ store }: any) {
  return <Placeholder store={store} />;
}

export function StaticPage({ store }: any) {
  return <Placeholder store={store} />;
}

export function Success({ store }: any) {
  return <Placeholder store={store} />;
}
