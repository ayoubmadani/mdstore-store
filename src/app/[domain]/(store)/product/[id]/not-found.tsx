import React from 'react'

interface NotFoundProps {
  lang?: 'ar' | 'fr'
}

const NotFound = ({ lang = 'ar' }: NotFoundProps) => {
  return (
    <div className="w-full min-h-[500px] flex justify-center items-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100 via-slate-100 to-slate-200 p-4">
      <div 
        className="p-8 md:p-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 shadow-2xl max-w-sm w-full text-center"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <p className="text-xl font-bold text-slate-800 animate-pulse tracking-wide">
          {lang === 'ar' && 'المنتج غير موجود'}
          {lang === 'fr' && 'Produit non trouvé'}
        </p>
      </div>
    </div>
  )
}

export default NotFound