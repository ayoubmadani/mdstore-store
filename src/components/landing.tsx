import React from 'react'

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center h-screen min-h-[400px] w-full bg-slate-50 rounded-3xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden relative">

      {/* تأثير الوميض الخلفي الفاتح (Soft Pastel Glow) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-100/50 blur-[120px] rounded-full animate-pulse"></div>

      <div className="relative z-10 flex flex-col items-center">

        {/* مؤشر التحميل البصري (Light Glassy Loader) */}
        <div className="relative flex items-center justify-center mb-10">
          {/* الدائرة الخارجية مع تأثير زجاجي */}
          <div className="w-24 h-24 border-[6px] border-slate-200 border-t-blue-600 rounded-full animate-spin shadow-inner"></div>

          {/* المركز النابض - ألوان مشرقة */}
          <div className="absolute w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-400 rounded-2xl rotate-12 animate-bounce shadow-lg shadow-blue-200"></div>
        </div>
      </div>
    </div>

  )
}
