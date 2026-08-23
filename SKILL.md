# MdStore Storefront Theme — Structural Reference

> This file is a **structural reference** for creating new MdStore themes. All CSS has been intentionally removed — the goal is to document the **structure, Props, components, and logic** that every new theme must follow. Design (colors, fonts, CSS) is entirely free as long as the structure and logic are preserved. Section 15 documents real bugs found in production themes — treat those as hard rules, not suggestions.

---

## 0. General Rules (Hard Rules)

- No Tailwind — raw CSS only (inline styles or a `<style>` tag with media queries).
- Direction: `dir="rtl"` for Arabic (`ar`), `dir="ltr"` for French (`fr`) and English (`en`). Never hardcode strings — always derive from `t = T[getLang(store)]` (see §3-A).
- Three supported languages: `ar` (default/RTL), `fr` (LTR), `en` (LTR). Every theme ships all three. The active language is `store.language`.
- Cart always imported from: `import { useCartStore } from '@/store/useCartStore';`
- Pass `domain` as a prop to `Navbar`.
- When adding to cart/order: `variantDetailId: getVarId()` must be sent in the payload.
- The `Cart` component must contain a wilaya/commune form linked to the shipping API.
- **Delivery price is never optional or implicit.** Every place that shows a price total (`ProductForm` order summary, `Cart` order summary) must compute `getLiv()` from the selected wilaya's `livraisonHome`/`livraisonOfice` and render it as its own labeled line, and every payload sent to `/orders/create` must include `priceLivraison: getLiv()` as a separate field from `totalPrice`. See §10 for the full contract — this has shipped missing before.
- Live search with debounce (~380ms) in `Navbar`.
- `Home` must support pagination.
- **Category filtering is server-side, always.** `Home` never filters `store.products` locally with `useState`/`onClick`. The page that renders `Home` re-fetches products from the server based on `?category=`, so the only valid UI is `<Link href={`?category=${cat.id}`}>` (see §8). Local-state filtering looks correct in dev and silently does nothing in production.
- **If nav links are hidden on mobile via CSS (`display:none` in a media query), a hamburger menu exposing the same links must ship in the same change.** Never hide navigation without an equivalent mobile entry point — there is no acceptable transitional state where mobile users lose access to Contact/static pages.
- Every theme must be **structurally and aesthetically distinct** from the others — not just a color swap. See §16 for concrete differentiation levers.
- **`Main` must reset scroll position on every route change.** Next.js App Router does not automatically scroll to top when navigating between pages inside a client-rendered theme shell. Add to `Main`:
  ```tsx
  import { usePathname } from 'next/navigation';
  // inside Main:
  const pathname = usePathname();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  ```
  Without this, navigating to a new page can leave the viewport scrolled down near the footer — the new page renders correctly but looks blank/empty until the user scrolls up manually. See §15.7.

---

## 1. Required Files and Exports

Every theme file (`Theme.tsx`) must export exactly these components:

```
export default function Main({ store, children, domain })
export function Navbar({ store, domain })
export function Footer({ store })
export function Card({ product, displayImage, discount, store, viewDetails })
export function Home({ store, page })
export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain })
export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform })
export function Cart({ domain, store })
export function Privacy()
export function Terms()
export function Cookies()
export function Contact({ store })
export function StaticPage({ staticPage, page, store })
```

---

## 2. Types (must be preserved as-is)

```ts
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
  productImage?: string; imagesProduct?: ProductImage[]; offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; };
}

interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>; platform?: string; priceLoss?: number;
}
```

---

## 3. Helpers / Fixed API

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

// Match the selected variant against variantDetails
function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
}

// Fetch wilayas (provinces): GET /shipping/public/get-shipping/{userId}
const fetchWilayas = async (uid: string): Promise<Wilaya[]> => { ... };

// Fetch communes: GET /shipping/get-communes/{wilayaId}
const fetchCommunes = async (wid: string): Promise<Commune[]> => { ... };

// Resolve selected wilaya — ALWAYS use String() on both sides.
// The API may return numeric IDs; select values are always strings.
// w.id === fd.customerWelaya fails silently (1 === "1" → false).
const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));

// getLiv — ALWAYS wrap in Number(). livraisonHome/livraisonOfice may be strings
// from the API. Without Number(), cartTotal + getLiv() becomes string concatenation:
// 49900 + "600" = "49900600". Always:
const getLiv = (): number => {
  if (!selW) return 0;
  return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
};
```

---

## 3-A. Multilingual T Pattern (Required — All Themes)

Every theme must support **Arabic, French, and English** from a single file. No separate `ar/`/`fr/`/`en/` copies. Language is resolved at runtime from `store.language`.

### Pattern

```tsx
type Lang = 'ar' | 'fr' | 'en';

const getLang = (store?: any): Lang => {
  if (store?.language === 'fr') return 'fr';
  if (store?.language === 'en') return 'en';
  return 'ar'; // default
};

const T = {
  ar: {
    dir: 'rtl' as const,
    // Navbar
    home: 'الرئيسية', contact: 'تواصل معنا', cart: 'السلة',
    search: 'ابحث عن منتج...', searching: 'جاري البحث...', noResults: 'لا توجد نتائج',
    showAll: 'عرض كل النتائج →',
    // Home
    all: 'الكل', noProducts: 'لا توجد منتجات متاحة حالياً', shopNow: 'تسوق الآن',
    // Trust bar
    trust: [
      { t: 'توصيل سريع',    s: 'لكل الولايات' },
      { t: 'جودة مضمونة',   s: 'منتجات أصلية 100%' },
      { t: 'دفع آمن',       s: 'حماية كاملة للبيانات' },
      { t: 'دعم 24/7',      s: 'فريق متخصص للمساعدة' },
    ],
    // Footer
    quickLinks: 'روابط سريعة', contactUs: 'تواصل معنا',
    privacy: 'الخصوصية', terms: 'الشروط', cookies: 'الكوكيز',
    rightsReserved: 'جميع الحقوق محفوظة',
    // Form
    fullName: 'الاسم الكامل', fullNamePlaceholder: 'أدخل اسمك الكامل',
    phone: 'رقم الهاتف', phonePlaceholder: '05xxxxxxxx',
    wilaya: 'الولاية', wilayaPlaceholder: 'اختر الولاية', wilayaUnavailable: 'التوصيل غير متاح حالياً',
    commune: 'البلدية', communePlaceholder: 'اختر البلدية', communeLoading: 'جاري التحميل...',
    deliveryHome: 'توصيل للمنزل', deliveryOffice: 'مكتب بريد',
    qty: 'الكمية', price: 'السعر', delivery: 'التوصيل', total: 'الإجمالي',
    orderNow: 'اطلب الآن', addToCart: 'أضف إلى السلة',
    confirmOrder: 'تأكيد الطلب', sending: 'جاري الإرسال...', cancel: 'إلغاء',
    successTitle: 'تم إرسال طلبك بنجاح!', successDesc: 'سنتواصل معك قريباً لتأكيد التفاصيل.',
    backToShop: 'العودة للتسوق',
    cartEmpty: 'السلة فارغة', cartEmptyDesc: 'لم تتم إضافة أي منتجات بعد.',
    myCart: 'سلتي', subtotal: 'المجموع الفرعي',
    errSubmit: 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مجدداً.',
    errName: 'الاسم الكامل مطلوب (3 أحرف على الأقل)',
    errPhone: 'رقم هاتف جزائري صحيح مطلوب (مثال: 0550123456)',
    errWilaya: 'اختر الولاية', errCommune: 'اختر البلدية',
    // Static pages
    privacyTitle: 'سياسة الخصوصية', termsTitle: 'الشروط والأحكام',
    cookiesTitle: 'سياسة الكوكيز', contactTitle: 'تواصل معنا',
    offersTitle: 'العروض المتاحة', descTitle: 'الوصف',
    searchResultsFor: 'نتائج البحث عن:',
  },
  fr: {
    dir: 'ltr' as const,
    home: 'Accueil', contact: 'Contact', cart: 'Panier',
    search: 'Rechercher...', searching: 'Recherche...', noResults: 'Aucun résultat',
    showAll: 'Voir tous les résultats →',
    all: 'Tout', noProducts: 'Aucun produit disponible pour le moment.', shopNow: 'Voir la boutique',
    trust: [
      { t: 'Livraison Rapide',   s: 'Partout en Algérie' },
      { t: 'Qualité Garantie',   s: 'Produits certifiés' },
      { t: 'Paiement Sécurisé',  s: 'Vos données protégées' },
      { t: 'Support 24/7',       s: 'Toujours disponible' },
    ],
    quickLinks: 'Navigation', contactUs: 'Contact',
    privacy: 'Confidentialité', terms: 'Conditions', cookies: 'Cookies',
    rightsReserved: 'Tous droits réservés.',
    fullName: 'Nom complet', fullNamePlaceholder: 'Votre nom complet',
    phone: 'Téléphone', phonePlaceholder: '0555 12 34 56',
    wilaya: 'Wilaya', wilayaPlaceholder: 'Choisir la wilaya', wilayaUnavailable: 'Livraison indisponible',
    commune: 'Commune', communePlaceholder: 'Choisir la commune', communeLoading: 'Chargement...',
    deliveryHome: 'À domicile', deliveryOffice: 'Point relais',
    qty: 'Quantité', price: 'Prix', delivery: 'Livraison', total: 'Total',
    orderNow: 'Commander', addToCart: 'Ajouter au panier',
    confirmOrder: 'Confirmer la commande', sending: 'Envoi en cours...', cancel: 'Annuler',
    successTitle: 'Commande confirmée !', successDesc: 'Notre équipe vous contactera bientôt.',
    backToShop: 'Retour à la boutique',
    cartEmpty: 'Votre panier est vide', cartEmptyDesc: 'Découvrez notre sélection.',
    myCart: 'Mon Panier', subtotal: 'Sous-total',
    errSubmit: 'Une erreur est survenue. Veuillez réessayer.',
    errName: 'Nom complet requis (3 caractères minimum)',
    errPhone: 'Numéro de téléphone algérien valide requis (ex: 0550123456)',
    errWilaya: 'Veuillez choisir une wilaya', errCommune: 'Veuillez choisir une commune',
    privacyTitle: 'Politique de confidentialité', termsTitle: 'Conditions générales',
    cookiesTitle: 'Politique des cookies', contactTitle: 'Nous contacter',
    offersTitle: 'Offres groupées', descTitle: 'Description',
    searchResultsFor: 'Résultats pour :',
  },
  en: {
    dir: 'ltr' as const,
    home: 'Home', contact: 'Contact', cart: 'Cart',
    search: 'Search products...', searching: 'Searching...', noResults: 'No results found',
    showAll: 'Show all results →',
    all: 'All', noProducts: 'No products available at the moment.', shopNow: 'Shop Now',
    trust: [
      { t: 'Fast Delivery',        s: 'Across all wilayas' },
      { t: 'Quality Guaranteed',   s: '100% authentic products' },
      { t: 'Secure Payment',       s: 'Full data protection' },
      { t: '24/7 Support',         s: 'Expert team always here' },
    ],
    quickLinks: 'Quick Links', contactUs: 'Contact Us',
    privacy: 'Privacy', terms: 'Terms', cookies: 'Cookies',
    rightsReserved: 'All rights reserved.',
    fullName: 'Full Name', fullNamePlaceholder: 'Enter your full name',
    phone: 'Phone Number', phonePlaceholder: '0555 12 34 56',
    wilaya: 'Wilaya', wilayaPlaceholder: 'Select wilaya', wilayaUnavailable: 'Delivery unavailable',
    commune: 'Commune', communePlaceholder: 'Select commune', communeLoading: 'Loading...',
    deliveryHome: 'Home Delivery', deliveryOffice: 'Pickup Point',
    qty: 'Quantity', price: 'Price', delivery: 'Delivery', total: 'Total',
    orderNow: 'Order Now', addToCart: 'Add to Cart',
    confirmOrder: 'Confirm Order', sending: 'Sending...', cancel: 'Cancel',
    successTitle: 'Order placed successfully!', successDesc: 'We will contact you shortly to confirm the details.',
    backToShop: 'Back to Shop',
    cartEmpty: 'Your cart is empty', cartEmptyDesc: 'Start shopping now.',
    myCart: 'My Cart', subtotal: 'Subtotal',
    errSubmit: 'An error occurred. Please try again.',
    errName: 'Full name is required (at least 3 characters)',
    errPhone: 'Valid Algerian phone number required (e.g. 0550123456)',
    errWilaya: 'Please select a wilaya', errCommune: 'Please select a commune',
    privacyTitle: 'Privacy Policy', termsTitle: 'Terms & Conditions',
    cookiesTitle: 'Cookie Policy', contactTitle: 'Contact Us',
    offersTitle: 'Available Offers', descTitle: 'Description',
    searchResultsFor: 'Results for:',
  },
} as const;

type TKeys = typeof T['ar'];
```

### Usage in every component

```tsx
// In Main — wrap everything with dir
export default function Main({ store, children, domain }: any) {
  const t = T[getLang(store)];
  const pathname = usePathname();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div dir={t.dir}>
      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

// In Navbar / Footer / Home / Details / ProductForm / Cart / StaticPage
const t = T[getLang(store)];
// Then use: t.home, t.search, t.orderNow, t.delivery, t.dir ...
```

### Rules
- **Never hardcode a user-visible string** — every label, placeholder, error, button, and link text must come from `T[lang]`.
- `getLang` defaults to `'ar'` — so a store with no `language` field gets Arabic.
- `dir` comes from `t.dir`, not from a separate derivation. Never write `language === 'ar' ? 'rtl' : 'ltr'` when `t.dir` is already available.
- The `trust` array is indexed positionally (`t.trust[0]`, `t.trust[1]`, ...) — always 4 items, same order in all three languages.
- Adding a new key to `T.ar` requires adding the same key to `T.fr` and `T.en` — TypeScript will enforce this if you type `const T: Record<Lang, TKeys>`.

---

## 4. Main (the Wrapper)

- Wraps the page with `Navbar` + `<main>{children}</main>` + `Footer`.
- props: `{ store, children, domain }`.
- **Must reset scroll on every route change** — without this, navigating to a new page keeps the previous scroll offset (user sees the footer region instead of the top of the page):
  ```tsx
  import { usePathname } from 'next/navigation';

  export default function Main({ store, children, domain }: any) {
    const pathname = usePathname();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return (
      <div>
        <Navbar store={store} domain={domain} />
        <main>{children}</main>
        <Footer store={store} />
      </div>
    );
  }
  ```

---

## 5. Navbar — Required Logic

> **All text strings come from `T[getLang(store)]` (§3-A)** — never hardcode Arabic, French, or English labels directly in JSX. Use `t.home`, `t.search`, `t.cart`, `t.contact`, etc.

**State:**
- `scrolled` — tracks `window.scrollY` to change the navbar's appearance on scroll.
- `open` — mobile menu (hamburger menu).
- `showSearch` — shows the search field on mobile.
- `searchQuery`, `listSearch`, `loading` — live search logic.
- `imgError` — fallback if the store logo fails to load.

**Cart:**
```ts
const count = useCartStore((s) => s.count);
const initCount = useCartStore((s) => s.initCount);
```
On mount: read `localStorage.getItem(domain)` and pass its length to `initCount`.

**Live search — Logic (shared between desktop and mobile):**
- When `searchQuery.length >= 2` → after a ~380ms debounce → `GET /products/public/{domain}?search=...`
- Results list includes a "View all results" link pointing to `/?search=...`.
- Submitting the form (Enter / search button) redirects to `/?search=...`.

**Live search — UX: Desktop vs Mobile (DIFFERENT patterns, not the same widget):**

الـ search widget يجب أن يكون **مختلفاً هيكلياً** بين الـ desktop والـ mobile — وليس نفس الـ dropdown بحجم مختلف.

**Desktop (≥ 768px) — Inline bar + dropdown:**
```tsx
{/* Search bar دائماً ظاهر في الـ navbar — يتمدد عند التركيز */}
<div style={{ position:'relative' }}>
  <input
    value={searchQuery}
    onChange={e => setSearchQuery(e.target.value)}
    placeholder="ابحث عن منتج..."
    style={{ width: searchFocused ? 260 : 180, transition:'width 0.3s ease' }}
    onFocus={() => setSearchFocused(true)}
    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
  />
  {/* Dropdown — position:absolute تحت الـ input مباشرة */}
  {listSearch.length > 0 && searchFocused && (
    <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0,
      background:'#fff', boxShadow:'0 8px 24px rgba(0,0,0,0.12)',
      borderRadius:8, zIndex:500, maxHeight:360, overflowY:'auto' }}>
      {listSearch.map(p => <SearchResultRow key={p.id} product={p} />)}
      <Link href={`/?search=${searchQuery}`} style={{ display:'block', padding:'10px 16px',
        borderTop:'1px solid #eee', fontSize:'0.8rem', textAlign:'center' }}>
        عرض كل النتائج
      </Link>
    </div>
  )}
</div>
```

**Mobile (< 768px) — أيقونة بحث → Full-screen overlay:**
```tsx
{/* أيقونة بحث في الـ navbar — تفتح overlay كامل الشاشة */}
<button onClick={() => setShowSearch(true)} aria-label="بحث">
  <Search size={22} />
</button>

{showSearch && (
  <div style={{ position:'fixed', inset:0, zIndex:600,
    background: 'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)',
    display:'flex', flexDirection:'column' }}
    onClick={e => { if (e.target === e.currentTarget) setShowSearch(false); }}>

    {/* Search header */}
    <div style={{ background:'#fff', padding:'12px 16px',
      display:'flex', alignItems:'center', gap:10 }}>
      <Search size={20} color="#888" />
      <input
        autoFocus
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="ابحث عن منتج..."
        style={{ flex:1, border:'none', outline:'none', fontSize:'1rem' }}
      />
      <button onClick={() => { setShowSearch(false); setSearchQuery(''); setListSearch([]); }}>
        <X size={22} />
      </button>
    </div>

    {/* Results — يملؤون باقي الشاشة */}
    <div style={{ flex:1, overflowY:'auto', background:'#fff', marginTop:1 }}>
      {loading && <p style={{ padding:'1rem', textAlign:'center', color:'#888' }}>جاري البحث...</p>}
      {listSearch.map(p => (
        <Link key={p.id} href={`/product/${p.slug||p.id}`}
          onClick={() => setShowSearch(false)}
          style={{ display:'flex', gap:12, padding:'12px 16px',
            borderBottom:'1px solid #f0f0f0', alignItems:'center' }}>
          <img src={p.productImage||p.imagesProduct?.[0]?.imageUrl} alt={p.name}
            style={{ width:52, height:52, objectFit:'cover', borderRadius:6, flexShrink:0 }} />
          <div>
            <p style={{ fontSize:'0.9rem', fontWeight:600, margin:0 }}>{p.name}</p>
            <p style={{ fontSize:'0.8rem', color:A, margin:0, fontWeight:700 }}>
              {Number(p.price).toLocaleString()} {store.currency}
            </p>
          </div>
        </Link>
      ))}
      {listSearch.length > 0 && (
        <Link href={`/?search=${searchQuery}`} onClick={() => setShowSearch(false)}
          style={{ display:'block', padding:'14px', textAlign:'center',
            background:'#f9f9f9', fontWeight:600, color:A }}>
          عرض كل نتائج "{searchQuery}"
        </Link>
      )}
      {searchQuery.length >= 2 && !loading && listSearch.length === 0 && (
        <p style={{ padding:'2rem', textAlign:'center', color:'#aaa' }}>
          لا توجد نتائج لـ "{searchQuery}"
        </p>
      )}
    </div>
  </div>
)}
```

**State إضافي مطلوب للنمط الجديد:**
```ts
const [showSearch, setShowSearch]     = useState(false);  // mobile overlay
const [searchFocused, setSearchFocused] = useState(false); // desktop dropdown visibility
```

**قواعد صارمة:**
- Mobile: **لا dropdown** — الـ dropdown يخرج عن حدود الشاشة أو يُغطى بعناصر أخرى على الـ mobile. الـ overlay الكامل فقط.
- Desktop: **لا overlay** — مبالغة في UX لشاشة كبيرة. الـ inline bar + dropdown يكفي.
- الـ overlay المحمول يُغلق بثلاث طرق: زر X، النقر خارج نافذة النتائج، النقر على أي نتيجة.

**Required elements:**
- Store logo (`store.design.logoUrl`) with a text fallback (store name).
- Links: Home `/`, Contact `/contact`.
- Cart icon with a count badge — shown only if `store?.cart !== false`.
- Optional top ticker/bar if `store?.topBar?.enabled && store?.topBar?.text`.
- Separate Desktop and Mobile versions with the same functionality, built like this — never collapse the nav links into a single inline-styled `<div>` that gets crowded at small widths:
  ```css
  .nav-links  { display:flex; align-items:center; gap:24px; }
  .nav-burger { display:none; }
  @media (max-width:700px) {
    .nav-links { display:none; }
    .nav-burger { display:flex; }
  }
  ```
  The `.nav-burger` button toggles a full mobile dropdown/overlay. It must contain **only page links** (Home, Contact, and any static pages) — **never the cart link**. The cart is already reachable via the cart icon in the navbar; adding it again to the dropdown duplicates it and confuses users. Declare the mobile links without cart:
  ```ts
  // Correct — no cart link in mobile dropdown
  const mobileLinks = [
    { h: '/', l: 'الرئيسية' },
    { h: '/contact', l: 'تواصل معنا' },
  ];
  ```
  The footer (§6) separately lists cart with `store?.cart !== false` filtering — that pattern is for the footer only, not the mobile nav dropdown.

### 5-A. Navbar Layout Archetypes — PICK ONE, NOT THE DEFAULT

> **قاعدة صارمة:** نمط "شعار يسار + روابط وسط + سلة يمين" هو النمط الافتراضي الذي يستخدمه كل ثيم تلقائياً — محظور استخدامه في ثيمات جديدة ما لم يكن النمط الوحيد المنطقي للتصميم. الـ Navbar يجب أن يُعرّف هويته البصرية بشكل مستقل، لا فقط بالألوان.

اختر نمطاً هيكلياً مختلفاً من القائمة التالية، وأعلنه في تعليق في أعلى `Navbar`:

```tsx
// NAVBAR ARCHETYPE: [اسم النمط]
```

**الأنماط المتاحة:**

| # | الاسم | الهيكل | مناسب لـ |
|---|-------|---------|----------|
| A | **Centered Logo** | روابط يسار ← شعار وسط ← سلة+بحث يمين | أزياء، عطور، ديكور |
| B | **Double Bar** | شريط علوي: شعار+شعار ثانوي / شريط سفلي: روابط+بحث | إلكترونيات، متاجر كبيرة |
| C | **Floating Pill** | نافبار ضيق مركزي float فوق المحتوى بـ `backdrop-filter:blur` | تقنية، luxury |
| D | **Full-width Logo Strip** | شعار كبير يملأ عرض الشريط + روابط على شريط ثانٍ أسفله | كلاسيك، كتب، أثاث |
| E | **Icon-heavy Minimal** | شعار صغير يسار، روابط أيقونات فقط (بدون نص) يمين | رياضة، gaming |
| F | **Sidebar Nav (desktop)** | navbar عمودي ثابت يسار أو يمين، المحتوى يأخذ الباقي | محلات ملابس، portfolio |
| G | **Classic** *(محظور افتراضياً)* | شعار يسار + روابط وسط + سلة يمين | لا تستخدم إلا بمبرر |

**قواعد الاختيار:**
- ثيمان في نفس الفئة (مثلاً gaming + gaming) لا يمكن أن يشتركا في نفس النمط.
- النمط يؤثر على الـ mobile أيضاً: **A/C** → hamburger مركزي؛ **B** → hamburger يفتح الشريط الثاني؛ **E** → hamburger يكشف أيقونات أكبر؛ **F** → bottom-tab على mobile بدلاً من hamburger.

**مثال — نمط B (Double Bar):**
```tsx
// NAVBAR ARCHETYPE: B — Double Bar
// شريط علوي: شعار + tagline + اتصال
// شريط سفلي: روابط رئيسية + بحث + سلة (sticky)
<header>
  <div className="nb-top">
    <Logo /><span className="nb-tagline">{store.hero?.subtitle}</span>
    <a href={`tel:${store.contact?.phone}`}><Phone size={14}/> {store.contact?.phone}</a>
  </div>
  <nav className="nb-main" style={{ position:'sticky', top:0, zIndex:200 }}>
    <Links /><SearchBar /><CartIcon />
  </nav>
</header>
```

**مثال — نمط C (Floating Pill):**
```css
.navbar-pill {
  position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
  width: min(92%, 860px);
  background: rgba(10,10,20,0.6); backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 999px; padding: 0 24px;
  display: flex; align-items: center; justify-content: space-between;
  z-index: 200;
}
```

---

## 6. Footer — Required Logic

> All text from `t = T[getLang(store)]`: `t.quickLinks`, `t.contactUs`, `t.privacy`, `t.terms`, `t.cookies`, `t.rightsReserved`.

3 sections:
1. **Brand**: store name + short description (`store.hero.subtitle`) + copyright year.
2. **Page links**: Home, Cart (only if `store?.cart !== false`), Contact, Privacy, Terms. Use the same `.filter(lnk => lnk.h !== '/cart' || store?.cart !== false)` pattern as the mobile nav (§5) — don't re-derive the condition differently in two places.
3. **Contact**: phone (`store.contact.phone`), email (`store.contact.email`), address (`store.contact.wilaya` + `store.contact.address`). All three are optional — render each line only if its value is truthy, ordered Phone → Mail → MapPin.

---

## 7. Card — Product Card

Props: `{ product, displayImage, discount, store, viewDetails }`

- Product image (or a placeholder icon if unavailable).
- Discount badge if `discount > 0`.
- Product name (2-line clamp).
- Rating stars (visually static).
- Current price + store currency (`store.currency`) + original price struck through if higher.
- Link to the details page: `/product/${product.slug || product.id}`.

### 7-A. Card Layout Archetypes — PICK ONE, NOT THE DEFAULT

> **قاعدة صارمة:** نمط "صورة فوق + اسم + سعر أسفل" هو النمط الافتراضي الذي يُنتج بشكل تلقائي — يجعل كل الثيمات تبدو متشابهة. يجب اختيار نمط مختلف وتطبيقه بشكل مقصود. أعلن النمط في تعليق فوق Card:

```tsx
// CARD ARCHETYPE: [اسم النمط]
```

| # | الاسم | الوصف | مثال |
|---|-------|-------|------|
| 1 | **Standard Stack** *(محظور افتراضياً)* | صورة فوق + اسم + سعر | لا تستخدم إلا بمبرر |
| 2 | **Overlay Reveal** | الصورة تملأ الكارد كاملاً، النص والسعر يظهران من الأسفل عند hover (gradient scrim ثابت) | أزياء، طعام |
| 3 | **Horizontal Split** | صورة ~40% يمين/يسار، نص في الباقي (جيد للـ mobile) | إلكترونيات، كتب |
| 4 | **Editorial Borderless** | بدون radius أو border، صورة full-bleed، نص أسفل بمسافة generosity | luxury، عطور، تصميم |
| 5 | **Framed Label** | border واضح، eyebrow label (الفئة) فوق الاسم، سعر + badge جنباً لجنب | رياضة، outdoor، تقنية |
| 6 | **Badge-heavy** | صورة مربعة صغيرة مركزية، badge خصم كبير، سعر بارز، اسم صغير | عروض، تسوق عام |

**شروط استخدام كل نمط:**

**نمط 2 — Overlay Reveal:**
```css
.card-2 { position:relative; overflow:hidden; aspect-ratio:3/4; }
.card-2-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
  transition: transform 0.5s ease; }
.card-2:hover .card-2-img { transform: scale(1.07); }
.card-2-body {
  position:absolute; bottom:0; left:0; right:0;
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%);
  padding: 1.5rem 1rem 1rem;
  transform: translateY(30%); transition: transform 0.35s ease;
}
.card-2:hover .card-2-body { transform: translateY(0); }
/* نص دائماً أبيض على كل ألوان الثيم */
.card-2-name { color:#fff; font-weight:700; }
.card-2-price { color:#fff; opacity:0.9; }
```

**نمط 3 — Horizontal Split:**
```tsx
// CARD ARCHETYPE: 3 — Horizontal Split
<div style={{ display:'flex', gap:0, borderRadius:8, overflow:'hidden', border:`1px solid ${BD}` }}>
  <div style={{ width:'42%', flexShrink:0, aspectRatio:'1/1', overflow:'hidden' }}>
    <img src={img} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
  </div>
  <div style={{ flex:1, padding:'0.875rem', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
    <p style={{ fontWeight:700, fontSize:'0.9rem' }}>{product.name}</p>
    <div>
      <span style={{ fontWeight:800, color:A }}>{price}</span>
      <Link href={`/product/${product.slug||product.id}`} style={{ display:'block', marginTop:8,
        background:A, color:'#fff', textAlign:'center', padding:'6px 0', borderRadius:4, fontSize:'0.8rem' }}>
        عرض
      </Link>
    </div>
  </div>
</div>
```

**نمط 4 — Editorial Borderless:**
```css
.card-4 { background:none; border:none; border-radius:0; }
.card-4-img-wrap { width:100%; aspect-ratio:4/5; overflow:hidden; margin-bottom:0.75rem; }
.card-4-img { width:100%; height:100%; object-fit:cover; transition:transform 0.6s ease; }
.card-4:hover .card-4-img { transform:scale(1.04); }
.card-4-name { font-size:0.8rem; letter-spacing:0.08em; text-transform:uppercase;
  color: TXT; margin-bottom:0.25rem; }
.card-4-price { font-size:1.1rem; font-weight:800; color:A; }
/* NO border, NO shadow, NO border-radius — ever */
```

**نمط 5 — Framed Label:**
```tsx
// CARD ARCHETYPE: 5 — Framed Label
<div style={{ border:`2px solid ${BD}`, borderRadius:6, overflow:'hidden' }}>
  {/* eyebrow */}
  <div style={{ background:BD, padding:'2px 10px', fontSize:'0.65rem',
    fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:TXT }}>
    {product.store?.name || 'منتج'}
  </div>
  <div style={{ aspectRatio:'1/1', overflow:'hidden' }}>
    <img src={img} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
  </div>
  <div style={{ padding:'0.75rem' }}>
    <p style={{ fontSize:'0.85rem', fontWeight:600 }}>{product.name}</p>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8 }}>
      <span style={{ fontWeight:800, color:A, fontSize:'1rem' }}>{price}</span>
      {discount > 0 && <span style={{ background:A, color:'#fff', fontSize:'0.65rem',
        padding:'2px 6px', fontWeight:700 }}>-{discount}%</span>}
    </div>
  </div>
</div>
```

**Image handling — always use this pattern, never `/placeholder.png`:**
```tsx
// In Home, when passing displayImage to Card:
displayImage={p.productImage || p.imagesProduct?.[0]?.imageUrl}

// Inside Card component — always guard with imgErr state:
const [imgErr, setImgErr] = useState(false);
const img = displayImage || product.productImage || product.imagesProduct?.[0]?.imageUrl;

{img && !imgErr ? (
  <img src={img} alt={product.name} onError={() => setImgErr(true)}
    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
) : (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <PlaceholderIcon size={40} color={BD} />
  </div>
)}
```
**Never** pass `"/placeholder.png"` as a fallback — that path doesn't exist on the server and results in a broken image with no visible fallback. Always check `imagesProduct?.[0]?.imageUrl` as a secondary source before giving up and showing the icon.

---

## 8. Home — Home Page

Props: `{ store, page }`

**Mandatory sections:**
1. **Hero** — title (`store.hero.title`, supports HTML via `DOMPurify.sanitize`), subtitle (`store.hero.subtitle`), optional background image (`store.hero.imageUrl`), CTA buttons (Shop Now + Cart if enabled). Hero background images must use `position:absolute` via **inline styles only** (no CSS classes) — this keeps the layering predictable regardless of what utility classes a theme defines elsewhere.
2. **Trust bar** — a row of 4 trust elements (shipping, quality, secure payment, support).
3. **Categories** — a grid/row of categories from `store.categories`, with an "All" entry. This is the part most themes get wrong — the only correct implementation is URL navigation, because `store.products` is already filtered server-side by the time `Home` receives it:
   ```tsx
   const searchParams = useSearchParams();
   const activeCategory = searchParams.get('category');

   <Link href="/" className={!activeCategory ? 'active' : ''}>All</Link>
   {cats.map(cat => (
     <Link key={cat.id} href={`?category=${cat.id}`}
       className={activeCategory === String(cat.id) ? 'active' : ''}>
       {cat.name}
     </Link>
   ))}
   ```
   Do **not** introduce `const [activeCat, setActiveCat] = useState(...)` + `onClick` + a local `.filter()`/`useMemo` over `products` — it compiles, looks right, and never actually filters anything because the server already returned the unfiltered (or differently-filtered) list before the click happened.
4. **Products grid** — displays `store.products` directly (already server-filtered/paginated), discount calculation: `Math.round(((priceOriginal - price) / priceOriginal) * 100)`.
5. **Pagination** — `countPage = Math.ceil((store.count || products.length) / 48)`, page buttons use `Link href={{ query: { page } }} scroll={false}`.

---

## 9. Details — Product Details Page

Props: `{ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }`

**Contains:**
- Image gallery: main image + navigation buttons (left/right) + clickable thumbnails, local state `sel` for the current image index.
- Product name + rating stars.
- Final price box (`finalPrice`).
- Offers list (`product.offers`) — radio selection, updates `selectedOffer`.
- Attributes (`allAttrs`) — supports 3 display modes: `color` (color circle), `image` (thumbnail), `text` (text button) — calls `handleVariantSelection(attr.name, v.value)` on selection.
- Embeds `<ProductForm />` with the same passed props.
- Product description (`product.desc`) via `dangerouslySetInnerHTML` with `DOMPurify.sanitize`.

---

## 10. ProductForm — Order/Add-to-Cart Form

> All labels from `t = T[getLang(store ?? product?.store)]`: `t.fullName`, `t.phone`, `t.wilaya`, `t.commune`, `t.deliveryHome`, `t.deliveryOffice`, `t.qty`, `t.price`, `t.delivery`, `t.total`, `t.orderNow`, `t.addToCart`, `t.confirmOrder`, `t.sending`, `t.cancel`, `t.errName`, `t.errPhone`, `t.errWilaya`, `t.errCommune`, `t.errSubmit`.

**Core state:**
```ts
const [fd, setFd] = useState({
  customerId: '', customerName: '', customerPhone: '',
  customerWelaya: '', customerCommune: '',
  quantity: 1, priceLoss: 0,
  typeLivraison: 'home' as 'home' | 'office'
});
```

**Price calculation logic:**
```ts
const getFP = (): number => {
  // 1) If an offer is selected → offer price
  // 2) If a matching variant exists (variantMatches) and its price !== -1 → variant price
  // 3) Otherwise → base product price
};
const getLiv = (): number => {
  // Shipping cost based on selected wilaya and delivery type (home/office)
};
const total = () => fp * fd.quantity + getLiv();
```

**Delivery price (`getLiv`) — exact contract, not optional:**

This is the one piece of logic that has gone missing from generated themes before, so it is spelled out fully here. The shipping cost is **per-wilaya, per-delivery-type** — it is never a flat number and never something the theme invents.

1. `fetchWilayas(userId)` (§3) returns the store's configured `Wilaya[]`, each with `livraisonHome` (price for home delivery) and `livraisonOfice` (price for office/pickup delivery) already set per wilaya by the merchant. Load this list once (e.g. on mount) and store it in state.
2. When the customer picks a wilaya in the form (`fd.customerWelaya`), resolve the matching `Wilaya` object. **Always use `String()` on both sides** — wilaya IDs from the API are often numbers while `select` values are always strings:
   ```ts
   // WRONG — 1 === "1" is false, selW is always undefined
   const selW = wilayas.find(w => w.id === fd.customerWelaya);

   // CORRECT
   const selW = wilayas.find(w => String(w.id) === String(fd.customerWelaya));
   ```
3. `getLiv()` reads the price off `selW` based on `fd.typeLivraison`. **Always wrap in `Number()`** — `livraisonHome`/`livraisonOfice` may arrive as strings from the API. Without it, `cartTotal + getLiv()` becomes string concatenation: `49900 + "600" = "49900600"`:
   ```ts
   const getLiv = useCallback((): number => {
     if (!selW) return 0;
     return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
   }, [selW, fd.typeLivraison]);
   ```
4. **It must be visibly displayed**, not just folded silently into the grand total. Every order summary (in `ProductForm` *and* `Cart`, §11) needs its own labeled line for it, with an explicit "not yet known" state before a wilaya is picked — never show `0 دج` as if delivery were free when it's actually just unselected:
   ```tsx
   {[
     { l: 'السعر',   v: `${fp.toLocaleString()} دج` },
     { l: 'الكمية',  v: `× ${fd.quantity}` },
     { l: 'التوصيل', v: selW ? `${getLiv().toLocaleString()} دج` : '—' },
   ].map(row => <SummaryRow key={row.l} {...row} />)}
   ```
5. Both the cart-add payload and the order-create payload must send the delivery price as its own field, `priceLivraison: getLiv()`, **separately** from `totalPrice` — the backend needs to know how much of the total was shipping vs. product price, it does not recompute it server-side from the wilaya id:
   ```ts
   { ...fd, product, totalPrice: total(), priceLivraison: getLiv(), ... }
   ```
6. Switching `fd.typeLivraison` between `'home'` and `'office'` must immediately recompute the displayed delivery line and the grand total — this is why `getLiv`/`total` should be plain functions or `useCallback`s reading current state, not values memoized once on wilaya selection.

**Validation:**
- `customerName` required.
- `customerPhone` regex: `/^(0|\+213)[5-7]\d{8}$/`
- `customerWelaya`, `customerCommune` required.

**Two main buttons:**
1. **Add to Cart** (`addToCart`) — only if `store?.cart !== false` (never `=== true` — see §15.27):
   - Reads `localStorage.getItem(domain)`, adds a new item containing: all form data + `product` + `variantDetailId: getVarId()` + `productId` + `storeId` + `userId` + `selectedOffer` + `selectedVariants` + `platform` + `finalPrice` + `totalPrice` + `priceLivraison` + `addedAt`.
   - Updates `localStorage` and `initCount`.
2. **Order Now** (`isOrderNow` → opens the full form):
   - On submit: `POST /orders/create` with the same data above.
   - On success: saves `customerId` to localStorage, then `router.push('/successfully?productId=...')`.
   - **`addToCart` must never call `validate()`** — shipping fields (name, phone, wilaya, commune) haven't been filled yet when the user clicks "Add to Cart". Calling `validate()` blocks the add silently. Validation belongs only in `submitOrder`:
     ```ts
     // WRONG — silently blocks add to cart
     const addToCart = () => {
       if (!validate()) return;  // ← remove this line
       ...
     };

     // CORRECT
     const addToCart = () => {
       // no validation — add immediately
       const arr = JSON.parse(localStorage.getItem(domain) || '[]');
       arr.push({ ...payload });
       localStorage.setItem(domain, JSON.stringify(arr));
       initCount(arr.length);
     };
     ```
   - **Must include a Cancel button** alongside the submit button. Without it the user has no way to close the form once opened:
     ```tsx
     {isOrderNow && (
       <>
         <button onClick={submitOrder} disabled={submitting}>
           {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
         </button>
         <button onClick={() => setIsOrderNow(false)} disabled={submitting}>
           إلغاء
         </button>
       </>
     )}
     ```
     The cancel button must be `disabled={submitting}` to prevent accidental dismissal while the order is being sent.

**Form fields:** name, phone, wilaya (select), commune (select dependent on wilaya), delivery type (home/office toggle), quantity (+/-), order summary (product name, shipping cost, grand total).

---

## 11. Cart — Full Cart Page

> All labels from `t = T[getLang(store)]`: `t.myCart`, `t.cartEmpty`, `t.cartEmptyDesc`, `t.backToShop`, `t.subtotal`, `t.delivery`, `t.total`, `t.confirmOrder`, `t.sending`, `t.successTitle`, `t.successDesc` — same keys as ProductForm (§10).

Props: `{ domain, store }`

- Reads all cart items from `localStorage.getItem(domain)`.
- Calculates: `cartTotal = sum(finalPrice * quantity)`, `finalTotal = cartTotal + getLiv()`.
- Same shipping form (name, phone, wilaya, commune, delivery type) — and the **same delivery-price contract as §10**: `getLiv()` is computed once from the wilaya/delivery-type selected in this form (cart delivery is a single shared shipment, not per-item), shown as its own labeled summary line (`'—'` until a wilaya is picked), and recomputed live whenever the wilaya or `typeLivraison` changes.
- On submit: `POST /orders/create` with an **array** of items (one order per product in the cart, with the same customer data) — each item still carries `priceLivraison: getLiv()` so the backend has it per order line, even though the displayed shipping line in the UI is shown once for the whole cart.
- On success: clears `localStorage`, `initCount(0)`, shows a success screen.
- Empty cart state: message + "Shop Now" link.
- Ability to delete an individual item from the cart (`Trash2` icon).
- **Order summary rows** — always add `whiteSpace: 'nowrap'` and `flexShrink: 0` to price value spans. Without it, formatted numbers like "49 900 DA" (French locale) wrap mid-number and visually break the layout:
  ```tsx
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
    <span style={{ flexShrink: 0 }}>Livraison</span>
    <span style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{selW ? fmtPrice(getLiv()) : '—'}</span>
  </div>
  ```
- **Cart item image** — always check both fields, not just `productImage`:
  ```tsx
  const img = it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl;
  {img ? <img src={img} ... /> : <PlaceholderIcon />}
  ```
  `productImage` is a convenience field that may be empty; the canonical source is `imagesProduct[0].imageUrl`.
- If `store?.cart === false`, the entire cart route is unreachable from the UI — every cart link (navbar, mobile menu, footer, hero CTA) must already be filtered out per §5/§6 rather than left dangling.

---

## 12. Static Pages

> All page titles and section labels from `t = T[getLang(store)]`: `t.privacyTitle`, `t.termsTitle`, `t.cookiesTitle`, `t.contactTitle`.

### `Privacy({ store })`, `Terms({ store })`, `Cookies({ store })`
- Accept `store` prop (for language detection).
- Same structure: `Shell` (dark header with `t.privacyTitle` / `t.termsTitle` / `t.cookiesTitle`) containing `InfoBlock { title, body }` blocks with translated content.

### `Contact({ store })`
- State: `{ name, email, phone, message }`.
- Two columns: contact info (phone, location) + message form.
- Submit: `POST /user/contact-user/message` with `{ ...form, storeId: store.id }`.
- Success screen after submission + "Send another message" button.
- All form labels and button text from `t`.

### `StaticPage({ staticPage, page, store })`
A simple router:
```ts
const p = (staticPage || page || '').toLowerCase();
// 'privacy' → <Privacy store={store}/>
// 'terms'   → <Terms store={store}/>
// 'cookies' → <Cookies store={store}/>
// 'contact' → <Contact store={store}/>
```

---

## 13. API Endpoints Used

| Action | Method | Endpoint |
|---|---|---|
| Fetch wilayas | GET | `/shipping/public/get-shipping/{userId}` |
| Fetch communes | GET | `/shipping/get-communes/{wilayaId}` |
| Search products | GET | `/products/public/{domain}?search=...` |
| Create order | POST | `/orders/create` |
| Send contact message | POST | `/user/contact-user/message` |

---

## 14. Theme Resolution Fallback (informational, not theme-authoring)

The app fetches a theme bundle from `/api/themes/{slug}` — **no language prefix**. A single bundle file serves all three languages; language selection happens at runtime from `store.language` via `getLang(store)` inside the theme itself.

If the requested `slug` 404s on R2 storage, the API transparently serves `themes/default.js` instead of failing the page. This means a missing/unbundled theme degrades to `default`, not a blank page — but it also means a typo in a store's `theme.slug` will silently render the wrong (default) theme rather than erroring loudly. Always verify the slug after creating a new theme by checking the network response, not just "the page rendered something."

**Bundle command:** `node scripts/bundle-themes.mjs --slug=<name>` — compiles `src/theme/<name>.tsx` and uploads to R2 as `themes/<name>.js`.

---

## 15. Common Pitfalls (Do Not Repeat)

These are bugs that shipped to production themes and had to be patched after the fact. Each one is now a hard rule elsewhere in this doc — this section exists so the *failure mode* is recognizable, not just the rule.

1. **Cart UI left visible on no-cart stores.** A theme rendered the navbar cart icon and the `/cart` mobile-menu/footer link unconditionally, even when `store.cart === false`. Fix: every cart entry point must be wrapped in `store?.cart !== false &&`, in all four places it can appear (navbar icon, mobile dropdown, footer links, hero CTA).
2. **Mobile nav links hidden with no replacement.** A theme hid `.nav-links` at `max-width:700px` to stop the navbar from wrapping/stacking, without adding a hamburger fallback in the same pass — mobile users lost the only way to reach `/contact`. Fix: hamburger + dropdown shipped together, never sequentially (§0, §5).
3. **Category clicks that do nothing.** Multiple themes filtered `store.products` client-side with `useState`/`onClick`, which can't work because `Home` already receives server-filtered data based on `searchParams.category`. Fix: category UI is always `<Link href="?category=...">`, never local state (§8).
4. **Search dropdown overflowing off-screen on mobile.** A dropdown with `width:300px` anchored `right:0` to a 40px icon near the screen edge pushed ~150px past the viewport edge on narrow phones. Fix: `@media (max-width:480px)` switches it to `position:fixed` with viewport margins instead of a fixed width (§5).
5. **Double-wrapping conditional guards in bulk edits.** A scripted find-and-replace across many theme files wrapped an already-guarded `{store?.cart !== false && (<Link .../>)}` a second time when the guard was on the same line rather than a preceding one, breaking the build. Lesson for anyone scripting cross-theme edits: check whether the guard already exists on the *same* line, not just nearby lines, before wrapping.
6. **Order summary missing the delivery price entirely.** Generated themes have shipped `ProductForm`/`Cart` order summaries that show only product price × quantity → grand total, with no `getLiv()` line at all, or with `getLiv()` computed but never rendered. The customer sees a total that silently includes shipping with no breakdown, or a total that excludes shipping and is wrong at checkout. Fix: the labeled "التوصيل" / delivery row in the summary, and the `priceLivraison` field in the API payload, are both mandatory — see the full contract in §10.
7. **Shipping price stuck at zero / never updates.** `wilayas.find(w => w.id === fd.customerWelaya)` fails silently because wilaya IDs returned by the API are often numbers while `select` values are always strings — strict equality `1 === "1"` is `false`, so `selW` is always `undefined` and `getLiv()` always returns `0`. The customer sees `—` or `0 DA` for delivery regardless of wilaya selection. Fix: `String(w.id) === String(fd.customerWelaya)` in both `ProductForm` and `Cart` — see §17.
8. **Cart item images missing.** Themes that only check `it.product?.productImage` miss the case where the product image lives in `it.product?.imagesProduct?.[0]?.imageUrl`. The cart shows the fallback placeholder even though the product has images. Fix: `it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl` as the image source condition.
9. **Cart link duplicated on mobile.** A theme added `/cart` to both the navbar icon (top-right) and the mobile hamburger dropdown, causing the cart to appear twice. The mobile dropdown must only contain page links (Home, Contact) — the cart is already reachable from the navbar icon. See §5 for the correct `mobileLinks` pattern.
10. **Cart total displays a concatenated number instead of a sum** (e.g. "49 900 600 DA" instead of "50 500 DA"). `livraisonHome` and `livraisonOfice` often arrive as strings from the API. When `getLiv()` returns a string, `cartTotal + getLiv()` triggers JS string concatenation: `49900 + "600" = "49900600"`. The formatted result looks like a valid but wildly wrong price. Fix: `Number(selW.livraisonHome)` and `Number(selW.livraisonOfice)` inside `getLiv()` — see §3 and §10.
11. **Summary price values wrap and break the layout.** Locale-formatted numbers with spaces ("49 900 DA") break across lines inside a flex row on narrow containers, making amounts unreadable. Fix: `whiteSpace: 'nowrap'` on every price span in the summary, and `flexShrink: 0` on the label — see §11.
12. **Product grid shows 2 columns on mobile phones.** Using `@media (min-width:500px)` for the 2-column breakpoint makes the grid switch to 2 columns on any phone wider than 500px CSS pixels — which includes most modern phones (iPhone 14, Samsung Galaxy, etc.). At 2 columns on a 390px screen, card images become tiny and text truncates aggressively. Fix: use `640px` as the 2-column breakpoint so all phones in portrait mode stay at 1 column — see §18.
13. **Product images missing in Card, search results, Details gallery, and Cart items.** A theme used `p.productImage || "/placeholder.png"` everywhere. When `productImage` is null/empty, `/placeholder.png` is requested from the server — that path doesn't exist, so the browser shows a broken image icon with no visible fallback. Two separate failures compounded this: (a) `imagesProduct[0].imageUrl` was never checked as an alternative source, and (b) the `<img>` was rendered unconditionally without an `onError` handler. Fix: always check both image fields (`productImage || imagesProduct?.[0]?.imageUrl`), guard the `<img>` with an `imgErr` state + `onError`, and show a themed placeholder icon when both fields are empty — see §7.
14. **"Add to Cart" button does nothing.** `addToCart` called `validate()` which requires customerName, customerPhone, customerWelaya, and customerCommune — fields that are empty because the order form hasn't been opened yet. Every click silently failed validation and returned early without adding anything. Fix: remove `validate()` from `addToCart` entirely. Validation applies only to `submitOrder` — cart items can be added with incomplete shipping details, which are collected later at checkout — see §10.
15. **No way to dismiss the Order Now form.** A theme showed "اطلب الآن" which expanded the order form inline, but provided no cancel button — the only way out was to reload the page. Fix: always render a cancel button (`onClick={() => setIsOrderNow(false)}`) alongside the submit button whenever `isOrderNow` is true, disabled during submission — see §10.
16. **Hero image inside a grid panel instead of as a full background.** A theme placed the hero image in a secondary grid column (split-screen layout) instead of as a full-bleed background. On mobile the image either disappears or appears below the text. The correct pattern for any hero with a background image is `position: absolute; inset: 0; width: 100%; height: 100%; objectFit: cover` on the `<img>`, with a gradient overlay div above it — see §0.
17. **Page opens scrolled to the footer after navigation.** Themes shipped without any scroll-reset logic in `Main`. The browser keeps the previous page's scroll offset on client-side navigation, so a long page followed by a short one can open already scrolled past all visible content — it looks like a blank/broken page until the user manually scrolls up. Fix: `usePathname()` + `useEffect(() => window.scrollTo(0,0), [pathname])` in `Main`, see §0.
18. **Hardcoded language strings instead of T pattern.** A theme writing `<button>اطلب الآن</button>` directly in JSX only works for Arabic stores. French and English stores get Arabic text. Fix: always use `t.orderNow` (and all other labels) from `T[getLang(store)]` — see §3-A. This applies to every user-visible string: buttons, placeholders, error messages, nav links, footer text, and static page titles.
19. **`[cite: ...]` source annotations rendered as visible page text.** Citation markers written directly inside JSX text nodes (e.g. `<button>إلغاء [cite: 107]</button>`, `<Link>الكل [cite: 76]</Link>`) appear verbatim on the rendered page. They are not comments — JSX has no inline comment syntax outside `{/* */}`. Fix: strip all `[cite: ...]` fragments from JSX text content entirely. Found in `fr/phones-smart-tech-phones-theme` (2026-07-02).
20. **JSX block comment inside `&&(...)` causes TS1005.** Placing `{/* comment */}` after a closing tag but inside the parentheses of an `&&` expression triggers `error TS1005: ')' expected`:
    ```jsx
    // WRONG — TS1005 on the comment line
    {condition && (
      <div>...</div> {/* comment */}
    )}

    // CORRECT — remove the comment or move it outside the parens
    {condition && (
      <div>...</div>
    )}
    ```
    After `</div>`, the parser returns to JS expression context. A `{...}` block in expression position is invalid. Found in `fr/phones-smart-tech-phones-theme` (2026-07-02).
21. **WebKit CSS properties — wrong capitalisation in React style objects.** React's `CSSProperties` type maps `-webkit-line-clamp` to `WebkitLineClamp` (lowercase "k"), not `WebKitLineClamp`. Using the uppercase-K form causes a TypeScript type error and the property is silently dropped:
    ```tsx
    // WRONG
    style={{ WebKitLineClamp: 2, WebKitBoxOrient: 'vertical' }}

    // CORRECT
    style={{ WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
    ```
    Found in `fr/phones-smart-tech-phones-theme` (2026-07-02).
22. **Invalid CSS shorthand `pt` in React style objects.** `pt` is not a property in `React.CSSProperties` — it is silently ignored, so no padding is applied. Fix: use the full property name `paddingTop`:
    ```tsx
    // WRONG — ignored silently
    style={{ pt: 4 }}

    // CORRECT
    style={{ paddingTop: 4 }}
    ```
    Found in `fr/phones-smart-tech-phones-theme` (2026-07-02).
23. **Sticky navbar hidden behind product cards.** Cards that carry CSS `animation` or `transition: transform` create a new stacking context per element. A navbar with `position: sticky; zIndex: 50` ends up visually behind these cards on scroll. Fix: raise the navbar to `zIndex: 200`, and raise the mobile overlay/drawer above that to `zIndex: 300`:
    ```tsx
    // Navbar header
    style={{ position: 'sticky', top: 0, zIndex: 200 }}

    // Mobile overlay (backdrop + drawer)
    style={{ position: 'fixed', inset: 0, zIndex: 300 }}
    ```
    Found in `ar/lighting-everyday-decor-lighting-theme` (2026-07-02).
24. **Order form price summary appears below customer fields instead of above them.** When `isOrderNow` is true, the summary box (السعر، الكمية، التوصيل، الإجمالي) was rendered after the name/phone/wilaya/commune inputs and the delivery-type toggle, so the customer had to scroll past all fields to see the total. Fix: place the summary block immediately after the customer fields and delivery toggle, just before the submit/cancel buttons — the correct order is: customer fields → delivery toggle → **summary** → buttons. Found in `ar/lighting-everyday-decor-lighting-theme` (2026-07-02).
25. **`Details` and `ProductForm` read language from `product.store` instead of the `store` prop — always show Arabic.** `product.store` is a nested object from the product API and often does not include the `language` field. The `store` prop (fetched separately via `getStoreByDomain`) always has `language`. When `Details`/`ProductForm` only check `getLang(product?.store)`, they always default to `'ar'` on French/English stores. Fix: add `store` to the `Details` signature, use `getLang(store || product?.store)`, and pass it through to the inner `ProductForm` call:
    ```tsx
    // Details — accept store as a separate prop
    export function Details({ product, store: storeprop, ... }: any) {
      const t = T[getLang(storeprop || product?.store)];
      ...
      <ProductForm product={product} store={storeprop} ... />
    }

    // ProductForm — same pattern
    export function ProductForm({ product, store: storeprop, ... }: any) {
      const store = storeprop || product?.store;
      const t = T[getLang(store)];
      ...
    }
    ```
    Found in `sport-urban-fitness-running-theme` and `animal-pet-lovers-paradise` (2026-07-03).

26. **`domain={undefined}` hardcoded in `ProductForm` call inside `Details` — addToCart silently does nothing.** The `addToCart` function reads `localStorage.getItem(domain)`. If `domain` is `undefined` (because `Details` passes `domain={undefined}` instead of the received `domain` prop), the key is `null` and the function returns early without saving anything. The user clicks the button and nothing happens. Fix: always forward the actual `domain` prop:
    ```tsx
    // WRONG
    <ProductForm product={product} domain={undefined} ... />

    // CORRECT
    <ProductForm product={product} domain={domain} ... />
    ```
    Found in `sport-urban-fitness-running-theme` (2026-07-03).

27. **`store?.cart === true` strict boolean check hides the Add-to-Cart button.** If `store.cart` is `1` (number) or any other truthy non-`true` value, the strict equality fails and the button never renders. The correct guard throughout the codebase is `store?.cart !== false` — show the button unless the store has explicitly disabled the cart. Using `=== true` has the same problem in navbar/footer/hero cart links. Fix everywhere:
    ```tsx
    // WRONG — hides button when cart = 1 or any non-boolean truthy value
    {store?.cart === true && <button>{t.addToCart}</button>}

    // CORRECT
    {store?.cart !== false && <button>{t.addToCart}</button>}
    ```
    Found in `sport-urban-fitness-running-theme` (2026-07-03).

28. **Search dropdown positioned off-screen in RTL.** Using `right: 0` on an absolutely-positioned dropdown with `width: 340px` anchors its right edge to the right edge of the search button. In RTL layout the search button is on the LEFT side of the header — the 340px dropdown then extends 340px to the LEFT, going off the left viewport edge. Conversely, `left: 0` in LTR pushes the dropdown off the right edge. Fix: use the CSS logical property `inset-inline-end: 0`, which resolves to `left: 0` in RTL (extends right ✓) and `right: 0` in LTR (extends left ✓):
    ```css
    /* WRONG */
    .search-dropdown { position: absolute; right: 0; width: 340px; }

    /* CORRECT — direction-aware */
    .search-dropdown { position: absolute; inset-inline-end: 0; width: 340px; }

    /* Mobile: switch to fixed positioning to avoid overflow entirely */
    @media (max-width: 480px) {
      .search-dropdown { position: fixed; left: 12px; right: 12px; width: auto; top: 64px; }
    }
    ```
    Found in `--coustom-sidou-box` (2026-07-03).

29. **Hero text block stays on the physical LEFT in RTL desktop layouts.** CSS `direction: rtl` does NOT move block-level boxes — it only changes text alignment and inline content direction. A `<h1>` with `maxWidth: 720px` on a 1280px container always renders at the left edge physically, leaving 560px of empty space on the right in RTL (where the text should be). Fix: add `marginInlineEnd: 'auto'` to constrained-width block elements. This resolves to `margin-left: auto` in RTL (pushes block to the right ✓) and `margin-right: auto` in LTR (leaves block at the left ✓):
    ```tsx
    // WRONG — h1 stays at physical left edge even in RTL
    <h1 style={{ maxWidth: 720 }}>...</h1>

    // CORRECT — moves to right in RTL, stays left in LTR
    <h1 style={{ maxWidth: 720, marginInlineEnd: 'auto' }}>...</h1>
    ```
    Only needed on elements that have a `maxWidth` smaller than the container. Full-width block elements are unaffected. Found in `--coustom-sidou-box` (2026-07-03).

---

## 16. Creative Direction — Differentiation Levers

CSS, colors, and fonts are free, but "free" has produced near-identical themes before. Use these levers to make a theme *actually* feel different, not just re-skinned. Pick a distinct combination per theme — don't reuse the same Hero/Card/typography pairing across themes in the same category.

### 16-A. Mandatory Archetype Declaration

**أول خطوة في كل ثيم جديد — قبل كتابة أي كود** — هي تحديد هذه القرارات الأربعة:

```
NAVBAR ARCHETYPE : [A|B|C|D|E|F] — (§5-A)
CARD ARCHETYPE   : [2|3|4|5|6]   — (§7-A)
HERO LAYOUT      : [full-bleed|split|asymmetric|marquee|video-loop|text-only]
TYPOGRAPHY PAIR  : [display font] + [body font]
```

لا يُسمح ببدء التطوير قبل الإعلان عن هذه الأربعة. إذا كان الثيم FR لثيم AR موجود، يجب أن يشاركه نفس الـ archetype (نفس الهيكل، ترجمة فقط).

### 16-B. قاعدة التمايز بين الثيمات في نفس الفئة

ثيمان في نفس الفئة (مثلاً `phones-*` و `phones-*`) لا يمكن أن يشتركا في نفس Navbar Archetype **ونفس** Card Archetype معاً. مسموح بتشارك واحد منهما لكن ليس الاثنين.

**مثال على التطبيق:**
```
phones-smart-tech    → NAVBAR:B + CARD:3
phones-premium-*     → NAVBAR:C + CARD:2   ✓ (مختلف في كليهما)
phones-budget-*      → NAVBAR:B + CARD:4   ✓ (Navbar مشترك لكن Card مختلف)
phones-gaming-*      → NAVBAR:B + CARD:3   ✗ (مطابق لـ smart-tech — ممنوع)
```

### 16-C. Hero Layout Options

| الخيار | الوصف | متى تستخدمه |
|--------|-------|-------------|
| **full-bleed** | صورة خلفية + نص فوقها + gradient scrim | أي ثيم بصورة منتج جذابة |
| **split** | نصف نص + نصف صورة (grid 2-col) | إلكترونيات، أثاث |
| **asymmetric** | عنوان ضخم يتداخل مع صورة أصغر | luxury، fashion |
| **marquee** | ticker نص متحرك + hero نظيف بلا صورة | minimal، عطور |
| **video-loop** | `<video autoPlay muted loop>` كخلفية | gaming، رياضة |
| **text-only** | طباعة ضخمة فقط، بدون صور | كتب، خدمات، SaaS |

### 16-D. Typography Pairing Rules

اختر **اثنتين** من Google Fonts دائماً — واحدة للعرض (headings) وأخرى للجسم (body). لا تستخدم نفس الخط للاثنتين بحجم مختلف:

| الخط العرض | الخط الجسم | مناسب لـ |
|------------|------------|----------|
| El Messiri | Tajawal | luxury عربي، عطور |
| Cairo | JetBrains Mono | تقنية، إلكترونيات |
| Lalezar | Noto Sans Arabic | gaming، شباب |
| Amiri | Noto Naskh Arabic | كلاسيك، كتب |
| Almarai | Almarai *(bold/reg)* | عائلي، أطفال |
| Reem Kufi | Cairo | رياضة، outdoor |
| Tajawal | Tajawal *(weights only)* | last resort — يُعد مكرراً |

**قاعدة:** إذا استُخدم نفس الخط في ثيم سابق في نفس الفئة، غيّره.

### 16-E. Active Category Indicator — يجب أن يختلف

كل ثيم يختار **شكلاً** مختلفاً لمؤشر الفئة النشطة — ليس فقط لوناً مختلفاً:

```css
/* خيار 1: underline (خط سفلي) */
.cat-active { border-bottom: 3px solid A; }

/* خيار 2: filled pill (زر ممتلئ) */
.cat-active { background: A; color: #fff; border-radius: 999px; padding: 4px 16px; }

/* خيار 3: bordered chip (إطار) */
.cat-active { border: 2px solid A; color: A; border-radius: 4px; }

/* خيار 4: letter-spacing shift (تباعد حروف) */
.cat-active { letter-spacing: 0.12em; color: A; font-weight: 800; }

/* خيار 5: background highlight bar */
.cat-active { background: AL; color: A; padding: 4px 12px; border-radius: 3px; }
```

لا يجوز أن يستخدم ثيمان في نفس الفئة نفس شكل المؤشر.

---

**اختبار التمايز الكافي:** إذا أزلت الألوان والخطوط من ثيمين في نفس الفئة، هل لا تزال قادراً على التمييز بينهما من الهيكل وحده؟ إذا لا — الهيكل هو المشكلة، ليس الألوان.

---

## 17. Wilaya API — Empty State & Fallback

The wilaya list (`fetchWilayas`) can legitimately return `[]` in two situations: the store owner hasn't configured shipping yet, or the API call failed. Both look the same to the theme. Handle them correctly:

**Critical: always use `String()` coercion when matching the selected wilaya:**
```ts
// WRONG — wilaya IDs from the API are often numbers, select values are always strings
const selW = wilayas.find((w) => w.id === fd.customerWelaya);  // 1 === "1" → false → selW always undefined

// CORRECT
const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));
```
Without this, `selW` is always `undefined`, `getLiv()` always returns `0`, and the shipping price never updates regardless of which wilaya the customer selects. Apply in **both** `ProductForm` and `Cart`.

**Guard the fetch call:**
```ts
// ProductForm
useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);

// Cart — userId comes from store.user.id, not product
useEffect(() => {
  if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas);
}, [store]);
```
Never call `fetchWilayas(undefined)` — it will hit `/shipping/public/get-shipping/undefined` and return garbage.

**Wilaya & Commune display name — trilingual:**
The API returns both `name` (French/Latin) and `ar_name` (Arabic). Display the correct one based on the active language — never hardcode `ar_name` for all languages:
```tsx
// WRONG — always shows Arabic name even for French/English stores
{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}

// CORRECT — use t.dir (already in scope) as the language signal
{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>)}
{communes.map(c => <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>)}
```
`t.dir === 'rtl'` is true only for Arabic (`ar`). French and English both use `name` (e.g. "Ouled Djellal" instead of "أولاد جلال"). The wilaya ID prefix (`{w.id} -`) stays in all languages.

**Empty wilaya select UI:**
When `wilayas.length === 0`, the select element is empty and the user can't pick a wilaya. Do **not** hide the form or crash — just render the select disabled with a placeholder:
```tsx
<select disabled={wilayas.length === 0} ...>
  <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
  {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>)}
</select>
```

**`getLiv()` must never crash on empty list** — already guaranteed if it checks `!selW` first:
```ts
const getLiv = (): number => {
  if (!selW) return 0;  // covers both "no wilaya selected" and "wilayas empty"
  return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice;
};
```

**Commune fetch guard — reset on wilaya change:**
```ts
useEffect(() => {
  if (!fd.customerWelaya) { setCommunes([]); return; }
  setLoadingC(true);
  fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLoadingC(false); });
}, [fd.customerWelaya]);
```

---

## 18. Responsive Design — Required Breakpoints & Patterns

Every theme must be fully usable on mobile (360px) and desktop (1280px+). These are the standard breakpoints and patterns — deviation requires a strong reason.

**Breakpoints (use these, not others):**
```css
/* mobile-first — no media query = default (mobile) */
@media (min-width: 640px)  { /* 2-column product grid */ }
@media (min-width: 768px)  { /* details 2-col, footer 3-col */ }
@media (min-width: 1024px) { /* nav desktop, 3-col products, cart 2-col */ }
@media (min-width: 1280px) { /* 4-col products */ }
```

**Content container — always:**
```tsx
<div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
```
Never set a fixed pixel width on a content section without `max-width` + `margin: auto`.

**Product grid — standard:**
```css
.products-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
@media (min-width: 640px)  { .products-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1280px) { .products-grid { grid-template-columns: repeat(4, 1fr); } }
```
**Mobile = 1 column always** (< 640px). The breakpoint for 2 columns is `640px`, not `500px` — this ensures phones in portrait mode (≤ 430px) always show a single card, avoiding cramped product cards on small screens.

**Hero height — always clamp, never fixed:**
```tsx
style={{ minHeight: 'clamp(480px, 68vh, 760px)' }}
```

**Typography — clamp for headings:**
```tsx
fontSize: 'clamp(1.75rem, 5vw, 3.5rem)'  // h1
fontSize: 'clamp(1.25rem, 3vw, 1.75rem)'  // h2
```

**Touch targets — minimum 44px height** for all buttons, links, and select elements on mobile. Never use a 28px button in isolation.

**Images — always:**
```tsx
style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
```

**Cart / Details layout:**
```css
.cart-inner    { grid-template-columns: 1fr; }        /* mobile */
.details-inner { grid-template-columns: 1fr; }
@media (min-width: 1024px) { .cart-inner    { grid-template-columns: 1.2fr 1fr; } }
@media (min-width: 768px)  { .details-inner { grid-template-columns: 1fr 1fr; } }
```

---

## 19. Input & Button — Modern Design Standard

All form elements must be visually consistent, keyboard-accessible, and match the theme's design language. These are the minimum requirements — not a full design system, just the floor.

**Input base style:**
```tsx
const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  fontSize: '0.9rem',
  border: '1px solid {BD}',        // use theme border token
  borderRadius: 0,                  // or theme radius (2px–12px), but consistent
  background: '{surface}',          // slightly lighter/darker than CARD
  color: '{TXT}',
  outline: 'none',
  appearance: 'none',               // normalize cross-browser
  transition: 'border-color 0.2s',
  fontFamily: 'inherit',            // CRITICAL — always inherit, never omit
};
// Focus: use onFocus/onBlur to toggle border-color to accent, since outline:none removes default ring
```

**Select — always add custom arrow icon:**
```tsx
<div style={{ position: 'relative' }}>
  <ChevronDown size={12} style={{
    position: 'absolute', right: 12, top: '50%',
    transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB
  }} />
  <select style={{ ...inputBase, paddingRight: 36 }}>...</select>
</div>
```
`paddingRight: 36` reserves space for the arrow. `pointerEvents: 'none'` on the icon lets clicks fall through to the select.

**Button — primary:**
```tsx
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '0.875rem 1.5rem',
  minHeight: 44,                    // touch target
  background: A,                    // theme accent
  color: '#fff',                    // or dark if accent is light
  fontWeight: 700,
  fontSize: '0.9rem',
  border: 'none',
  borderRadius: 0,                  // match input radius
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontFamily: 'inherit',            // CRITICAL
  width: '100%',                    // for full-width submit buttons
};
// Hover: darken background (AD), optional lighten text
// Disabled: opacity 0.65, cursor default — never remove disabled state
```

**Button — secondary / outline:**
```tsx
{
  ...btnPrimary,
  background: 'transparent',
  color: A,
  border: `1px solid ${A}`,
}
// Hover: fill background with A, color → '#fff' or dark
```

**Error state on inputs:**
```tsx
const inputErr: React.CSSProperties = { borderColor: '#EF4444' };
// Show error message below the field:
{error && (
  <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.3rem',
               display: 'flex', alignItems: 'center', gap: 4 }}>
    <AlertCircle size={11} /> {error}
  </p>
)}
```

**Delivery type toggle (home/office):**
Use two full-width buttons styled as a 2-column grid, not a radio group. Active = filled with accent tint (AL background, A border, A text). Inactive = transparent background, muted border and text.

**Quantity counter (+/−):**
Inline-flex row: `[−] [number] [+]` — wrap in a single bordered container (no gaps between elements), each button 36×36px minimum.

**Textarea:**
Same as input, add `resize: 'none'` to prevent layout-breaking resize. Default 5 rows.

**Form row (2-column on mobile+):**
```css
.form-row-2 { display: grid; grid-template-columns: 1fr; gap: 0.875rem; margin-bottom: 0.875rem; }
@media (min-width: 500px) { .form-row-2 { grid-template-columns: 1fr 1fr; } }
```

---

## §20 — Animations & Motion (إعطاء الروح للثيم)

> **القاعدة الأساسية:** كل ثيم يجب أن يحتوي على حركة حقيقية — ليس فقط `transition` بل `@keyframes` مرئية.
> ثيم بدون animation = ثيم ميت. أضف الحركة في: البطاقات، الهيرو، الأزرار، الأيقونات، loading states.

---

### 20.1 — Keyframes إلزامية في كل ثيم

أضف هذه الـ keyframes دائماً في `THEME_CSS`:

```css
/* Entry animations */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}

/* Continuous / looping */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(VAR_A, 0.4); }
  50%       { box-shadow: 0 0 0 10px rgba(VAR_A, 0); }
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
```

---

### 20.2 — البطاقات (Cards) — قواعد الحركة

```css
/* Card hover — lift + shadow */
.card {
  transition: transform 0.28s cubic-bezier(.22,.68,0,1.2), box-shadow 0.28s ease;
}
.card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0,0,0,0.18);
}

/* Card image zoom on hover */
.card-img { transition: transform 0.5s ease; overflow: hidden; }
.card:hover .card-img { transform: scale(1.08); }

/* Card entry — stagger with CSS custom property */
.card { animation: fadeUp 0.5s ease both; }
.card:nth-child(1) { animation-delay: 0.05s; }
.card:nth-child(2) { animation-delay: 0.10s; }
.card:nth-child(3) { animation-delay: 0.15s; }
.card:nth-child(4) { animation-delay: 0.20s; }
```

**تطبيق stagger في JSX:**
```tsx
{products.map((p, i) => (
  <div key={p.id} className="card" style={{ animationDelay: `${i * 0.07}s` }}>
    ...
  </div>
))}
```

---

### 20.3 — الأزرار (Buttons)

```css
/* Primary button */
.btn-primary {
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease;
}
.btn-primary:hover  { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.2); }
.btn-primary:active { transform: translateY(0px) scale(0.97); }

/* Pulse badge / CTA */
.btn-pulse { animation: pulse-glow 2s infinite; }

/* Icon inside button — rotate on hover */
.btn-icon { transition: transform 0.2s ease; }
.btn-primary:hover .btn-icon { transform: translateX(4px); } /* LTR */
```

---

### 20.4 — الهيرو (Hero Section)

```css
/* Hero content entry */
.hero-title   { animation: fadeUp 0.7s ease 0.1s both; }
.hero-sub     { animation: fadeUp 0.7s ease 0.25s both; }
.hero-cta     { animation: fadeUp 0.7s ease 0.4s both; }
.hero-badge   { animation: scaleIn 0.5s ease 0.55s both; }

/* Floating decorative element */
.hero-float   { animation: float 4s ease-in-out infinite; }

/* Background gradient shift */
@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.hero-gradient-bg {
  background-size: 200% 200%;
  animation: gradientShift 8s ease infinite;
}
```

---

### 20.5 — Skeleton / Loading States

استبدل "جاري التحميل..." بـ skeleton حقيقي:

```css
.skeleton {
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 400px 100%;
  animation: shimmer 1.4s infinite linear;
  border-radius: 6px;
}
/* Dark theme variant */
.skeleton-dark {
  background: linear-gradient(90deg, #1e2030 25%, #2a2d3e 50%, #1e2030 75%);
  background-size: 400px 100%;
  animation: shimmer 1.4s infinite linear;
}
```

```tsx
// Usage during loading
{loading ? (
  <div style={{ display: 'grid', gap: 16 }}>
    {[...Array(4)].map((_, i) => (
      <div key={i} className="skeleton" style={{ height: 240, borderRadius: 12 }} />
    ))}
  </div>
) : (
  /* real products */
)}
```

---

### 20.6 — Page Transitions

في `Main` — إضافة fade على تغيير الصفحة:

```tsx
const [visible, setVisible] = useState(false);
useEffect(() => {
  setVisible(false);
  const t = setTimeout(() => setVisible(true), 50);
  return () => clearTimeout(t);
}, [pathname]);

// Wrapper:
<div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}>
  {/* page content */}
</div>
```

---

### 20.7 — Micro-interactions

```css
/* Nav links */
.nav-link { position: relative; }
.nav-link::after {
  content: '';
  position: absolute; bottom: -2px; left: 0; right: 0;
  height: 2px; background: A;
  transform: scaleX(0); transform-origin: center;
  transition: transform 0.25s ease;
}
.nav-link:hover::after,
.nav-link.active::after { transform: scaleX(1); }

/* Cart count badge bounce */
@keyframes badgeBounce {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.4); }
  70%  { transform: scale(0.9); }
  100% { transform: scale(1); }
}
.cart-badge-animate { animation: badgeBounce 0.4s ease; }

/* Input focus */
.input-field { transition: border-color 0.2s, box-shadow 0.2s; }
.input-field:focus {
  border-color: A;
  box-shadow: 0 0 0 3px rgba(A, 0.15);
  outline: none;
}
```

---

### 20.8 — قواعد عامة للـ Animation

| القاعدة | التفاصيل |
|---------|---------|
| `ease` للحركات العادية | `cubic-bezier(.22,.68,0,1.2)` للحركات المرنة (bounce خفيف) |
| مدة hover: **0.15–0.3s** | مدة entry: **0.4–0.8s** | مدة looping: **2–6s** |
| `animation: X both` | `both` يضمن بقاء الحالة النهائية بعد انتهاء الـ animation |
| لا تتجاوز 3 looping animations في نفس الصفحة | تثقل الأداء |
| `prefers-reduced-motion` | أضف `@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; } }` |
| `will-change: transform` | فقط على العناصر التي تتحرك فعلاً (cards، hero elements) |

---

### 20.9 — Checklist — ثيم حيّ ✓

- [ ] `@keyframes fadeUp` + `scaleIn` مُعرّفان في THEME_CSS
- [ ] بطاقات المنتجات: hover lift + image zoom
- [ ] أزرار: hover translateY + active scale
- [ ] هيرو: entry animation على العنوان والـ CTA
- [ ] Loading: skeleton بدل نص
- [ ] Nav links: underline slide animation
- [ ] Page transition: fade on pathname change
- [ ] لا يوجد أكثر من 3 looping animations نشطة في وقت واحد


لا تنسى بعض الانميشن للموفع