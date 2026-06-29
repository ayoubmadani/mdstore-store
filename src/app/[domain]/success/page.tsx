'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { CheckCircle, Package, Phone, Truck, ShoppingBag, ArrowLeft, Sparkles } from 'lucide-react'
import { usePixel } from '@/Hook/pixel-provider'
import { use } from 'react'

export default function SuccessPage({
  params,
}: {
  params: Promise<{ domain: string }>
}) {
  const { domain } = use(params)
  const { trackPurchase } = usePixel()
  const [visible, setVisible] = useState(false)
  const [count, setCount]     = useState(0)
  const hasTracked            = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    let frame = 0
    const interval = setInterval(() => {
      frame += 2
      setCount(Math.min(frame, 100))
      if (frame >= 100) clearInterval(interval)
    }, 12)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!domain || hasTracked.current) return
    const saved = localStorage.getItem('last_order')
    if (saved) {
      try {
        const order = JSON.parse(saved)
        trackPurchase(order.total, 'DZD', order.id)
        hasTracked.current = true
      } catch {}
    }
  }, [domain, trackPurchase])

  const steps = [
    { icon: CheckCircle, title: 'تم استلام طلبك',  desc: 'تم تسجيل طلبك بنجاح في نظامنا', done: true  },
    { icon: Phone,       title: 'تأكيد الطلب',     desc: 'سنتصل بك خلال 24 ساعة',         done: false },
    { icon: Package,     title: 'تجهيز وتغليف',    desc: 'يتم تجهيز منتجك بعناية',        done: false },
    { icon: Truck,       title: 'الشحن والتوصيل',  desc: '2-5 أيام عمل',                  done: false },
  ]

  return (
    <>
      <style>{`
        .sp{position:fixed;inset:0;z-index:9999;overflow-y:auto;background:linear-gradient(180deg,#f9fafb 0%,#fff 100%);color:#111827;direction:rtl;font-family:'Segoe UI',system-ui,sans-serif}
        .sw{max-width:640px;width:100%;margin:0 auto;padding:0 24px}
        .sh{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 0 48px;overflow:hidden;text-align:center}
        .shg{position:absolute;top:0;left:50%;transform:translateX(-50%);width:480px;height:480px;background:radial-gradient(circle,#d1fae5 0%,transparent 70%);pointer-events:none;border-radius:50%}
        .siw{position:relative;z-index:1;margin-bottom:32px;transition:transform .7s cubic-bezier(.34,1.56,.64,1),opacity .7s ease}
        .siw.hs{transform:scale(.4);opacity:0}.siw.vs{transform:scale(1);opacity:1}
        .sip{position:absolute;top:-20px;left:-20px;width:120px;height:120px;border-radius:50%;background:rgba(167,243,208,.5);animation:ping 1.5s cubic-bezier(0,0,.2,1) infinite}
        @keyframes ping{75%,100%{transform:scale(1.8);opacity:0}}
        .sic{position:relative;width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#34d399,#059669);display:flex;align-items:center;justify-content:center;box-shadow:0 20px 40px rgba(16,185,129,.3)}
        .se{position:relative;z-index:1;transition:transform .7s ease .2s,opacity .7s ease .2s}
        .se.hs{opacity:0;transform:translateY(20px)}.se.vs{opacity:1;transform:translateY(0)}
        .sb{display:inline-flex;align-items:center;gap:6px;margin-bottom:12px;font-size:11px;font-weight:800;color:#d97706;letter-spacing:.15em;text-transform:uppercase}
        .st{font-size:clamp(2rem,5vw,2.8rem);font-weight:900;line-height:1.2;color:#111827;margin:0 0 16px}
        .ss{font-size:15px;color:#6b7280;line-height:1.7;max-width:360px;margin:0 auto}
        .sp2{margin-bottom:40px;transition:opacity .7s ease .3s}.sp2.hs{opacity:0}.sp2.vs{opacity:1}
        .sph{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
        .spl{font-size:12px;color:#9ca3af;font-weight:500}.spp{font-size:12px;font-weight:900;color:#059669}
        .spt{height:10px;background:#f3f4f6;border-radius:999px;overflow:hidden;border:1px solid #e5e7eb}
        .spf{height:100%;background:linear-gradient(to left,#34d399,#059669);border-radius:999px;transition:width 75ms linear}
        .ssteps{display:flex;flex-direction:column;gap:8px;margin-bottom:40px}
        .sstep{display:flex;align-items:center;gap:16px;padding:14px 16px;border-radius:16px;border:1px solid transparent;transition:opacity .5s ease,transform .5s ease}
        .sstep.hs{opacity:0;transform:translateX(30px)}.sstep.vs{opacity:1;transform:translateX(0)}
        .sstep.done{background:rgba(16,185,129,.06);border-color:rgba(16,185,129,.2)}.sstep.pending{background:rgba(0,0,0,.02);border-color:rgba(0,0,0,.06)}
        .si2{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .si2.done{background:#d1fae5;color:#059669}.si2.pending{background:#f3f4f6;color:#9ca3af}
        .sin{flex:1;min-width:0}
        .stn{font-size:14px;font-weight:700;margin:0 0 2px}.stn.done{color:#111827}.stn.pending{color:#9ca3af}
        .sdn{font-size:12px;color:#9ca3af;margin:0}
        .sba{font-size:10px;font-weight:800;color:#059669;background:#f0fdf4;padding:4px 10px;border-radius:999px;border:1px solid #bbf7d0;white-space:nowrap}
        .sa{padding-bottom:64px;display:flex;flex-direction:column;gap:10px;transition:opacity .7s ease .8s}.sa.hs{opacity:0}.sa.vs{opacity:1}
        .bp{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:16px;background:#111827;color:#fff;font-size:15px;font-weight:900;border-radius:16px;text-decoration:none;transition:background .2s ease;box-shadow:0 4px 20px rgba(0,0,0,.15)}
        .bp:hover{background:#1f2937}
        .bs{display:flex;align-items:center;justify-content:center;width:100%;padding:14px;background:#fff;color:#6b7280;font-size:13px;font-weight:600;border-radius:16px;border:1px solid #e5e7eb;text-decoration:none;transition:background .2s ease}
        .bs:hover{background:#f9fafb}
        @media(max-width:480px){.sh{padding:60px 0 36px}.st{font-size:1.8rem}}
      `}</style>

      <div className="sp">
        <div className="sw">
          <div className="sh">
            <div className="shg" />
            <div className={`siw ${visible ? 'vs' : 'hs'}`}>
              <div className="sip" />
              <div className="sic"><CheckCircle size={40} color="#fff" /></div>
            </div>
            <div className={`se ${visible ? 'vs' : 'hs'}`}>
              <div className="sb"><Sparkles size={14} /> طلب ناجح <Sparkles size={14} /></div>
              <h1 className="st">تم تأكيد طلبك!</h1>
              <p className="ss">شكراً لثقتك بنا. طلبك في أيدٍ أمينة وسنتواصل معك قريباً لتأكيد التسليم.</p>
            </div>
          </div>

          <div className={`sp2 ${visible ? 'vs' : 'hs'}`}>
            <div className="sph">
              <span className="spl">تقدم الطلب</span>
              <span className="spp">{count}%</span>
            </div>
            <div className="spt"><div className="spf" style={{ width: `${count}%` }} /></div>
          </div>

          <div className="ssteps">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className={`sstep ${step.done ? 'done' : 'pending'} ${visible ? 'vs' : 'hs'}`} style={{ transitionDelay: `${0.4 + i * 0.1}s` }}>
                  <div className={`si2 ${step.done ? 'done' : 'pending'}`}><Icon size={18} /></div>
                  <div className="sin">
                    <p className={`stn ${step.done ? 'done' : 'pending'}`}>{step.title}</p>
                    <p className="sdn">{step.desc}</p>
                  </div>
                  {step.done && <span className="sba">مكتمل ✓</span>}
                </div>
              )
            })}
          </div>

          <div className={`sa ${visible ? 'vs' : 'hs'}`}>
            <Link href={`/${domain}`} className="bp"><ShoppingBag size={18} /> تصفح المزيد من المنتجات <ArrowLeft size={16} style={{ opacity: 0.4 }} /></Link>
            <Link href={`/${domain}`} className="bs">العودة إلى الصفحة الرئيسية</Link>
          </div>
        </div>
      </div>
    </>
  )
}
