'use client';

import React from 'react';
import {
  ShieldCheck, Eye, Lock, Database, Globe, Bell,
  FileText, CheckCircle2, AlertCircle, Scale, CreditCard, Ban,
  Cookie as CookieIcon, Settings, MousePointer2, ToggleRight,
} from 'lucide-react';
import ContactStaticTest from './contact';

interface StaticPageProps { page: string; }

export default function StaticPage({ page }: StaticPageProps) {
  const p = page.toLowerCase();
  return (
    <>
      {p === 'privacy' && <Privacy />}
      {p === 'terms'   && <Terms />}
      {p === 'cookise' && <Cookies />}
      {p === 'contact' && <ContactStaticTest />}
    </>
  );
}

/* ── Shared page wrapper ── */
function PageWrapper({
  children, icon, title, subtitle, tag,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tag: string;
}) {
  return (
    <div
      className="min-h-screen py-24"
      dir="rtl"
      style={{ backgroundColor: '#F7F0E6', fontFamily: "'Karla', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;1,9..144,300;1,9..144,400&family=Karla:wght@300;400;500&display=swap');`}</style>

      <div className="max-w-3xl mx-auto px-6 lg:px-10">

        {/* Page header */}
        <div className="mb-14">
          {/* Breadcrumb */}
          <p className="text-xs tracking-widest mb-6 uppercase" style={{ color: '#C4714A', letterSpacing: '0.18em' }}>
            ✦ {tag}
          </p>

          <div className="flex items-start gap-5 mb-5">
            <div
              className="w-14 h-14 flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#F0E4D4', borderRadius: '50%', color: '#C4714A' }}
            >
              {icon}
            </div>
            <div>
              <h1
                style={{
                  fontFamily:    "'Fraunces', serif",
                  fontStyle:     'italic',
                  fontWeight:    300,
                  fontSize:      'clamp(1.8rem, 4vw, 2.8rem)',
                  color:         '#3D2314',
                  letterSpacing: '-0.02em',
                  lineHeight:    1.2,
                }}
              >
                {title}
              </h1>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: '#9E8060' }}>
                {subtitle}
              </p>
            </div>
          </div>

          {/* Wavy divider */}
          <svg viewBox="0 0 600 20" preserveAspectRatio="none" style={{ width: '100%', height: '20px', display: 'block', marginTop: '1.5rem' }}>
            <path d="M0,10 C150,0 300,20 450,10 C525,5 570,12 600,10" stroke="#E0CEBC" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>

        {children}
      </div>
    </div>
  );
}

/* ── Info card ── */
function InfoCard({ icon, title, desc, status }: {
  icon: React.ReactNode; title: string; desc: string; status?: string;
}) {
  const isActive = status === 'دائماً نشطة';

  return (
    <div
      className="flex gap-5 p-6 mb-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
      style={{
        backgroundColor: '#FDF8F2',
        borderRadius:    '20px',
        border:          '1px solid #EDE0CE',
      }}
    >
      {/* Left colored bar */}
      <div
        className="w-1 self-stretch flex-shrink-0 rounded-full"
        style={{ backgroundColor: isActive ? '#7A9068' : '#D4A28C' }}
      />

      <div
        className="w-11 h-11 flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: '#F0E4D4', borderRadius: '50%', color: '#C4714A' }}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h3
            style={{
              fontFamily: "'Fraunces', serif",
              fontStyle:  'italic',
              fontWeight: 400,
              fontSize:   '1.05rem',
              color:      '#3D2314',
            }}
          >
            {title}
          </h3>
          {status && (
            <span
              className="text-[10px] font-semibold tracking-widest px-3 py-1"
              style={{
                backgroundColor: isActive ? 'rgba(122,144,104,0.12)' : 'rgba(196,113,74,0.1)',
                color:           isActive ? '#7A9068' : '#C4714A',
                borderRadius:    '20px',
                letterSpacing:   '0.1em',
              }}
            >
              {status}
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed" style={{ color: '#9E8060' }}>{desc}</p>
      </div>
    </div>
  );
}

/* ── Privacy ── */
export function Privacy() {
  return (
    <PageWrapper icon={<ShieldCheck size={22}/>} title="سياسة الخصوصية" subtitle="في MdStore، نضع خصوصية بياناتك وأمان متجرك على رأس أولوياتنا." tag="Privacy">
      <InfoCard icon={<Database size={18}/>}  title="البيانات التي نجمعها"   desc="نجمع فقط البيانات الضرورية لتشغيل متجرك، مثل الاسم والبريد الإلكتروني ومعلومات الدفع لضمان تجربة بيع سلسة." />
      <InfoCard icon={<Eye size={18}/>}       title="كيفية استخدام البيانات" desc="تُستخدم بياناتك لتحسين خدماتنا ومعالجة الطلبات وتوفير تقارير ذكية تساعدك في اتخاذ قرارات تجارية أفضل." />
      <InfoCard icon={<Lock size={18}/>}      title="حماية المعلومات"         desc="نستخدم تقنيات تشفير متطورة ومعايير أمان عالمية لحماية بياناتك من أي وصول غير مصرح به." />
      <InfoCard icon={<Globe size={18}/>}     title="مشاركة البيانات"          desc="نحن لا نبيع بياناتك أبداً. نشاركها فقط مع مزودي الخدمات الموثوقين لإتمام عملياتك التجارية." />

      <div
        className="mt-8 p-5 flex items-center justify-between"
        style={{ backgroundColor: '#FDF8F2', borderRadius: '16px', border: '1px solid #EDE0CE' }}
      >
        <div className="flex items-center gap-3">
          <Bell size={15} style={{ color: '#C4714A' }} />
          <p className="text-xs leading-relaxed" style={{ color: '#9E8060' }}>
            نقوم بتحديث هذه السياسة دورياً لضمان مواكبة أحدث معايير الأمان.
          </p>
        </div>
        <span className="text-xs flex-shrink-0 mr-4 font-medium" style={{ color: '#C4714A' }}>
          06/02/2026
        </span>
      </div>
    </PageWrapper>
  );
}

/* ── Terms ── */
export function Terms() {
  return (
    <PageWrapper icon={<FileText size={22}/>} title="شروط الاستخدام" subtitle="باستخدامك لمنصة MdStore، فإنك توافق على الالتزام بالشروط والقواعد التالية." tag="Terms">
      <InfoCard icon={<CheckCircle2 size={18}/>} title="مسؤولية الحساب"     desc="أنت مسؤول عن الحفاظ على سرية بيانات حسابك وعن جميع الأنشطة التي تحدث تحته. يجب أن تكون المعلومات المقدمة دقيقة ومحدثة." />
      <InfoCard icon={<CreditCard size={18}/>}   title="الرسوم والاشتراكات" desc="تخضع خدماتنا لرسوم اشتراك دورية. جميع الرسوم واضحة ولا توجد تكاليف مخفية، ويتم تحصيلها وفقاً للخطة التي تختارها." />
      <InfoCard icon={<Ban size={18}/>}           title="المحتوى المحظور"    desc="يُمنع استخدام المنصة لبيع سلع غير قانونية أو انتهاك حقوق الملكية الفكرية. نحتفظ بالحق في إغلاق أي متجر يخالف هذه القوانين." />
      <InfoCard icon={<Scale size={18}/>}         title="القانون المعمول به" desc="تخضع هذه الشروط وتفسر وفقاً للقوانين المحلية المعمول بها في الجزائر، وأي نزاع ينشأ يخضع للاختصاص القضائي." />

      <div
        className="mt-8 p-5 flex items-start gap-3"
        style={{ backgroundColor: 'rgba(212,162,140,0.12)', borderRadius: '16px', border: '1px solid rgba(212,162,140,0.3)' }}
      >
        <AlertCircle size={16} style={{ color: '#C4714A', flexShrink: 0, marginTop: '2px' }} />
        <p className="text-xs leading-relaxed" style={{ color: '#9E8060' }}>
          نحتفظ بالحق في تعديل هذه الشروط في أي وقت. استمرار استخدامك للمنصة بعد التعديلات يعد موافقة منك على الشروط الجديدة.
        </p>
      </div>
    </PageWrapper>
  );
}

/* ── Cookies ── */
export function Cookies() {
  return (
    <PageWrapper icon={<CookieIcon size={22}/>} title="سياسة ملفات تعريف الارتباط" subtitle="نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتخصيص المحتوى وتحليل حركة المرور على منصتنا." tag="Cookies">
      <InfoCard icon={<ShieldCheck size={18}/>}   title="ملفات ضرورية"      desc="هذه الملفات مطلوبة لتشغيل الوظائف الأساسية للموقع مثل تسجيل الدخول وتأمين سلة التسوق. لا يمكن إيقافها." status="دائماً نشطة" />
      <InfoCard icon={<Settings size={18}/>}      title="ملفات التفضيلات"   desc="تسمح للموقع بتذكر خياراتك مثل اللغة التي تستخدمها حالياً ومنطقتك الزمنية." status="اختياري" />
      <InfoCard icon={<MousePointer2 size={18}/>} title="ملفات التحليل"     desc="تساعدنا على فهم كيفية تفاعل التجار مع MdStore مما يسمح لنا بتطوير أدوات بيع أكثر كفاءة." status="اختياري" />

      <div
        className="mt-8 p-7 relative overflow-hidden"
        style={{ backgroundColor: '#3D2314', borderRadius: '20px' }}
      >
        {/* Decorative circle in BG */}
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ backgroundColor: 'rgba(196,113,74,0.15)' }}
        />
        <div className="relative flex gap-4 items-start">
          <ToggleRight size={20} style={{ color: '#D4A28C', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3
              className="mb-2"
              style={{
                fontFamily: "'Fraunces', serif",
                fontStyle:  'italic',
                fontSize:   '1.1rem',
                color:      '#F7F0E6',
                fontWeight: 400,
              }}
            >
              كيف تتحكم في خياراتك؟
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(247,240,230,0.6)' }}>
              يمكنك إدارة أو مسح ملفات تعريف الارتباط من خلال إعدادات متصفحك في أي وقت. يرجى العلم أن تعطيل بعضها قد يؤثر على تجربة استخدام المنصة.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}