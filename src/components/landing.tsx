import React from 'react'

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center h-screen min-h-[400px] w-full bg-white rounded-3xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden relative">
      
      <div className="relative z-10 flex flex-col items-center">
        
        {/* مؤشر النقاط الثلاث - حجم صغير وأسود عملي */}
        <div className="flex items-center justify-center gap-1.5 h-10">
          {/* النقطة الأولى */}
          <div className="w-2 h-2 bg-black rounded-full animate-pulse [animation-duration:0.8s]"></div>
          
          {/* النقطة الثانية */}
          <div className="w-2 h-2 bg-black/60 rounded-full animate-pulse [animation-duration:0.8s] [animation-delay:0.2s]"></div>
          
          {/* النقطة الثالثة */}
          <div className="w-2 h-2 bg-black/30 rounded-full animate-pulse [animation-duration:0.8s] [animation-delay:0.4s]"></div>
        </div>

        {/* نص اختياري بسيط */}
        <span className="mt-2 text-[10px] font-medium text-black/40 uppercase tracking-[0.2em]">Loading</span>
      </div>
    </div>
  )
}