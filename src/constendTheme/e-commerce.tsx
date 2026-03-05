'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, MapPin, Phone, User, Home as HomeIcon, ChevronDown, Truck, Shield, Package,
  Building2, AlertCircle, Tag, Check, ChevronLeft, ChevronRight, FileText, Heart,
  Infinity, Link2, RefreshCw, Share2, Star, X, ShieldCheck, Eye, Lock, Database, Globe, Bell,
  CheckCircle2, Scale, CreditCard, Ban, Cookie as CookieIcon, Settings, MousePointer2, ToggleRight,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// MOCK DATA - بيانات تجريبية ثابتة
// ─────────────────────────────────────────────────────────────

const MOCK_STORE = {
  name: 'متجر التجربة',
  subdomain: 'demo',
  language: 'ar',
  currency: 'د.ج',
  topBar: {
    enabled: true,
    text: '🎉 شحن مجاني للطلبات فوق 5000 د.ج',
    color: '#4F46E5',
  },
  design: {
    primaryColor: '#4F46E5',
    secondaryColor: '#10B981',
    logoUrl: null, // جرب تغييرها لرابط صورة حقيقية
  },
  hero: {
    title: 'أفضل المنتجات بأسعار مميزة',
    subtitle: 'اكتشف تشكيلتنا الجديدة من المنتجات المتميزة',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
  },
  categories: [
    { id: '1', name: 'إلكترونيات', imageUrl: 'https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=400' },
    { id: '2', name: 'أزياء', imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400' },
    { id: '3', name: 'منزل', imageUrl: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400' },
    { id: '4', name: 'رياضة', imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400' },
  ],
  contact: {
    email: 'demo@store.com',
    phone: '+213550123456',
    wilaya: 'الجزائر العاصمة',
    facebook: 'https://facebook.com',
    whatsapp: '213550123456',
    tiktok: 'https://tiktok.com',
  },
};

const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'سماعات لاسلكية فاخرة',
    slug: 'luxury-headphones',
    price: 8990,
    priceOriginal: 12990,
    desc: '<p>سماعات عالية الجودة مع عزل الضوضاء النشط وعمر بطارية يصل إلى 30 ساعة.</p>',
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    imagesProduct: [
      { id: '1', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
      { id: '2', imageUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600' },
    ],
    stock: 15,
    isActive: true,
    offers: [
      { id: '1', name: 'عرض الزوج', quantity: 2, price: 15990 },
      { id: '2', name: 'عرض الجملة', quantity: 5, price: 34990 },
    ],
    attributes: [
      {
        id: '1',
        type: 'color',
        name: 'اللون',
        displayMode: 'color' as const,
        variants: [
          { id: '1', name: 'أسود', value: '#000000' },
          { id: '2', name: 'أبيض', value: '#FFFFFF' },
          { id: '3', name: 'أزرق', value: '#3B82F6' },
        ],
      },
      {
        id: '2',
        type: 'size',
        name: 'المقاس',
        displayMode: 'text' as const,
        variants: [
          { id: '4', name: 'صغير', value: 'S' },
          { id: '5', name: 'وسط', value: 'M' },
          { id: '6', name: 'كبير', value: 'L' },
        ],
      },
    ],
    variantDetails: [
      { id: 'v1', name: [{ attrName: 'اللون', value: '#000000', attrId: '1', displayMode: 'color' }, { attrName: 'المقاس', value: 'M', attrId: '2', displayMode: 'text' }], price: 8990, stock: 5, autoGenerate: false },
      { id: 'v2', name: [{ attrName: 'اللون', value: '#FFFFFF', attrId: '1', displayMode: 'color' }, { attrName: 'المقاس', value: 'L', attrId: '2', displayMode: 'text' }], price: 9490, stock: 3, autoGenerate: false },
    ],
    store: { id: 's1', name: 'متجر التجربة', subdomain: 'demo', userId: 'u1' },
  },
  {
    id: '2',
    name: 'ساعة ذكية رياضية',
    slug: 'smart-watch',
    price: 12990,
    priceOriginal: 15990,
    desc: '<p>تتبع لياقتك البدنية مع هذه الساعة الذكية المتطورة.</p>',
    productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    stock: 8,
    isActive: true,
    offers: [],
    attributes: [],
    variantDetails: [],
    store: { id: 's1', name: 'متجر التجربة', subdomain: 'demo', userId: 'u1' },
  },
  {
    id: '3',
    name: 'حقيبة ظهر أنيقة',
    slug: 'stylish-backpack',
    price: 4590,
    priceOriginal: null,
    desc: '<p>حقيبة عملية وأنيقة للاستخدام اليومي.</p>',
    productImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
    stock: 0,
    isActive: true,
    offers: [],
    attributes: [],
    variantDetails: [],
    store: { id: 's1', name: 'متجر التجربة', subdomain: 'demo', userId: 'u1' },
  },
  {
    id: '4',
    name: 'كاميرا احترافية',
    slug: 'pro-camera',
    price: 45900,
    priceOriginal: 52900,
    desc: '<p>كاميرا احترافية للتصوير الفوتوغرافي المتقدم.</p>',
    productImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600',
    stock: 3,
    isActive: true,
    offers: [{ id: '3', name: 'مع عدسة إضافية', quantity: 1, price: 54900 }],
    attributes: [],
    variantDetails: [],
    store: { id: 's1', name: 'متجر التجربة', subdomain: 'demo', userId: 'u1' },
  },
];

const MOCK_WILAYAS = [
  { id: '16', name: 'Alger', ar_name: 'الجزائر', livraisonHome: 600, livraisonOfice: 400, livraisonReturn: 0 },
  { id: '31', name: 'Oran', ar_name: 'وهران', livraisonHome: 800, livraisonOfice: 500, livraisonReturn: 100 },
  { id: '09', name: 'Blida', ar_name: 'البليدة', livraisonHome: 700, livraisonOfice: 450, livraisonReturn: 50 },
];

const MOCK_COMMUNES = [
  { id: '1601', name: 'Alger Centre', ar_name: 'الجزائر الوسطى', wilayaId: '16' },
  { id: '1602', name: 'Bab El Oued', ar_name: 'باب الزوار', wilayaId: '16' },
  { id: '3101', name: 'Oran Centre', ar_name: 'وهران', wilayaId: '31' },
];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function variantMatches(detail: any, sel: Record<string, string>): boolean {
  return Object.entries(sel).every(([attrName, val]) =>
    detail.name.some((e: any) => e.attrName === attrName && e.value === val)
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────

function Navbar({ store }: { store: any }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isRTL = store.language === 'ar';
  const initials = store.name.split(' ').filter(Boolean).map((w: string) => w[0].toUpperCase()).join('');

  const navItems = [
    { href: '#', label: isRTL ? 'الرئيسية' : 'Home' },
    { href: '#contact', label: isRTL ? 'اتصل بنا' : 'Contact' },
    { href: '#privacy', label: isRTL ? 'سياسة الخصوصية' : 'Privacy' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
            {store.design.logoUrl ? (
              <img src={store.design.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
            ) : (
              <>
                <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-black text-sm tracking-wider shrink-0" style={{ backgroundColor: store.design.primaryColor }}>
                  {initials}
                </div>
                <span className="font-bold text-xl text-gray-900 hidden sm:block">{store.name}</span>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, idx) => (
              <a key={idx} href={item.href} className="text-gray-600 hover:text-gray-900 font-medium transition-colors relative group">
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full" style={{ backgroundColor: store.design.primaryColor }} />
              </a>
            ))}
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-2">
              {navItems.map((item, idx) => (
                <a key={idx} href={item.href} onClick={() => setIsMenuOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function Footer({ store }: { store: any }) {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-bold">{store.name.charAt(0)}</div>
            <span className="font-bold text-lg">{store.name}</span>
          </div>
          <p className="text-gray-400 text-sm">© 2026 {store.name}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</a>
            <a href="#terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms</a>
            <a href="#cookies" className="text-gray-400 hover:text-white text-sm transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Card({ product, store }: { product: any; store: any }) {
  const isRTL = store.language === 'ar';
  const displayImage = product.productImage || product.imagesProduct?.[0]?.imageUrl;
  const discount = product.priceOriginal ? Math.round(((product.priceOriginal - product.price) / product.priceOriginal) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col">
      <div className="h-64 relative overflow-hidden bg-gray-100">
        {displayImage ? (
          <img src={displayImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
            <span className="text-sm font-medium">{isRTL ? 'لا توجد صورة' : 'No Image'}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">-{discount}%</div>
        )}
      </div>

      <div className="p-6 text-center flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 mb-2 text-lg line-clamp-1 h-7">{product.name}</h3>
        {product.desc && <div className="text-sm text-gray-500 mb-4 line-clamp-2 h-10 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.desc }} />}
        <div className="mt-auto">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="text-xl font-black" style={{ color: store.design.primaryColor }}>
              {product.price.toLocaleString()} <span className="text-sm font-normal">{store.currency}</span>
            </span>
            {product.priceOriginal && (
              <span className="text-sm text-gray-400 line-through">{product.priceOriginal.toLocaleString()}</span>
            )}
          </div>
          <button 
            onClick={() => document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })}
            className="block w-full py-3 px-4 rounded-xl text-white font-bold transition-all hover:opacity-90 hover:shadow-lg active:scale-95 text-center"
            style={{ backgroundColor: store.design.primaryColor }}
          >
            {isRTL ? 'عرض التفاصيل' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Hero({ store }: { store: any }) {
  return (
    <section
      className="relative h-[450px] md:h-[550px] flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: store.hero.imageUrl ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${store.hero.imageUrl})` : 'none',
        backgroundColor: !store.hero.imageUrl ? '#e5e7eb' : 'transparent',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {(store.hero.title || store.hero.subtitle) && (
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          {store.hero.title && <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight drop-shadow-lg">{store.hero.title}</h1>}
          {store.hero.subtitle && <p className="text-lg md:text-2xl opacity-95 font-light tracking-wide drop-shadow-md">{store.hero.subtitle}</p>}
        </div>
      )}
    </section>
  );
}

function Categories({ store }: { store: any }) {
  const isRTL = store.language === 'ar';
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{isRTL ? 'التصنيفات' : 'Categories'}</h2>
          <div className="w-20 h-1.5 mx-auto rounded-full" style={{ backgroundColor: store.design.primaryColor }} />
        </div>

        <div className="flex gap-8 overflow-x-auto pb-8 pt-4 justify-start md:justify-center">
          <div className="flex flex-col items-center min-w-[140px] cursor-pointer group">
            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-4 overflow-hidden transition-all duration-300 group-hover:scale-110 shadow-lg border-4 border-white">
              <span className="text-4xl">🛍️</span>
            </div>
            <span className="text-base font-bold text-gray-700 text-center group-hover:text-indigo-600 transition-colors">All Products</span>
          </div>

          {store.categories.map((cat: any) => (
            <div key={cat.id} className="flex flex-col items-center min-w-[140px] cursor-pointer group">
              <div
                className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-4 overflow-hidden transition-all duration-300 group-hover:scale-110 shadow-lg border-4 border-white"
                style={{ backgroundImage: cat.imageUrl ? `url(${cat.imageUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                {!cat.imageUrl && <span className="text-3xl font-bold text-gray-300 uppercase">{cat.name?.charAt(0)}</span>}
              </div>
              <span className="text-base font-bold text-gray-700 text-center group-hover:text-indigo-600 transition-colors">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductGrid({ store, products }: { store: any; products: any[] }) {
  const isRTL = store.language === 'ar';
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{isRTL ? 'المنتجات' : 'Products'}</h2>
          <div className="w-20 h-1.5 mx-auto rounded-full" style={{ backgroundColor: store.design.primaryColor }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Card key={product.id} product={product} store={store} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductDetails({ product, store }: { product: any; store: any }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const allImages = product.imagesProduct?.map((img: any) => img.imageUrl) || [product.productImage].filter(Boolean);
  const discount = product.priceOriginal ? Math.round(((product.priceOriginal - product.price) / product.priceOriginal) * 100) : 0;
  
  const finalPrice = selectedOffer 
    ? product.offers.find((o: any) => o.id === selectedOffer)?.price || product.price
    : product.price;

  const inStock = product.stock > 0;
  const autoGen = product.variantDetails?.some((v: any) => v.autoGenerate);

  const handleVariantSelection = (attrName: string, value: string) => {
    setSelectedVariants(prev => ({ ...prev, [attrName]: value }));
  };

  return (
    <div id="details" className="min-h-screen bg-white py-12" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden group">
              {allImages.length > 0 ? (
                <img src={allImages[selectedImage]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Package className="w-20 h-20 text-gray-200" /></div>
              )}
              
              {discount > 0 && <div className="absolute top-4 right-4 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">خصم {discount}%</div>}
              
              <button onClick={() => setIsWishlisted(!isWishlisted)} className={`absolute top-4 left-4 p-2.5 rounded-full backdrop-blur-md transition-all ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600'}`}>
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>

              {!inStock && !autoGen && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2"><Package className="w-5 h-5" /> نفذت الكمية</div>
                </div>
              )}

              {allImages.length > 1 && (
                <>
                  <button onClick={() => setSelectedImage(p => p === 0 ? allImages.length - 1 : p - 1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                  <button onClick={() => setSelectedImage(p => p === allImages.length - 1 ? 0 : p + 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img: string, idx: number) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} className={`shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-gray-900 opacity-100' : 'border-transparent opacity-60'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 pt-2">
              {[ { icon: <Truck className="w-5 h-5" />, label: 'توصيل سريع', sub: '24-48 ساعة' }, { icon: <Shield className="w-5 h-5" />, label: 'جودة مضمونة', sub: '100% أصلي' }, { icon: <RefreshCw className="w-5 h-5" />, label: 'استبدال سهل', sub: '7 أيام' } ].map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-2 py-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-gray-700">{b.icon}</span>
                  <span className="text-xs font-bold text-gray-800">{b.label}</span>
                  <span className="text-[10px] text-gray-400">{b.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-snug">{product.name}</h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />)}
                </div>
                <span className="text-xs text-gray-500 font-medium">(4.8) · ١٢٨ تقييم</span>
                <span className="text-xs text-green-600 font-medium">٨٦ تم شراؤه اليوم</span>
              </div>
            </div>

            <div className="flex items-baseline gap-4 bg-gray-50 p-4 rounded-2xl">
              <span className="text-4xl font-black text-gray-900 tracking-tight">
                {finalPrice.toLocaleString('ar-DZ')}<span className="text-lg font-semibold text-gray-400 mr-1">د.ج</span>
              </span>
              {product.priceOriginal && product.priceOriginal > finalPrice && (
                <div className="flex flex-col">
                  <span className="text-lg text-gray-400 line-through">{product.priceOriginal.toLocaleString('ar-DZ')} د.ج</span>
                  <span className="text-xs text-red-500 font-bold">وفّر {(product.priceOriginal - finalPrice).toLocaleString('ar-DZ')} د.ج</span>
                </div>
              )}
            </div>

            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${autoGen ? 'bg-blue-50 text-blue-700 border-blue-200' : inStock ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
              {autoGen ? <Infinity className="w-4 h-4" /> : inStock ? <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> : <X className="w-4 h-4" />}
              {autoGen ? 'متوفر دائماً' : inStock ? 'متوفر في المخزون' : 'غير متوفر حالياً'}
            </div>

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-1"><Star className="w-3 h-3 fill-amber-800" /> العروض المتاحة</p>
                <div className="space-y-2">
                  {product.offers.map((offer: any) => (
                    <label key={offer.id} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedOffer === offer.id ? 'border-gray-900 bg-white shadow-sm' : 'border-amber-200/50 bg-white/50'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedOffer === offer.id ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}>
                          {selectedOffer === offer.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <input type="radio" name="offer" checked={selectedOffer === offer.id} onChange={() => setSelectedOffer(offer.id)} className="sr-only" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{offer.name}</p>
                          <p className="text-xs text-gray-500">{offer.quantity} قطع في العرض</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-lg font-black text-gray-900">{offer.price.toLocaleString('ar-DZ')}</span>
                        <span className="text-xs text-gray-500 mr-1">د.ج</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            {product.attributes?.map((attr: any) => (
              <div key={attr.id}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{attr.name}</p>
                {attr.displayMode === 'color' ? (
                  <div className="flex gap-3 flex-wrap">
                    {attr.variants.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} title={v.name} className={`w-10 h-10 rounded-full border-2 transition-all shadow-sm ${isSel ? 'ring-2 ring-gray-900 ring-offset-2 scale-110 border-gray-900' : 'border-gray-200'}`} style={{ backgroundColor: v.value }} />;
                    })}
                  </div>
                ) : attr.displayMode === 'image' ? (
                  <div className="flex gap-3 flex-wrap">
                    {attr.variants.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${isSel ? 'border-gray-900 ring-2 ring-gray-200' : 'border-gray-200'}`}><img src={v.value} alt={v.name} className="w-full h-full object-cover" /></button>;
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {attr.variants.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${isSel ? 'border-gray-900 bg-gray-900 text-white shadow-lg' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'}`}>{v.name}</button>;
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Order Form Preview */}
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xl shadow-gray-900/5">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-gray-700" />
                  <p className="font-bold text-gray-900">نموذج الطلب (تجريبي)</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">الاسم</label>
                    <div className="relative">
                      <User className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                      <input type="text" placeholder="محمد أحمد" className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-sm" readOnly />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">الهاتف</label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                      <input type="tel" placeholder="0550 123 456" className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-sm" readOnly />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">الولاية</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm" disabled>
                    <option>الجزائر (600 د.ج)</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 font-bold text-xl">−</button>
                  <span className="w-16 text-center text-2xl font-black text-gray-900">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 font-bold text-xl">+</button>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5 space-y-3 text-sm border border-gray-100">
                  <div className="flex justify-between text-gray-600">
                    <span>سعر القطعة</span>
                    <span className="font-bold">{(finalPrice * quantity).toLocaleString()} د.ج</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t-2 border-dashed border-gray-200">
                    <span className="font-bold text-gray-900">الإجمالي</span>
                    <span className="text-2xl font-black text-gray-900">{(finalPrice * quantity + 600).toLocaleString()} د.ج</span>
                  </div>
                </div>

                <button className="w-full py-4 rounded-2xl font-bold text-base bg-gray-900 text-white flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" /> تأكيد الطلب (وهمي)
                </button>
              </div>
            </div>
          </div>
        </div>

        {product.desc && (
          <section className="mt-16 pt-12 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><FileText className="w-5 h-5" /> وصف المنتج</h2>
            <div className="prose max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: product.desc }} />
          </section>
        )}
      </div>
    </div>
  );
}

function StaticPages() {
  const Card = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 flex gap-4 items-start hover:shadow-lg transition-all">
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </div>
  );

  return (
    <div className="py-20 bg-[#f8f8f6]" dir="rtl">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">الصفحات الثابتة</h2>
          <div className="w-20 h-1.5 mx-auto rounded-full bg-indigo-500" />
        </div>

        <div className="grid gap-4 mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-indigo-500" /> سياسة الخصوصية</h3>
          <Card icon={<Database className="text-blue-500" />} title="البيانات التي نجمعها" desc="نجمع فقط البيانات الضرورية لتشغيل المتجر بكفاءة." />
          <Card icon={<Lock className="text-emerald-500" />} title="حماية المعلومات" desc="نستخدم تقنيات تشفير متطورة لحماية بياناتك." />
        </div>

        <div className="grid gap-4 mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText className="w-6 h-6 text-purple-500" /> شروط الاستخدام</h3>
          <Card icon={<CheckCircle2 className="text-emerald-500" />} title="مسؤولية الحساب" desc="أنت مسؤول عن الحفاظ على سرية بيانات حسابك." />
          <Card icon={<CreditCard className="text-blue-500" />} title="الرسوم والاشتراكات" desc="جميع الرسوم واضحة ولا توجد تكاليف مخفية." />
        </div>

        <div className="grid gap-4">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><CookieIcon className="w-6 h-6 text-amber-500" /> ملفات تعريف الارتباط</h3>
          <Card icon={<ShieldCheck className="text-indigo-500" />} title="ملفات ضرورية" desc="مطلوبة لتشغيل الوظائف الأساسية للموقع." />
          <Card icon={<Settings className="text-purple-500" />} title="ملفات التفضيلات" desc="تسمح للموقع بتذكر خياراتك الشخصية." />
        </div>
      </div>
    </div>
  );
}

function ContactSection({ store }: { store: any }) {
  return (
    <section id="contact" className="py-20 bg-gray-50" dir="rtl">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">اتصل بنا</h2>
          <div className="w-20 h-1.5 mx-auto rounded-full" style={{ backgroundColor: store.design.primaryColor }} />
        </div>

        <div className="grid gap-6">
          <div className="flex items-center gap-5 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: store.design.secondaryColor }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">البريد الإلكتروني</p>
              <p className="text-lg font-bold text-gray-900">{store.contact.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-5 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: store.design.secondaryColor }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">الهاتف</p>
              <p className="text-lg font-bold text-gray-900">{store.contact.phone}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            {['Facebook', 'WhatsApp', 'TikTok'].map(social => (
              <button key={social} className="flex items-center justify-center gap-3 p-4 bg-white rounded-2xl border-2 border-gray-100 hover:shadow-md transition-all">
                <span className="font-bold text-gray-700">{social}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function ThemePreview() {
  const [activeSection, setActiveSection] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Bar */}
      {MOCK_STORE.topBar?.enabled && (
        <div className="py-2.5 px-4 text-center text-white text-sm font-medium" style={{ backgroundColor: MOCK_STORE.topBar.color }}>
          {MOCK_STORE.topBar.text}
        </div>
      )}

      <Navbar store={MOCK_STORE} />

      <main>
        {(activeSection === 'all' || activeSection === 'home') && (
          <>
            <Hero store={MOCK_STORE} />
            <Categories store={MOCK_STORE} />
            <ProductGrid store={MOCK_STORE} products={MOCK_PRODUCTS} />
          </>
        )}

        {(activeSection === 'all' || activeSection === 'details') && (
          <ProductDetails product={MOCK_PRODUCTS[0]} store={MOCK_STORE} />
        )}

        {(activeSection === 'all' || activeSection === 'static') && <StaticPages />}

        {(activeSection === 'all' || activeSection === 'contact') && <ContactSection store={MOCK_STORE} />}
      </main>

      <Footer store={MOCK_STORE} />

      {/* Floating badge */}
      <div className="fixed bottom-6 left-6 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg z-50">
        🎨 Theme Preview Mode
      </div>
    </div>
  );
}