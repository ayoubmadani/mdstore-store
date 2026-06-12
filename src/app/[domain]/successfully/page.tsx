'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  CheckCircle, Package, Phone,
  Truck, ShoppingBag, ArrowLeft,
  Sparkles
} from 'lucide-react';
import { usePixel } from '@/Hook/pixel-provider';
import { use } from 'react';

export default function SuccessPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = use(params);
  const { trackPurchase } = usePixel();
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);
  const hasTracked = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let frame = 0;
    const interval = setInterval(() => {
      frame += 2;
      setCount(Math.min(frame, 100));
      if (frame >= 100) clearInterval(interval);
    }, 12);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!domain || hasTracked.current) return;
    const savedOrder = localStorage.getItem('last_order');
    if (savedOrder) {
      try {
        const orderData = JSON.parse(savedOrder);
        trackPurchase(orderData.total, 'DZD', orderData.id);
        hasTracked.current = true;
      } catch (error) {
        console.error("Tracking Data Error:", error);
      }
    }
  }, [domain, trackPurchase]);

  const steps = [
    { icon: CheckCircle, title: 'تم استلام طلبك',   desc: 'تم تسجيل طلبك بنجاح في نظامنا', done: true  },
    { icon: Phone,        title: 'تأكيد الطلب',      desc: 'سنتصل بك خلال 24 ساعة',         done: false },
    { icon: Package,      title: 'تجهيز وتغليف',     desc: 'يتم تجهيز منتجك بعناية',        done: false },
    { icon: Truck,        title: 'الشحن والتوصيل',   desc: '2-5 أيام عمل',                  done: false },
  ];

  return (
    <>
      <style>{`
        /* ── Reset & Page ── */
        .success-page {
          position: fixed;
          inset: 0;
          z-index: 9999;
          overflow-y: auto;
          background: linear-gradient(180deg, #f9fafb 0%, #ffffff 100%);
          color: #111827;
          direction: rtl;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        /* ── Centered Container ── */
        .success-wrap {
          max-width: 640px;
          width: 100%;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* ── Hero ── */
        .success-hero {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0 48px;
          overflow: hidden;
          text-align: center;
        }

        .success-hero-glow {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, #d1fae5 0%, transparent 70%);
          pointer-events: none;
          border-radius: 50%;
        }

        /* ── Icon ── */
        .success-icon-wrap {
          position: relative;
          z-index: 1;
          margin-bottom: 32px;
          transition: transform 0.7s cubic-bezier(.34,1.56,.64,1), opacity 0.7s ease;
        }
        .success-icon-wrap.hidden-state {
          transform: scale(0.4);
          opacity: 0;
        }
        .success-icon-wrap.visible-state {
          transform: scale(1);
          opacity: 1;
        }

        .success-icon-ping {
          position: absolute;
          top: -20px;
          left: -20px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(167, 243, 208, 0.5);
          animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
        }
        @keyframes ping {
          75%, 100% { transform: scale(1.8); opacity: 0; }
        }

        .success-icon-circle {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #34d399, #059669);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 40px rgba(16, 185, 129, 0.3);
        }

        /* ── Hero Text ── */
        .success-eyebrow {
          position: relative;
          z-index: 1;
          transition: transform 0.7s ease 0.2s, opacity 0.7s ease 0.2s;
        }
        .success-eyebrow.hidden-state { opacity: 0; transform: translateY(20px); }
        .success-eyebrow.visible-state { opacity: 1; transform: translateY(0); }

        .success-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
          font-size: 11px;
          font-weight: 800;
          color: #d97706;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .success-title {
          font-size: clamp(2rem, 5vw, 2.8rem);
          font-weight: 900;
          line-height: 1.2;
          color: #111827;
          margin: 0 0 16px;
        }

        .success-subtitle {
          font-size: 15px;
          color: #6b7280;
          line-height: 1.7;
          max-width: 360px;
          margin: 0 auto;
        }

        /* ── Progress ── */
        .success-progress {
          margin-bottom: 40px;
          transition: opacity 0.7s ease 0.3s;
        }
        .success-progress.hidden-state { opacity: 0; }
        .success-progress.visible-state { opacity: 1; }

        .success-progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .success-progress-label {
          font-size: 12px;
          color: #9ca3af;
          font-weight: 500;
        }
        .success-progress-pct {
          font-size: 12px;
          font-weight: 900;
          color: #059669;
        }

        .success-progress-track {
          height: 10px;
          background: #f3f4f6;
          border-radius: 999px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        .success-progress-fill {
          height: 100%;
          background: linear-gradient(to left, #34d399, #059669);
          border-radius: 999px;
          transition: width 75ms linear;
        }

        /* ── Steps ── */
        .success-steps {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 40px;
        }

        .success-step {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 16px;
          border-radius: 16px;
          border: 1px solid transparent;
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .success-step.hidden-state {
          opacity: 0;
          transform: translateX(30px);
        }
        .success-step.visible-state {
          opacity: 1;
          transform: translateX(0);
        }
        .success-step.done {
          background: rgba(16, 185, 129, 0.06);
          border-color: rgba(16, 185, 129, 0.2);
        }
        .success-step.pending {
          background: rgba(0, 0, 0, 0.02);
          border-color: rgba(0, 0, 0, 0.06);
        }

        .step-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .step-icon.done  { background: #d1fae5; color: #059669; }
        .step-icon.pending { background: #f3f4f6; color: #9ca3af; }

        .step-info { flex: 1; min-width: 0; }
        .step-title {
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 2px;
        }
        .step-title.done    { color: #111827; }
        .step-title.pending { color: #9ca3af; }
        .step-desc {
          font-size: 12px;
          color: #9ca3af;
          margin: 0;
        }

        .step-badge {
          font-size: 10px;
          font-weight: 800;
          color: #059669;
          background: #f0fdf4;
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid #bbf7d0;
          white-space: nowrap;
        }

        /* ── Buttons ── */
        .success-actions {
          padding-bottom: 64px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: opacity 0.7s ease 0.8s;
        }
        .success-actions.hidden-state { opacity: 0; }
        .success-actions.visible-state { opacity: 1; }

        .btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 16px;
          background: #111827;
          color: #ffffff;
          font-size: 15px;
          font-weight: 900;
          border-radius: 16px;
          text-decoration: none;
          transition: background 0.2s ease;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .btn-primary:hover { background: #1f2937; }

        .btn-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 14px;
          background: #ffffff;
          color: #6b7280;
          font-size: 13px;
          font-weight: 600;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          text-decoration: none;
          transition: background 0.2s ease;
        }
        .btn-secondary:hover { background: #f9fafb; }

        .btn-icon-fade { opacity: 0.4; }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .success-hero { padding: 60px 0 36px; }
          .success-title { font-size: 1.8rem; }
        }
      `}</style>

      <div className="success-page">
        <div className="success-wrap">

          {/* Hero */}
          <div className="success-hero">
            <div className="success-hero-glow" />

            <div className={`success-icon-wrap ${visible ? 'visible-state' : 'hidden-state'}`}>
              <div className="success-icon-ping" />
              <div className="success-icon-circle">
                <CheckCircle size={40} color="#fff" />
              </div>
            </div>

            <div className={`success-eyebrow ${visible ? 'visible-state' : 'hidden-state'}`}>
              <div className="success-badge">
                <Sparkles size={14} />
                طلب ناجح
                <Sparkles size={14} />
              </div>
              <h1 className="success-title">تم تأكيد طلبك!</h1>
              <p className="success-subtitle">
                شكراً لثقتك بنا. طلبك في أيدٍ أمينة وسنتواصل معك قريباً لتأكيد التسليم.
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className={`success-progress ${visible ? 'visible-state' : 'hidden-state'}`}>
            <div className="success-progress-header">
              <span className="success-progress-label">تقدم الطلب</span>
              <span className="success-progress-pct">{count}%</span>
            </div>
            <div className="success-progress-track">
              <div className="success-progress-fill" style={{ width: `${count}%` }} />
            </div>
          </div>

          {/* Steps */}
          <div className="success-steps">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className={`success-step ${step.done ? 'done' : 'pending'} ${visible ? 'visible-state' : 'hidden-state'}`}
                  style={{ transitionDelay: `${0.4 + i * 0.1}s` }}
                >
                  <div className={`step-icon ${step.done ? 'done' : 'pending'}`}>
                    <Icon size={18} />
                  </div>
                  <div className="step-info">
                    <p className={`step-title ${step.done ? 'done' : 'pending'}`}>{step.title}</p>
                    <p className="step-desc">{step.desc}</p>
                  </div>
                  {step.done && <span className="step-badge">مكتمل ✓</span>}
                </div>
              );
            })}
          </div>

          {/* Buttons */}
          <div className={`success-actions ${visible ? 'visible-state' : 'hidden-state'}`}>
            <Link href={`/${domain}`} className="btn-primary">
              <ShoppingBag size={18} />
              تصفح المزيد من المنتجات
              <ArrowLeft size={16} className="btn-icon-fade" />
            </Link>
            <Link href={`/${domain}`} className="btn-secondary">
              العودة إلى الصفحة الرئيسية
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}