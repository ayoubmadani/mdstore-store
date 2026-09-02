---
name: theme-dev-v2
description: "v2 — دليل تطوير ثيمات MdStore: بنية الملفات، أنماط i18n (ar/fr/en)، أخطاء BiDi/RTL، CSS في flex containers، variant filtering، image attr display، bundle command، قواعد ثابتة للـ Navbar/Footer/Hero، حقول Free Shipping / Qty Support على store وproduct وoffer، صفحات static إضافية (additionalPages) خارج الأربع الأساسية، export `Success` الإلزامي لصفحة نجاح الطلب، ومنتج رقمي (product.isDigital) — لا شحن، الزائر يختار بريد إلكتروني أو واتساب عبر زرّي تبديل بدل عنوان، لا يدخل السلة."
---

# Theme Dev v2 — دليل تطوير ثيمات MdStore

دليل مرجعي شامل لكل ما يخص إنشاء وتعديل ثيمات متجر MdStore: بنية الكود، أنماط الترجمة، أخطاء متكررة وحلولها، variant filtering، وقواعد ثابتة يجب احترامها في كل ثيم.

---

## When to Apply

استخدم هذا الـ Skill عند:
- إنشاء ثيم جديد من الصفر
- إضافة i18n لثيم موجود
- تصحيح مشاكل اتجاه النص (RTL/LTR)
- تعديل Hero أو Navbar أو Footer
- تصحيح أخطاء بصرية في الثيم (محاذاة، overflow، ألوان)
- إضافة فلترة المتغيرات (variant filtering)
- تصحيح عرض الـ attributes (صور/ألوان/نص)
- إضافة دعم "منتج رقمي" (`product.isDigital`) — لا شحن، الزائر يختار بريد إلكتروني أو واتساب بدل عنوان (انظر §23)

---

## 1. بنية الملف الأساسية

كل ثيم ملف `.tsx` واحد في `src/theme/` يصدّر:

```ts
export default Main         // الـ layout الرئيسي
export { Navbar, Footer, Card, Home, Details, ProductForm, Cart,
         Privacy, Terms, Cookies, Contact, StaticPage, Success }
```

> **`Success` إلزامي** — صفحة `/success` تعرض الثيم عبر `ThemeRunner` بـ `exportName="Success"`. ثيم بدون هذا الـ export تنكسر صفحة نجاح الطلب لديه. انظر §22 للتفاصيل الكاملة.

### نمط اللغة (getLang + T lookup)

```ts
type Lang = 'ar' | 'fr' | 'en';

const getLang = (store?: any): Lang => {
  if (store?.language === 'fr') return 'fr';
  if (store?.language === 'en') return 'en';
  return 'ar';
};

const T: Record<Lang, typeof jsonAr> = {
  ar: jsonAr,
  fr: jsonFr as any,
  en: jsonEn as any,
};
```

### Triplet في كل Component

```ts
const t = T[getLang(store)];
const isRTL = t.dir === 'rtl';
const currency = store?.currency || 'DZD';
```

### تعارض اسم `t` — أخطاء شائعة

```ts
// ✗ خطأ — const t = setTimeout(...) يتعارض مع translation t
const t = setTimeout(() => setShow(false), 3000);

// ✓ صحيح — أعد التسمية
const timer = setTimeout(() => setShow(false), 3000);

// ✗ خطأ — .map((t) => ...) يظلل translation t
attrs.map((t) => t.name)

// ✓ صحيح
attrs.map((typ) => typ.name)
```

---

## 2. JSON الترجمة — المفاتيح الإلزامية

يجب أن يحتوي كل ملف ترجمة (ar/fr/en) على هذه المفاتيح كحد أدنى:

| مجموعة | المفاتيح |
|--------|---------|
| **التوجيه** | `dir` (`'rtl'` أو `'ltr'`) |
| **Navbar** | `home, contact, cart, search, searching, noResults, showAll` |
| **الصفحة الرئيسية** | `all, noProducts, shopNow, searchFor, heroBadge, heroTitle, heroSub` |
| **Trust bar** | `trust` (array من `{title, desc}`) |
| **نموذج الطلب** | `fullName, fullNamePh, errName, phone, phonePh, errPhone, errPhoneInvalid, wilaya, errWilaya, wilayaPh, wilayaNA, commune, errCommune, communePh, communeLoading, deliveryType, deliveryHome, deliveryOffice, qty, price, delivery, total, subtotal, addToCart, orderNow, confirmOrder, sending, back, addedMsg, errSubmit` |
| **السلة** | `myCart, cartEmpty, cartEmptyDesc, successTitle, successDesc, backToShop, checkoutTitle` |
| **Footer** | `quickLinks, contactSect, privacy, terms, rightsReserved, footerDesc` |
| **صفحات ثابتة** | `privacyTitle, termsTitle, cookiesTitle` + أقسامها الفرعية |
| **اتصل بنا** | `contactTitle, contactInfoTitle, contactFormTitle, namePh, emailPh, phonePh2, messagePh, sendBtn, sentTitle, sentDesc, sendAnother, contactErr` |

---

## 3. قواعد BiDi/RTL — الأكثر تسبباً في أخطاء

### القاعدة الذهبية: الخاصية الفيزيائية تتغلب على BiDi

عندما يحتوي عنصر LTR على نص عربي (RTL)، يكتشف المتصفح اتجاه الفقرة تلقائياً ويجعلها RTL حتى لو كان `dir="ltr"`. الحل:

```tsx
// ✗ خطأ — 'start' يتبع اتجاه الفقرة (RTL للعربي = يمين)
style={{ textAlign: 'start' }}

// ✓ صحيح — قيمة فيزيائية لا تتأثر بـ BiDi
style={{ textAlign: t.dir === 'rtl' ? 'right' : 'left' }}
```

### dir على العنصر نفسه لا يكفي وحده

```tsx
// ✗ dir على الـ container فقط لا يضمن المحاذاة الصحيحة
<div dir={t.dir}>
  <h1 style={{ textAlign: 'start' }}>...</h1>
</div>

// ✓ dir + textAlign فيزيائي على العنصر نفسه
<div dir={t.dir}>
  <h1 dir={t.dir} style={{ textAlign: t.dir === 'rtl' ? 'right' : 'left' }}>
    ...
  </h1>
</div>
```

### أيقونات الأسهم في RTL

```tsx
// ArrowLeft يصبح ArrowRight في LTR
<ArrowLeft style={{ transform: t.dir === 'ltr' ? 'scaleX(-1)' : 'none' }} />
```

### الـ gradient في Hero

```tsx
// يجب أن يعتمد على الاتجاه
background: `linear-gradient(to ${t.dir === 'rtl' ? 'left' : 'right'}, ...)`
// أو بالدرجات:
background: `linear-gradient(${t.dir === 'rtl' ? '270deg' : '90deg'}, ...)`
```

### CSS direction في Search Panel

```tsx
// ✗ لا تضع direction: rtl hardcoded في CSS classes
.glb-search-panel { direction: rtl; }
.glb-search-input { direction: rtl; }

// ✓ احذف direction من CSS، وأضف dir dynamically على العنصر
<div className="glb-search-panel" dir={t.dir}>
  <input className="glb-search-input" dir={t.dir} />
</div>
```

---

## 4. CSS في Flex Containers — مشكلة شائعة

### المشكلة: `hn-container` داخل `display: flex`

عندما تكون الـ `section` الخاصة بـ Hero تستخدم `display: flex; alignItems: center`، فإن الـ container الداخلي يصبح **flex item** ويأخذ عرض المحتوى فقط بدلاً من `100%`:

```tsx
// ✗ خطأ — hn-container سيأخذ عرض المحتوى فقط داخل الـ flex
<section style={{ display: 'flex', alignItems: 'center' }}>
  <div className="hn-container" style={{ padding: '3rem 1.5rem' }}>

// ✓ صحيح — إضافة width: '100%' تجبره على ملء العرض الكامل
<section style={{ display: 'flex', alignItems: 'center' }}>
  <div className="hn-container" style={{ padding: '3rem 1.5rem', width: '100%' }}>
```

**السبب:** `max-width + margin: 0 auto` في الـ CSS class لا يعملان بشكل صحيح في flex context إلا مع `width: 100%`.

---

## 5. Hero Section — القواعد الثابتة

```tsx
// ✓ عرض عنوان Hero — نص عادي، لا dangerouslySetInnerHTML للعناوين الطويلة
<h1 style={{ wordBreak: 'break-word' }}>
  {store?.hero?.title || t.heroTitle}
</h1>

// ✓ إذا دعمت HTML markup — استخدم DOMPurify مع dir فيزيائي
<h1
  dir={t.dir}
  style={{ textAlign: t.dir === 'rtl' ? 'right' : 'left' }}
  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(heroTitle) }}
/>

// ✓ container الـ Hero داخل flex section يحتاج width: '100%'
<div className="hn-container" style={{ width: '100%', padding: '3rem 1.5rem' }}>
```

---

## 6. Variant Filtering — تعطيل المتغيرات غير المتاحة

### المشكلة

عندما يحدد المستخدم لوناً معيناً، بعض المقاسات لا تكون متاحة لذلك اللون. يجب تعطيلها بصرياً.

### البيانات: `product.variantDetails`

```ts
// variantDetails: مصفوفة من كل التركيبات المتاحة فعلاً
product.variantDetails = [
  { name: [{ attrName: 'اللون', value: 'أحمر' }, { attrName: 'المقاس', value: 'M' }] },
  { name: [{ attrName: 'اللون', value: 'أزرق' }, { attrName: 'المقاس', value: 'S' }] },
  // ...
]
```

### نمط الفلترة الكامل

داخل حلقة رسم الـ attributes، احسب `available` قبل رسم كل زر:

```tsx
const available = !product.variantDetails?.length ||
  product.variantDetails.some((vd: any) =>
    Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(
      ([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)
    )
  );
```

**المنطق:** إذا كانت `variantDetails` فارغة → كل المتغيرات متاحة. وإلا، ابحث عن أي تركيبة في `variantDetails` تشمل الاختيار الحالي + قيمة هذا المتغير.

### تطبيق الـ `available` على الأزرار

```tsx
// onClick — منع التحديد إذا كان غير متاح
onClick={() => available && handleVariantSelection(attr.name, v.value)}

// نمط اللون (color swatch)
style={{
  opacity: available ? 1 : 0.35,
  cursor: available ? 'pointer' : 'not-allowed',
  // ... باقي الـ styles
}}

// نمط الصورة (image mode)
style={{
  opacity: available ? 1 : 0.35,
  cursor: available ? 'pointer' : 'not-allowed',
  // ... باقي الـ styles
}}

// نمط النص (text button) — الأهم: textDecoration للتشطيب
style={{
  color: isSelected ? ACCENT : (available ? '#555' : '#bbb'),
  cursor: available ? 'pointer' : 'not-allowed',
  transition: 'all 0.18s',
  textDecoration: available ? 'none' : 'line-through',
  // ... باقي الـ styles
}}
```

> **تنبيه:** كل ثيم له لون accent مختلف في `isSelected ? ACCENT`. تأكد من استخدام اللون الصحيح:
> - bold-red: `#E63946` | energetic-orange: `#F97316` | golden-touch: `#D4AF37`
> - playful-pink: `#EC4899` | royal-purple: `#7C3AED` | vibrant-green: `#16A34A`
> - electric-blue: `#1D4ED8`

---

## 7. Image Attribute Display — عرض صورة الـ Attribute

### المشكلة

`attr.displayMode` قد يكون `'image'` لكن `v.value` يحتوي أحياناً على الـ URL وأحياناً `v.name`. إذا لم يُكتشف الـ URL صح يظهر النص الخام (URL كـ text).

### كشف URL من كلا الحقلين

```tsx
// احسب imgSrc بفحص v.value أولاً ثم v.name
const imgSrc = (v.value || '').startsWith('http')
  ? v.value
  : (v.name || '').startsWith('http')
    ? v.name
    : null;

// اعتبر الـ attr صورة إذا كان displayMode === 'image' أو وجد URL
const isImg = attr.displayMode === 'image' || (attr.displayMode !== 'color' && !!imgSrc);

// مفتاح الاختيار يكون imgSrc (لا v.value)
const selKey = isImg ? imgSrc! : v.value;
const isSelected = selectedVariants[attr.name] === selKey;
```

### رسم زر الصورة

```tsx
{attr.displayMode === 'color' ? (
  // color swatch كالمعتاد
) : isImg ? (
  <button
    key={v.id}
    onClick={() => available && handleVariantSelection(attr.name, imgSrc!)}
    title={v.name}
    style={{
      width: 52, height: 52, padding: 0, overflow: 'hidden',
      border: `2px solid ${isSelected ? '#111' : '#ddd'}`,
      borderRadius: 4, cursor: available ? 'pointer' : 'not-allowed',
      opacity: available ? 1 : 0.35, flexShrink: 0,
    }}
  >
    <img src={imgSrc!} alt={v.name}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  </button>
) : (
  // text button
)}
```

---

## 8. أخطاء متكررة وحلولها

| الخطأ | السبب | الحل |
|-------|-------|------|
| نص Hero يمين-محاذاة في متجر LTR | BiDi يتجاوز `dir="ltr"` عند وجود عربي | `textAlign: t.dir === 'rtl' ? 'right' : 'left'` |
| Hero text لا يتمحاذى مع الـ categories | `hn-container` داخل flex يأخذ عرض المحتوى | أضف `width: '100%'` للـ container |
| نص عربي يظهر مقلوباً في hero overflow | `dangerouslySetInnerHTML` + نص طويل جداً | استخدم plain text + `wordBreak: 'break-word'` |
| `cite` text مرئي | `content: attr(cite)` في CSS | احذف خاصية cite أو استخدم `data-*` بدلاً منها |
| JSX comment داخل `&& ()` | `{/* comment */}` داخل تعبير شرطي | ضع التعليق خارج الـ expression أو احذفه |
| `WebKitLineClamp` لا يعمل | `overflow: visible` | أضف `overflow: 'hidden'` للـ container |
| `pt` (points) بدلاً من `px` في CSS | وحدة خاطئة | استخدم `px` أو `rem` دائماً في web |
| URL يظهر كـ text في attr الصورة | فحص `v.value` فقط والـ URL في `v.name` | افحص كلاهما: `(v.value\|\|'').startsWith('http') \|\| (v.name\|\|'').startsWith('http')` |
| تشطيب لا يظهر على المتغير المعطّل | `textDecoration` غائبة من نمط النص | أضف `textDecoration: available ? 'none' : 'line-through'` |
| مقاس غير متاح لا يُعطَّل | لا يوجد فلترة `variantDetails` | أضف نمط `available` بفحص `product.variantDetails` |
| `t` variable conflict في Navbar | `const t = setTimeout(...)` يحجب translation | أعد تسمية الـ timer: `const timer = setTimeout(...)` |
| search direction hardcoded | `direction: rtl` في CSS class | احذفه واستخدم `dir={t.dir}` على العنصر |
| أزرار slider مقلوبة في العربية | `insetInlineStart` + `ChevronLeft` لـ prev | انظر §16 — استخدم `{t.dir === 'rtl' ? <ChevronRight/> : <ChevronLeft/>}` |
| URL مكرر في success page | `router.push(\`/${domain}/successfully\`)` | استخدم `/successfully?productId=${product?.id}` بدون domain |
| URL صورة يظهر كـ نص في label اللون | `selectedVariants[attr.name]` يحتوي URL | استخدم `attr.variants.find(v => v.value === val)?.name \|\| val` |
| gridTemplateColumns inline يتغلب على media query | inline style له أولوية CSS أعلى من class | احذف `gridTemplateColumns` من inline style وابقِه في CSS class فقط |
| color swatch لا يعرض صورة URL | `background: v.value` لا يقبل URL بدون `url()` | افحص URL: `{/^https?:\/\//.test(v.value) ? <img .../> : <span style={{background: v.value}}/>}` |

---

## 9. أنماط CSS الثابتة (Classes بدل Inline)

استخدم CSS classes للتخطيطات المتكررة بدلاً من inline styles معقدة:

```css
/* Product grid */
.pgrid { display:grid; grid-template-columns:repeat(2,1fr); gap:1rem }
@media(min-width:768px){ .pgrid { grid-template-columns:repeat(3,1fr) } }
@media(min-width:1200px){ .pgrid { grid-template-columns:repeat(4,1fr) } }

/* Form 2-column */
.form2 { display:grid; grid-template-columns:1fr 1fr; gap:.875rem }
@media(max-width:500px){ .form2 { grid-template-columns:1fr } }

/* Cart layout */
.cart-layout { display:grid; grid-template-columns:1fr; gap:2rem }
@media(min-width:900px){ .cart-layout { grid-template-columns:1.3fr 1fr } }

/* Product detail layout */
.det-layout { display:grid; grid-template-columns:1fr; gap:2rem }
@media(min-width:768px){ .det-layout { grid-template-columns:1fr 1fr } }

/* Navbar */
.nav-desktop { display:flex; align-items:center; gap:24px }
.nav-mobile-btn { display:none }
@media(max-width:720px){ .nav-desktop{display:none} .nav-mobile-btn{display:flex} }

/* Trust bar */
.trust-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1.25rem }
@media(min-width:640px){ .trust-grid { grid-template-columns:repeat(4,1fr) } }
```

---

## 10. Navbar — القواعد الثابتة

```tsx
// ✓ زر الـ mobile يجب أن يكون display:none بـ CSS class وليس inline
<button className="nav-mobile-btn" onClick={() => setOpen(true)}>...</button>

// ✓ Category active state
const isActive = selectedCat === cat.id || (selectedCat === '' && cat.id === 'all');
style={{ borderBottom: isActive ? `2px solid ${ACCENT}` : '2px solid transparent' }}

// ✓ store prop على Shell
<Shell store={store} dir={t.dir}>
```

---

## 11. Footer — القواعد الثابتة

```tsx
// ✓ حقل البريد الإلكتروني
<input type="email" placeholder={t.emailPlaceholder || 'email@example.com'} />

// ✓ store prop يُمرر دائماً
<Footer store={store} />

// ✓ Privacy/Terms/Cookies تستقبل store
export function Privacy({ store }: { store: any }) { ... }
```

### روابط سريعة / قانوني — عمودان منفصلان، لا عمود واحد

**المشكلة:** بعض الثيمات تجمع كل الروابط (الرئيسية، السلة، اتصل بنا، الخصوصية، الشروط، الكوكيز) تحت عمود واحد اسمه "روابط سريعة" — يصبح طويلاً وغير منظّم بصرياً، ولا يتماشى مع بقية الثيمات في المشروع.

```tsx
// ✗ خطأ — كل الروابط الستة في مصفوفة وعمود واحد
const links = [
  { h: '/', l: t.home }, { h: '/cart', l: t.cart }, { h: '/contact', l: t.contact },
  { h: '/privacy', l: t.privacy }, { h: '/terms', l: t.terms }, { h: '/cookies', l: t.cookies },
];
// عمود واحد بعنوان t.quickLinks يعرض كل الستة

// ✓ صحيح — قسّمها لمصفوفتين وعمودين منفصلين
const links = [
  { h: '/', l: t.home }, { h: '/cart', l: t.cart }, { h: '/contact', l: t.contact },
].filter((lnk) => lnk.h !== '/cart' || store?.cart !== false);

const legalLinks = [
  { h: '/privacy', l: t.privacy }, { h: '/terms', l: t.terms }, { h: '/cookies', l: t.cookies },
];
```

```tsx
// ✓ عمودان منفصلان في الـ JSX — كل عمود بعنوانه الخاص
<div>
  <p className="foot-heading">{t.quickLinks}</p>
  {links.map((l) => <Link key={l.h} href={l.h}>{l.l}</Link>)}
</div>

<div>
  <p className="foot-heading">{t.legalNav}</p>
  {legalLinks.map((l) => <Link key={l.h} href={l.h}>{l.l}</Link>)}
</div>
```

**مفتاح ترجمة مطلوب:** أضف `legalNav` لكل من ar/fr/en إن لم يكن موجوداً (`'قانوني'` / `'Légal'` / `'Legal'`) — بجانب `quickLinks` الموجود مسبقاً.

**شبكة الفوتر:** إن كان الفوتر يستخدم CSS grid بعدد أعمدة ثابت (مثل `grid-template-columns: 1.4fr 1fr 1fr`)، حدّثه ليستوعب عموداً إضافياً (مثال: `1.3fr 1fr 1fr 1fr`)، وأضف breakpoint متوسط (`~640px`) بعمودين قبل الانتقال للعرض الكامل على `768px` — حتى لا يضيق العمود الرابع فجأة.

---

## 12. Trust Items — نمطان مقبولان

```ts
// نمط 1: inline في JSON
trust: [
  { title: 'شحن سريع', desc: 'خلال 24-48 ساعة' },
  ...
]
// الاستخدام:
const trustIcons = [Truck, Shield, Zap, Headphones];
t.trust.map((item, i) => { const Icon = trustIcons[i]; ... })

// نمط 2: مفاتيح منفصلة
trust1Title: '...', trust1Desc: '...'
// أقل مرونة، تجنبه في الثيمات الجديدة
```

---

## 13. Bundle Command

بعد كل تعديل على ثيم:

```bash
node scripts/bundle-themes.mjs --slug=<theme-slug>
```

مثال:
```bash
node scripts/bundle-themes.mjs --slug=ecom-commercial-fast-response-theme
node scripts/bundle-themes.mjs --slug=gaming-esports-epic-store-theme
```

للـ bundle الكامل (كل الثيمات):
```bash
node scripts/bundle-themes.mjs
```

---

## 14. خصائص CSS الاتجاهية — Logical vs Physical

| الخاصية | Logical (يتأثر بـ BiDi) | Physical (لا يتأثر) |
|---------|------------------------|---------------------|
| المحاذاة | `textAlign: 'start'` | `textAlign: 'left'` أو `'right'` |
| الهامش | `marginInlineStart` | `marginLeft` / `marginRight` |
| الـ padding | `paddingInlineStart` | `paddingLeft` / `paddingRight` |
| الموضع | `insetInlineStart` | `left` / `right` |

**القاعدة:** في الثيمات متعددة اللغات، فضّل الـ Logical للـ RTL/LTR الطبيعي، واستخدم Physical لتجاوز BiDi عند الضرورة.

---

## 15. قائمة تحقق قبل الـ Bundle

- [ ] كل مفاتيح JSON موجودة في ar/fr/en (أو كـ fallback)
- [ ] `dir` صحيح في كل JSON (`'rtl'` للعربي، `'ltr'` للفرنسي/الإنجليزي)
- [ ] Hero container له `width: '100%'` إذا كان داخل flex section
- [ ] نصوص Hero تستخدم `textAlign` فيزيائي (ليس 'start')
- [ ] `store` prop يُمرر لـ Navbar, Footer, Privacy, Terms, Cookies, Contact
- [ ] لا يوجد JSX comment داخل `&& ()`
- [ ] لا يوجد `cite` attribute مرئي
- [ ] لا يوجد `direction: rtl` hardcoded في CSS للـ search
- [ ] لا يوجد تعارض في اسم `t` (setTimeout, .map param)
- [ ] Variant filtering: `available` مطبق على onClick + opacity/cursor + textDecoration
- [ ] Image attr: يفحص `v.value` و `v.name` معاً للـ URL
- [ ] أزرار slider تستخدم أيقونات RTL-aware (انظر §16) — ليس ChevronLeft ثابت لـ prev
- [ ] Success redirect يستخدم `/successfully?productId=...` بدون domain في المسار (انظر §17)
- [ ] Color swatches تفحص URL وتعرض `<img>` بدلاً من `background:` (انظر §18)
- [ ] لا يوجد `gridTemplateColumns` inline يتغلب على media query للـ 2-column layout
- [ ] الـ quantity stepper في `ProductForm` يُخفى/يُقفل على 1 إذا `store.supportQty === false` (انظر §19)
- [ ] `Cart` لا يحتوي أي أزرار +/- لتعديل الكمية إطلاقاً — كمية كل عنصر تُعرض كنص ثابت `× {item.quantity}` بغض النظر عن `supportQty` (انظر §19)
- [ ] شارة "شحن مجاني" تحسب الأولوية الصحيحة: offer.shippingFree > product.shippingFree > عتبة store (انظر §19)
- [ ] `wilayas.find(...)` يقارن بـ `String(w.id) === String(fd.customerWelaya)` — ليس `===` مباشرة (انظر §20)
- [ ] `getLiv()`/الحساب النهائي يحوّل نتيجة livraisonHome/livraisonOfice إلى رقم بـ `Number(...)` أو `+` — القيم القادمة من الـ API نصوص (انظر §20)
- [ ] `getLiv()` في كل من ProductForm وCart تُرجع `0` فعلياً عند تحقق الشحن المجاني — ليس فقط شارة نصية (انظر §19 ⚠️)
- [ ] كل مكان يعرض `selW.livraisonHome`/`livraisonOfice` مباشرة (أزرار home/office) يعرض `t.freeShippingBadge` بدل السعر الخام عند تحقق الشحن المجاني
- [ ] `offer.subTitle` يُعرض تحت اسم العرض إذا موجود (انظر §19)
- [ ] `export function Success({ store, order }: ...)` موجود في الملف — تحقق بـ `grep -L "export function Success" src/theme/*.tsx` (انظر §22)
- [ ] الفوتر: "روابط سريعة" و"قانوني" عمودان منفصلان (لا مصفوفة واحدة تجمع الستة روابط) — تحقق من وجود `t.legalNav` (انظر §11)
- [ ] منتج رقمي (`product.isDigital`): لا شحن، لا كمية، لا زر سلة، زرّا تبديل بريد/واتساب (مفتاح البريد `orderEmail` وليس `email`) (انظر §23)
- [ ] سطر "السعر" في ملخص الطلب يعرض السعر الفعلي (`fp`)، ليس اسم المنتج — خطأ نسخ-ولصق شائع في هذه العائلة من الثيمات (انظر §23)
- [ ] تم تشغيل `node scripts/bundle-themes.mjs --slug=<name>`

---

## 16. Slider Arrow RTL Fix

### المشكلة

`insetInlineStart` يقلب **موضع** الزر تلقائياً في RTL، لكنه لا يقلب **الأيقونة**. النتيجة: الأيقونة تشير لليسار وهي في الجانب الأيسر RTL = خطأ منطقي (يجب أن تشير لليمين).

```tsx
// ✗ خطأ — ChevronLeft ثابت يظهر معكوساً في العربية
<button style={{ insetInlineStart: 10 }}><ChevronLeft size={20} /></button>
<button style={{ insetInlineEnd: 10 }}><ChevronRight size={20} /></button>
```

### الحل: تبديل الأيقونة حسب `t.dir`

```tsx
// ✓ prev button (insetInlineStart = يمين في RTL)
<button style={{ position: 'absolute', top: '50%', insetInlineStart: 10 }}>
  {t.dir === 'rtl' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
</button>

// ✓ next button (insetInlineEnd = يسار في RTL)
<button style={{ position: 'absolute', top: '50%', insetInlineEnd: 10 }}>
  {t.dir === 'rtl' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
</button>
```

### نمط ArrowRight بالـ Rotation (Cosmetics-luxe وما شابهه)

```tsx
// ✓ prev — ArrowRight مقلوب 180° = سهم يسار، في RTL لا تقلبه
<button className="luxe-gallery-prev">
  <ArrowRight size={20} style={{ transform: t.dir === 'rtl' ? 'none' : 'rotate(180deg)' }} />
</button>

// ✓ next — ArrowRight طبيعي = سهم يمين، في RTL اقلبه
<button className="luxe-gallery-next">
  <ArrowRight size={20} style={{ transform: t.dir === 'rtl' ? 'rotate(180deg)' : 'none' }} />
</button>
```

### نمط Physical Positions (لا يحتاج إصلاح)

```tsx
// ✓ هذا النمط صحيح بالفعل — right + ChevronRight للـ prev
<button style={{ right: 10 }}><ChevronRight size={20} /></button>
<button style={{ left: 10 }}><ChevronLeft size={20} /></button>
```

---

## 17. Success URL Redirect Fix

### المشكلة

```tsx
// ✗ خطأ — يُنشئ URL مكرر: https://sido.mdstore.top/sido.mdstore.top/successfully
router.push(`/${domain}/successfully`)
window.location.href = `/${domain}/successfully`
router.push(`/lp/${domain}/successfully`)
```

### الحل

```tsx
// ✓ مسار نسبي بدون domain
router.push(`/successfully?productId=${product?.id}`)
window.location.href = `/successfully?productId=${product?.id}`
```

لماذا؟ `domain` (مثل `sido.mdstore.top`) هو اسم النطاق وليس مقطعاً في المسار. الـ Next.js router يُضيفه ضمن hostname تلقائياً فيُصبح مكرراً.

---

## 18. Color Swatch Image URL Detection

### المشكلة

```tsx
// ✗ خطأ — `background: 'https://...'` غير صالح كقيمة CSS
<span style={{ background: v.value }} />
// النتيجة: لا يظهر لون ولا صورة
```

### الحل

```tsx
// ✓ افحص إذا كانت القيمة URL واعرض <img> بدلاً من background
{/^https?:\/\//.test(v.value)
  ? <img
      src={v.value}
      alt={v.name || v.value}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  : <span style={{ width: '100%', height: '100%', background: v.value, display: 'block' }} />
}
```

### إضافة: الزر يحتاج عرضاً ثابتاً ليكون مربعاً

```tsx
// إذا كان الـ CSS class يعطي `min-width: 48px` فقط، أضف width ثابت:
style={{
  width: 48,   // أو 46 حسب الـ CSS class
  height: 48,
  cursor: available ? 'pointer' : 'not-allowed',
  opacity: available ? 1 : 0.35,
}}
```

### لا تعرض قيمة variant كـ text في label

```tsx
// ✗ خطأ — قد يظهر URL طويل في الـ label
{attr.name}: <span>{selectedVariants?.[attr.name]}</span>

// ✓ إما اعرض فقط اسم الـ variant
{attr.name}: <span>{attr.variants?.find(v => v.value === selectedVariants?.[attr.name])?.name}</span>

// ✓ أو لا تعرض القيمة المختارة أبداً
{attr.name}
```

---

## 19. حقول جديدة على store / product / offer (Qty Support & Free Shipping)

أُضيفت هذه الحقول من الـ API (2026-08-22). كلها اختيارية عند القراءة — إذا كان الثيم لا يتعامل معها، يبقى يعمل بسلوكه القديم (fallback للقيم الافتراضية أدناه).

| الكائن | الحقل | النوع | Default | المعنى |
|--------|-------|-------|---------|--------|
| `store` | `supportQty` | `boolean` | `true` | هل يظهر selector للكمية في `ProductForm`/`Details`، أم تُقفل الكمية على 1 |
| `store` | `supportFreeShipping` | `boolean` | `false` | هل يفعّل المتجر عتبة شحن مجاني عامة |
| `store` | `freeShippingMinAmount` | `number \| null` | `null` | الحد الأدنى لسلة المشتريات (بعملة المتجر) ليصبح الشحن مجانياً |
| `product` | `shippingFree` | `boolean` | `false` | هذا المنتج بالذات يشحن مجاناً دائماً، بغض النظر عن عتبة المتجر |
| `offer` (داخل `product.offers[]`) | `subTitle` | `string?` | — | نص فرعي/وصف قصير للعرض، يُعرض تحت اسم العرض |
| `offer` (داخل `product.offers[]`) | `shippingFree` | `boolean` | `false` | هذا العرض (bundle) بالذات يشحن مجاناً إذا اختاره المستخدم |

### Qty Selector — إخفاء/تعطيل حسب `store.supportQty`

```tsx
// ✓ إذا كان false — لا تعرض stepper الكمية، وارسل quantity = 1 دائماً
const supportQty = store?.supportQty ?? true;

{supportQty ? (
  <div className="qty-stepper">
    <button onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
    <span>{qty}</span>
    <button onClick={() => setQty(q => q + 1)}>+</button>
  </div>
) : null}

// عند الإرسال:
const finalQty = supportQty ? qty : 1;
```

> **⚠️ قرار تصميم مؤكَّد من صاحب المشروع (2026-08-23): لا تُعدَّل الكمية من صفحة `Cart` إطلاقاً.** الكمية تُختار فقط في `ProductForm` قبل الإضافة للسلة؛ بمجرد أن يصبح العنصر في السلة، تُعرض كميته كنص ثابت `× {item.quantity}` بدون أي أزرار +/-، **بغض النظر عن قيمة `store.supportQty`** (لا تشرط هذا بـ supportQty، فهو يتحكم فقط بـ stepper `ProductForm`).
>
> إذا وجدت في ثيم قديم أزرار +/- داخل `Cart` تُعدّل `item.quantity`/`n[i].quantity` مباشرة (`Math.max(1, item.quantity - 1)` أو ما شابه، غالباً مع دالة مساعدة اسمها `changeQty`) — **احذفها بالكامل** (الأزرار + أي دالة `changeQty` تصبح غير مستخدَمة) واستبدلها بنص ثابت:
> ```tsx
> // ✗ احذف أي شيء بهذا الشكل من Cart
> <button onClick={() => changeQty(i, -1)}>-</button>
> <span>{item.quantity}</span>
> <button onClick={() => changeQty(i, 1)}>+</button>
>
> // ✓ استبدله بهذا فقط
> <span>× {item.quantity}</span>
> ```
> ثيمات كثيرة تعرض `item.quantity` كنص ثابت أصلاً في الـ Cart (بلا أزرار) — هذه صحيحة كما هي ولا تحتاج تعديلاً. ابحث أولاً قبل افتراض وجود المشكلة.

### شارة/عتبة الشحن المجاني — أولوية الحساب

الترتيب الصحيح للفحص (الأخص أولاً):

1. إذا كان هناك عرض (offer) محدد وله `shippingFree === true` → شحن مجاني.
2. وإلا إذا كان `product.shippingFree === true` → شحن مجاني.
3. وإلا إذا `store.supportFreeShipping === true` و`store.freeShippingMinAmount` محدد ومجموع السلة `>= freeShippingMinAmount` → شحن مجاني.
4. غير ذلك → شحن عادي (يُحسب حسب الولاية/البلدية كالمعتاد).

> **⚠️ الأهم — لا تكتفِ بشارة نصية:** عرض شارة "🚚 شحن مجاني" وحدها بدون تصفير سعر التوصيل الفعلي **لا يعني شيئاً للزبون** — سيظل يُحاسَب على سعر الولاية/البلدية كالمعتاد. يجب أن يُطبَّق نفس فحص الأولوية أعلاه **داخل `getLiv()`** (في كل من `ProductForm` و`Cart`) بحيث تُرجع الدالة `0` عندما يتحقق الشحن المجاني، وليس فقط في نص العرض. هذا الخطأ حدث فعلياً في أول ثيم عُدِّل (`animal-pet-lovers-paradise.tsx`) — الشارة كانت تظهر لكن التوصيل بقي محسوباً بالسعر الكامل في المجموع والطلب المُرسَل فعلياً.

```tsx
// ✓ ProductForm — orderFreeShipping يُحسب على مستوى هذا الطلب (fp * qty)، وليس على مستوى السلة كلها
const selOffer = product.offers?.find((o: any) => o.id === selectedOffer);
const storeInfo = storeprop || product.store;
const orderFreeShipping = !!(product.shippingFree || selOffer?.shippingFree ||
  (storeInfo?.supportFreeShipping && storeInfo?.freeShippingMinAmount != null &&
   (fp * qty) >= Number(storeInfo.freeShippingMinAmount)));

const getLiv = useCallback((): number => {
  if (orderFreeShipping) return 0;
  if (!selW) return 0;
  return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice;
}, [selW, fd.typeLivraison, orderFreeShipping]);
```

```tsx
// ✓ Cart — freeShippingReached يُحسب على مجموع السلة (cartTotal)، ويُستخدم أيضاً داخل getLiv()
const hasFreeShippingItem = items.some(i =>
  i.product?.shippingFree || i.product?.offers?.find((o: any) => o.id === i.selectedOffer)?.shippingFree
);
const freeShippingMin = store?.supportFreeShipping ? store?.freeShippingMinAmount : null;
const freeShippingReached = hasFreeShippingItem || (freeShippingMin != null && cartTotal >= Number(freeShippingMin));

const getLiv = () => {
  if (freeShippingReached) return 0;
  if (!selW) return 0;
  return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice;
};
```

بما أن `total()`/`finalTotal` و`priceLivraison` المُرسَلة في `axios.post(.../orders/create, ...)` تعتمد جميعها على `getLiv()`، فإن تصفيرها هناك وحده كافٍ لتصحيح كل مكان آخر يعرض أو يرسل سعر التوصيل تلقائياً — **باستثناء** أي مكان يعرض `selW.livraisonHome`/`livraisonOfice` مباشرة (مثل أزرار اختيار "توصيل للبيت/للمكتب" التي تعرض سعر كل خيار قبل اختياره) — هذه تحتاج فحصاً يدوياً منفصلاً لعرض `t.freeShippingBadge` بدل السعر الخام. ابحث عن كل تكرار لـ `selW.livraisonHome` و`selW.livraisonOfice` في كل من `ProductForm` و`Cart` وتأكد من تغطيتها.

```tsx
function isShippingFree({
  store, product, selectedOffer, cartTotal,
}: { store: any; product?: any; selectedOffer?: any; cartTotal: number }) {
  if (selectedOffer?.shippingFree) return true;
  if (product?.shippingFree) return true;
  if (store?.supportFreeShipping && store?.freeShippingMinAmount != null) {
    return cartTotal >= Number(store.freeShippingMinAmount);
  }
  return false;
}
```

```tsx
// ✓ شارة على بطاقة/تفاصيل المنتج (لا تحتاج cartTotal — فحص على مستوى المنتج فقط)
{(product?.shippingFree) && (
  <span className="free-shipping-badge">{t.freeShippingBadge || '🚚 توصيل مجاني'}</span>
)}

// ✓ progress bar في الـ Cart نحو عتبة الشحن المجاني على مستوى المتجر
{store?.supportFreeShipping && store?.freeShippingMinAmount != null && (
  (() => {
    const remaining = Number(store.freeShippingMinAmount) - cartTotal;
    return remaining > 0 ? (
      <p className="free-shipping-hint">
        {t.freeShippingRemaining
          ? t.freeShippingRemaining.replace('{{amount}}', String(remaining))
          : `أضف ${remaining} ${currency} أخرى للحصول على توصيل مجاني`}
      </p>
    ) : (
      <p className="free-shipping-reached">{t.freeShippingReached || '🎉 حصلت على توصيل مجاني!'}</p>
    );
  })()
)}
```

> **ملاحظة i18n:** أضف مفاتيح `freeShippingBadge`, `freeShippingRemaining` (بها `{{amount}}`), `freeShippingReached` إلى ملفات الترجمة الثلاث إذا استخدمتها — ليست إلزامية بعد ضمن §2، فاستخدم fallback نصي كما بالمثال أعلاه إذا لم تُضف.
>
> **⚠️ اختيار الكلمة (تعديل 2026-08-23):** في النص المعروض للزبون استخدم "**توصيل مجاني**" في العربية (وليس "شحن مجاني")، و"**Free Delivery**" في الإنجليزية (وليس "Free shipping")، والفرنسية تبقى "**Livraison gratuite**" كما هي (لا تغيير). هذا يخص فقط نصوص الشارة/الرسائل الأربعة (`freeShippingBadge/Threshold/Remaining/Reached`) — لا يخص كلمة "shipping" في سياقات أخرى غير متعلقة (مثل مسار API `/shipping/...` أو نصوص "confirmed by phone before shipping" في صفحة الشروط، والتي تبقى دون تغيير).

### عرض `offer.subTitle`

```tsx
// ✓ تحت اسم العرض مباشرة، اختياري
<div className="offer-card">
  <span className="offer-name">{offer.name}</span>
  {offer.subTitle && <span className="offer-subtitle">{offer.subTitle}</span>}
  {offer.shippingFree && (
    <span className="offer-shipping-free-tag">{t.freeShippingBadge || '🚚'}</span>
  )}
</div>
```

---

## 20. عطلان الشحن — نوعان من الأخطاء الحقيقية اكتُشفا أثناء الاختبار الفعلي (2026-08-23)

هذان الخطآن **موجودان مسبقاً في عدد كبير من الثيمات القديمة** (ليسا ناتجَين عن التعديلات في §19) — لكنهما يُصلحان بسهولة أثناء المرور على كل ثيم لإضافة حقول §19، فطبّقهما كلما وجدتهما.

### 20.1 — مقارنة `wilaya.id` بدون `String()` → التوصيل يبقى دائماً 0

```tsx
// ✗ خطأ — w.id رقم قادم من الـ API، fd.customerWelaya نص دائماً (من <select> value)
// 3 === "3" ← false في JS، فلا تُطابَق أي ولاية أبداً مهما اختار الزبون
const w = wilayas.find((x) => x.id === fd.customerWelaya);

// ✓ صحيح
const w = wilayas.find((x) => String(x.id) === String(fd.customerWelaya));
```

**الأثر:** `getLiv()` يدخل دائماً في فرع `if (!w) return 0` — التوصيل يظهر 0 دج ثابتاً بغض النظر عن الولاية المختارة، وهذا **يُشبه تماماً** أثر خطأ الشحن المجاني في §19 (نفس العرض المرئي: "0 دج")، لكنه خطأ مختلف تماماً وغير متعلق بـ `shippingFree`. لا تفترض أن التوصيل=0 يعني بالضرورة مشكلة في منطق الشحن المجاني — تحقق من أن `selW`/`w` يُطابَق فعلاً أولاً (أضف نقطة تحقق: هل تتغير قيمة التوصيل إطلاقاً عند تغيير الولاية؟ إن لم تتغير أبداً حتى بلا شحن مجاني مفعّل، فالمشكلة في المطابقة لا في §19).

### 20.2 — جمع `getLiv()` بدون تحويل رقمي → Total يصبح دمج نصوص

```tsx
// ✗ خطأ — livraisonHome/livraisonOfice تُرجَع من الـ API كنصوص ("600.00" وليس 600)
// رغم أن TS type يقول number! (كذبة على مستوى النوع، القيمة الفعلية string وقت التشغيل)
// fp * qty (رقم) + getLiv() (نص) === "5400" + "600.00" === "5400600.00" (دمج نصوص، ليس جمعاً!)
const total = () => fp * qty + getLiv();

// ✓ الأصلح — صحّح عند المصدر داخل getLiv() نفسها، يُصلح كل الاستخدامات اللاحقة دفعة واحدة
const getLiv = (): number => {
  if (orderFreeShipping) return 0;
  const w = wilayas.find((x) => String(x.id) === String(fd.customerWelaya));
  if (!w) return 0;
  return Number(fd.typeLivraison === 'home' ? w.livraisonHome : w.livraisonOfice);
};

// ✓ بديل مقبول إن كانت getLiv تُستخدم في أماكن كثيرة ولا تريد تعديلها: أجبر التحويل عند الجمع
const total = () => fp * qty + +getLiv();          // unary + يحوّل النص لرقم
const total = () => Number(fp) * Number(qty) + Number(getLiv()); // أو صريح بالكامل
```

**كيف تكتشفه بسرعة:** افتح نموذج الطلب، اختر ولاية، وانظر لرقم الـ Total — إذا ظهر شيء مثل `5400600.00` بدل `6000.00` (يبدو وكأن الرقمين *التصقا* ببعض بدل أن يُجمعا)، فهذا هو الخطأ بالضبط. ابحث في الملف عن كل تعريف لـ `const total = () => ...` وتأكد أنه يستخدم إما `+getLiv()` (unary plus) أو `Number(getLiv())` — وليس `+ getLiv()` بدون تحويل.

**النطاق:** هذا الخطأ ليس في كل الثيمات — بعضها كان يستخدم `+getLiv()` أو `Number(...)` مسبقاً وهو سليم. تحقق دائماً عند كل ثيم بدل افتراض وجوده أو غيابه.

### قائمة تحقق إضافية (أضِفها لقائمة §15 عند العمل على أي ثيم قديم)

- [ ] `wilayas.find(...)` يقارن بـ `String(...)` على الطرفين
- [ ] كل تعريف لـ `const total = () => ...` يحوّل `getLiv()` لرقم قبل الجمع (`+getLiv()` أو `Number(getLiv())`)
- [ ] نفس الفحص يتكرر في كل من `ProductForm` **و** `Cart` — كل منهما له `getLiv`/`total` مستقلان

---

## 21. صفحات Static إضافية (`additionalPages`) — خارج الأربع الأساسية

### الفكرة

كل ثيم يدعم أربع صفحات static أساسية عبر `StaticPage`: `privacy` / `terms` / `cookies` / `contact`. إذا احتاج ثيم معيّن صفحة إضافية (مثل "من نحن"، "الشحن والتوصيل"، "الأسئلة الشائعة")، أضِفها بنفس الآلية **بدون أي تعديل على بنية المتجر الحقيقي**:

1. أضف branch جديد داخل `StaticPage` لهذا الـ slug.
2. صدّر export اختياري باسم `additionalPages` يصف اسم/رابط كل صفحة إضافية — تقرأه أداة معاينة الثيم `/show/[theme]` تلقائياً لعرضها في الـ sidebar.

### مسار الصفحة الحقيقي — لا تغيير مطلوب

`src/app/[domain]/(store)/[page]/page.tsx` يقبل أي slug ديناميكياً ويمرره لـ `StaticPage` مباشرة. أي صفحة تضيفها بهذه الطريقة تعمل فوراً على `/{domain}/<slug>` في الإنتاج الحقيقي — الراوت المشترك لا يحتاج أي تعديل.

### التطبيق داخل الثيم

```tsx
// 1) component جديد بنفس نمط Privacy/Terms/Cookies (يعيد استخدام Shell/InfoBlock إن وُجدا في الملف)
export function About({ store }: { store?: any }) {
  const lang = getLang(store); const t = T[lang]; const pg = t.pages.about;
  return (
    <Shell title={pg.title} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: 14, border: '1.5px solid #E8E8E8' }}>
        {pg.blocks.map((b, i) => <InfoBlock key={i} title={b.title} body={b.body} />)}
      </div>
    </Shell>
  );
}

// 2) سجّله داخل StaticPage
export function StaticPage({ staticPage, page, store }: any) {
  const p = (staticPage || page || '').toLowerCase();
  return (
    <>
      {p === 'privacy' && <Privacy store={store} />}
      {p === 'terms' && <Terms store={store} />}
      {p === 'cookies' && <Cookies store={store} />}
      {p === 'contact' && <Contact store={store} />}
      {p === 'about' && <About store={store} />}   {/* ← جديد */}
    </>
  );
}

// 3) صدّر additionalPages — name لكل لغة + link (المسار الحقيقي، بدون domain)
export const additionalPages = [
  { name_ar: 'من نحن', name_fr: 'À propos de nous', name_en: 'About Us', link: '/about' },
];
```

### الترجمة (إن استُخدم نمط `t.pages.*`)

```ts
// أضف مفتاح pages.about لكل من jsonAr/jsonFr/jsonEn — إلزامي إذا كان T مُعرَّفاً
// Record<Lang, typeof jsonAr> بدون as any (فحص TS بنيوي حقيقي، وإلا TS2741)
pages: {
  privacy: { title: '...', blocks: [...] },
  terms:   { title: '...', blocks: [...] },
  cookies: { title: '...', blocks: [...] },
  about: {
    title: 'من نحن',
    blocks: [{ title: '...', body: '...' }],
  },
},
```

### كيف تقرأها أداة المعاينة `/show/[theme]`

`src/app/show/[theme]/PreviewClient.tsx` يجلب `additionalPages` تلقائياً عند تحميل الثيم عبر `loadThemeModule(bundleUrl)` — export مساعد في `src/components/ThemeRunner.tsx` (شارك نفس الـ cache مع `ThemeRunner` العادي، لكنه يُرجع كل exports الحزمة الخام بدل مكوّن واحد فقط). النتيجة تُضاف كأزرار تحت قسم "صفحات إضافية" في الـ sidebar، والاسم المعروض يتغيّر حسب اللغة المختارة (`name_ar`/`name_fr`/`name_en`).

> **اختياري تماماً:** ثيم بلا `additionalPages` export يستمر بالعمل عادياً (fallback لمصفوفة فارغة، لا شيء يُعرض في القسم). أضِف هذا التصدير فقط للثيمات التي تحتاج فعلاً صفحات إضافية غير الأربع الأساسية — **لا تُضِف export فارغ لكل الثيمات دفعاً للعادة**.
>
> **لا حاجة لتعديل أداة المعاينة عند إضافة صفحة جديدة لثيم** — فقط أضف/عدّل `additionalPages` داخل ملف الثيم نفسه، وستظهر في الـ sidebar تلقائياً بعد `bundle-themes.mjs`.

### مثال حي مطبَّق

`color-electric-blue-rush-theme.tsx` — صفحة "من نحن" (`/about`) مطبَّقة بالكامل كنموذج جاهز للنسخ (component + StaticPage branch + ترجمة 3 لغات + `additionalPages`).

### قائمة تحقق إضافية (فقط إذا أضفت additionalPages لثيم)

- [ ] الـ component الجديد مُسجَّل داخل `StaticPage` بنفس الـ slug الموجود في `link`
- [ ] `link` يبدأ بـ `/` ولا يحتوي `domain` (نفس قاعدة §17)
- [ ] إذا استُخدم `t.pages.*`، أُضيف مفتاح الصفحة الجديدة لكل من ar/fr/en
- [ ] `additionalPages` يحتوي `name_ar` + `name_fr` + `name_en` + `link` لكل عنصر (وليس `name` مفرد)
- [ ] تم تشغيل `node scripts/bundle-themes.mjs --slug=<name>` بعد الإضافة

---

## 22. `Success` — صفحة نجاح الطلب (export إلزامي)

### السياق

بعد إرسال الطلب، الزبون يصل لصفحة `/success` (الوصول الفعلي عبر `/successfully` الذي يعيد التوجيه إليها — انظر §17). هذه الصفحة (`src/app/[domain]/(store)/success/page.tsx`) لا ترسم أي HTML خاص بها — تفوّض كل العرض للثيم عبر `ThemeRunner`:

```tsx
// src/app/[domain]/(store)/success/page.tsx
<ThemeRunner
  bundleUrl={`/api/themes/${slug}`}
  exportName="Success"
  themeProps={{ store, domain, order }}
/>
```

`order` يُقرأ من `localStorage.getItem('last_order')` (JSON اختياري بحقول مثل `productName`, `total`, `id`) — قد يكون `null` إذا لم يوجد طلب مخزَّن. **أي ثيم لا يُصدِّر `Success` تنكسر صفحة نجاح الطلب لديه بالكامل** (خطأ من `ThemeRunner`: الـ export غير موجود في الحزمة).

### التوقيع المطلوب

```tsx
export function Success({ store, order }: { store: any; domain?: string; order?: any }) {
  const t = T[getLang(store)];
  const currency = store?.currency || 'DZD';
  // ...
}
```

### البنية القياسية (4 أجزاء)

```tsx
export function Success({ store, order }: { store: any; domain?: string; order?: any }) {
  const t = T[getLang(store)];
  const currency = store?.currency || 'DZD';
  const stepIcons = [CheckIcon, Phone, Package, Truck]; // استخدم الأيقونات المستوردة أصلاً في الملف

  return (
    <div dir={t.dir}>
      {/* 1) بطاقة تأكيد مركزية */}
      <div>
        <CheckIcon /* أو ما يعادلها في الملف */ />
        <h1>{t.successTitle}</h1>
        <p>{t.successDesc}</p>
      </div>

      {/* 2) معلومات الطلب — اختياري، فقط إذا order موجود وله بيانات */}
      {order && (order.productName || order.total != null) && (
        <div>
          <p>{t.orderInfo}</p>
          {order.productName && <div>{order.productName}</div>}
          {order.total != null && (
            <div><span>{t.total}</span><span>{fmt(order.total, currency)}</span></div>
          )}
        </div>
      )}

      {/* 3) خطوات ما بعد الطلب — 4 عناصر، الأولى "مكتملة" بصرياً */}
      <div>
        {t.successSteps.map((step, i) => {
          const done = i === 0;
          const Icon = stepIcons[i] ?? stepIcons[0];
          return (
            <div key={i} style={{ /* خلفية/لون مميز إذا done */ }}>
              <Icon />
              <p>{step.title}</p>
              <p>{step.desc}</p>
            </div>
          );
        })}
      </div>

      {/* 4) أزرار — بدون domain في المسار (نفس §17) */}
      <Link href="/">{t.shopNow}</Link>
      <Link href="/">{t.backToShop}</Link>
    </div>
  );
}
```

### مفاتيح i18n المطلوبة (أضِفها لكل من ar/fr/en)

`successTitle`, `successDesc`, `backToShop`, `shopNow` غالباً موجودة مسبقاً (تُستخدم أيضاً في `Cart`/`ProductForm`). الجديد المطلوب فقط لهذه الصفحة:

```ts
orderInfo: 'معلومات الطلب',
successSteps: [
  { title: 'تم استلام طلبك', desc: 'تم تسجيل طلبك بنجاح في نظامنا' },
  { title: 'تأكيد الطلب', desc: 'سنتصل بك خلال 24 ساعة' },
  { title: 'التجهيز والتغليف', desc: 'يتم تجهيز طلبك بعناية' },
  { title: 'الشحن والتوصيل', desc: '2-5 أيام عمل' },
],
```

```ts
// fr
orderInfo: 'Informations de commande',
successSteps: [
  { title: 'Commande reçue', desc: 'Votre commande a été enregistrée avec succès' },
  { title: 'Confirmation', desc: 'Nous vous appellerons sous 24h' },
  { title: 'Préparation', desc: 'Votre commande est préparée avec soin' },
  { title: 'Livraison', desc: '2-5 jours ouvrables' },
],

// en
orderInfo: 'Order Info',
successSteps: [
  { title: 'Order received', desc: 'Your order has been registered successfully' },
  { title: 'Confirmation', desc: "We'll call you within 24 hours" },
  { title: 'Packaging', desc: 'Your order is being prepared with care' },
  { title: 'Shipping', desc: '2-5 business days' },
],
```

### كيف تكتشف ثيماً ناقصاً

```bash
grep -L "export function Success" src/theme/*.tsx
```

كل ملف يظهر في النتيجة يفتقد هذا الـ export ويجب إكماله بنفس البنية أعلاه، مع تكييف الألوان/الأيقونات على تصميم الثيم الخاص به (استخدم `Styles`/CSS classes الموجودة في الملف بدل ابتكار نمط جديد).

### مثال حي مطبَّق

`auto-everyday-auto-essentials-theme.tsx` — كان الثيم الوحيد من بين كل الثيمات يفتقد `Success` (اكتُشف بأمر الـ grep أعلاه وأُصلح في 2026-08-26). للنمط المرجعي الكامل انظر `Success` في `sport-urban-fitness-running-theme.tsx` أو في نفس الملف بعد إصلاحه.

### قائمة تحقق إضافية

- [ ] `export function Success({ store, order }: ...)` موجود في الملف
- [ ] `t.orderInfo` و `t.successSteps` (4 عناصر `{title, desc}`) مضافة لـ ar/fr/en
- [ ] لا استيراد أيقونات جديدة إذا كانت موجودة أصلاً في الملف — أعد استخدام ما هو مستورد (Check/CheckCircle2, Phone, Package, Truck أو ما يعادلها)
- [ ] الزرّان (`shopNow`/`backToShop`) يوجّهان لـ `/` بدون domain (نفس قاعدة §17)
- [ ] تم تشغيل `node scripts/bundle-themes.mjs --slug=<name>` والتحقق من محتوى S3 المرفوع فعلياً

---

## 23. منتج رقمي (`product.isDigital`) — لا شحن، الزائر يختار بريد إلكتروني أو واتساب بدل عنوان

أُضيف هذا الحقل من الـ API (2026-09-01). اختياري عند القراءة، `false` افتراضياً — إذا كان الثيم لا يتعامل معه، يبقى يعمل بسلوكه القديم (كل منتج يُعامَل كمنتج عادي).

**تحديث 2026-09-01:** التصميم الأولي كان بريد إلكتروني فقط. تم تغييره لاحقاً بطلب من المستخدم — الزائر يختار بين البريد أو رقم واتساب عبر **زرّي تبديل بسيطين** (بريد / واتساب)، وليس بريداً إلزامياً. السبب: بعض الزوار يفضّلون واتساب على البريد للتواصل السريع. الأمثلة أدناه تعكس هذا التصميم النهائي.

### الفكرة

`product.isDigital === true` يعني: لا يوجد شحن فعلي لهذا المنتج (رخصة/ملف/اشتراك، وليس سلعة تُشحَن). هذا يُغيّر `ProductForm` وحده — **`Cart` لا يحتاج أي تعديل إطلاقاً**، لأن منتجاً رقمياً لا يدخل السلة أصلاً (انظر التبرير أدناه):

| العنصر | سلوك عادي | سلوك `isDigital: true` |
|--------|-----------|------------------------|
| حقول الشحن (ولاية/بلدية/نوع التوصيل) | تُعرض وتُطلَب | **تُستبدَل بالكامل** بزرّي تبديل (بريد/واتساب) + حقل واحد حسب الاختيار |
| تكلفة التوصيل | تُحسب من `getLiv()` | `0` دائماً — `getLiv()` تُرجع `0` كأول سطر |
| الكمية | stepper حسب `supportQty` | **مخفية بالكامل** (ليس فقط مقفلة على 1 كما في §19 — منتج رقمي = نسخة واحدة، لا "كمية") |
| زر "أضف للسلة" | يظهر إذا `store.cart` | **مخفي بالكامل** — لا يدخل السلة إطلاقاً |
| `Cart` | يعرض كل عناصر السلة | **بلا أي تعديل** — بما أن الزر أعلاه مخفي، منتج رقمي لا يصل إليه أبداً |

**لماذا لا يدخل السلة؟** الطلب الواحد (Order) له عميل/شحن واحد فقط في الـ backend. لا يمكن الجمع بين منتج رقمي (يحتاج بريداً إلكترونياً) ومنتج عادي (يحتاج عنواناً) في نفس الطلب — لذا منتج رقمي هو "اطلب الآن" مباشرة فقط، أبسط من محاولة دعمه داخل منطق السلة متعدد العناصر.

### التعديلات المطلوبة — كلها داخل `ProductForm` فقط

```tsx
// 1. الحقل في الـ interface
export interface Product {
  ...
  isDigital?: boolean;
}

// 2. حالة النموذج — أضف الحقلين + حالة اختيار طريقة التواصل، لا تحذف حقول الشحن (تبقى تُستخدَم للمنتج العادي)
const [fd, setFd] = useState({ ..., customerEmail: '', customerWhatsapp: '', ... });
const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp'>('email');

// 3. getLiv — أول سطر في الدالة، قبل أي فحص آخر (بما فيها الشحن المجاني §19)
const getLiv = useCallback((): number => {
  if (product.isDigital) return 0;
  if (orderFreeShipping) return 0;
  ...
}, [..., product.isDigital]);

// 4. validate — استبدال الفرع، وليس إضافة شرط فوق الموجود. تحقق حسب contactMethod المختار
const validate = () => {
  const e: Record<string, string> = {};
  if (!fd.customerName.trim()) e.customerName = t.errName;
  if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = t.errPhoneInvalid;
  if (product.isDigital) {
    if (contactMethod === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fd.customerEmail.trim())) e.customerEmail = t.errEmail;
    } else {
      if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerWhatsapp.trim())) e.customerWhatsapp = t.errWhatsapp;
    }
  } else {
    if (!fd.customerWelaya) e.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) e.customerCommune = t.errCommune;
  }
  return e;
};

// 5. handleSubmit — لا تُرسِل حقول الشحن لمنتج رقمي، ولا تُرسِل كلا حقلي التواصل معاً
//    (destructure الكل ثم spread شرطي حسب contactMethod — لا ترسل قيماً فارغة أو حقلاً غير مستخدَم)
const { customerWelaya, customerCommune, typeLivraison, priceLoss, customerEmail, customerWhatsapp, ...rest } = fd;
const payload = product.isDigital
  ? { ...rest, ...(contactMethod === 'email' ? { customerEmail } : { customerWhatsapp }) }
  : { ...rest, customerWelaya, customerCommune, typeLivraison, priceLoss };
await axios.post(`${API_URL}/orders/create`, { ...payload, quantity: qty, productId: product.id, ... });

// 6. زر "أضف للسلة" / "اطلب الآن" — أخفِ كتلة السلة بالكامل لمنتج رقمي،
//    واجعل النموذج يظهر مباشرة بدل انتظار ضغطة "اطلب الآن" (لأن زر تفعيلها غير موجود أصلاً)
{product.store.cart && !product.isDigital && (
  <div className="cart-add-btns">{/* addToCart + setIsOrderNow(true) */}</div>
)}
{(isOrderNow || !product.store.cart || product.isDigital) && (
  <div className="anim-slide-fade">
    {product.store.cart && !product.isDigital && (
      <div>{/* عنوان "نوع التوصيل" + زر رجوع setIsOrderNow(false) */}</div>
    )}
    <form onSubmit={handleSubmit}>...</form>
  </div>
)}

// 7. JSX — استبدال كامل لكتلة الشحن بزرّي تبديل + حقل واحد شرطي، وليس بريداً وحيداً بلا اختيار
// `accentColor` هنا رمزي — كل ثيم له لونه الخاص (hex ثابت غالباً، مثل '#1D4ED8' في blue
// أو '#E63946' في red)؛ استخدم نفس اللون المستخدَم أصلاً في أزرار delivery-grid لهذا الثيم
// بالتحديد، لا تخترع لوناً جديداً.
{product.isDigital ? (
  <div>
    {/* سؤال صريح فوق الزرّين مباشرة — لا تفترض أن الأيقونتين وحدهما كافيتان لتوضيح الاختيار */}
    <p style={{ fontSize: '0.775rem', fontWeight: 700, color: '#555', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.contactQuestion}</p>
    <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: '1.5px solid #E8E8E8', marginBottom: '0.75rem' }}>
      <button type="button" onClick={() => setContactMethod('email')}
        style={{ flex: 1, /* ... */ background: contactMethod === 'email' ? accentColor : 'transparent', color: contactMethod === 'email' ? '#fff' : '#555' }}>
        <Mail size={14} />{t.contactViaEmail}
      </button>
      <button type="button" onClick={() => setContactMethod('whatsapp')}
        style={{ flex: 1, /* ... */ background: contactMethod === 'whatsapp' ? accentColor : 'transparent', color: contactMethod === 'whatsapp' ? '#fff' : '#555' }}>
        <MessageCircle size={14} />{t.contactViaWhatsapp}
      </button>
    </div>
    {contactMethod === 'email' ? (
      <FR error={errors.customerEmail} label={t.orderEmail}>
        <input type="email" dir="ltr" value={fd.customerEmail}
          onChange={e => setFd({ ...fd, customerEmail: e.target.value })}
          placeholder={t.emailPh} style={inp(!!errors.customerEmail)} />
      </FR>
    ) : (
      <FR error={errors.customerWhatsapp} label={t.whatsapp}>
        <input type="tel" dir="ltr" value={fd.customerWhatsapp}
          onChange={e => setFd({ ...fd, customerWhatsapp: e.target.value })}
          placeholder={t.whatsappPh} style={inp(!!errors.customerWhatsapp)} />
      </FR>
    )}
  </div>
) : (
  <>{/* form-row-2 (wilaya + commune) ثم delivery-grid — دون أي تغيير */}</>
)}

// 8. الكمية — إخفاء كامل، وليس فقط قفل على 1
{supportQty && !product.isDigital && (
  <div>{/* qty stepper */}</div>
)}

// 9. سطر "التوصيل" في ملخص الطلب — يُحذف بالكامل، وليس معروضاً بـ "0 DZD"
{[
  { l: t.product, v: product.name.slice(0, 26) + '...' },
  { l: t.price, v: `${fp.toLocaleString()} ${currency}` },
  ...(product.isDigital ? [] : [{ l: t.delivery, v: ... }]),
].map(r => (...))}
```

### ⚠️ خطأ حقيقي اكتُشف أثناء التطبيق الفعلي (2026-09-01): تعارض اسم مفتاح `email`

كل ثيمات هذه العائلة (`color-*-rush-*`، وعلى الأرجح غيرها أيضاً — تحقق دائماً) تحتوي مسبقاً على مفتاح ترجمة `email` خاص بصفحة "اتصل بنا" (`Contact`). إضافة مفتاح جديد باسم `email` لحقل البريد في نموذج الطلب **يُنتج خاصية مكرَّرة في نفس object literal** — `jsonAr`/`jsonFr`/`jsonEn` كائنات مسطّحة واحدة لكل الثيم بأكمله، غير مقسّمة حسب المكوّن. النتيجة: فشل `tsc` بـ `TS1117: An object literal cannot have multiple properties with the same name`، والقيمة الفعلية وقت التشغيل هي آخر تعريف فقط (يُلغي الأول بصمت).

**الحل: استخدم `orderEmail` (وليس `email`) لحقل البريد الخاص بالطلب** — في الترجمات الثلاث والـ JSX معاً. لا تلمس مفتاح `email` الأصلي لصفحة الاتصال إطلاقاً.

```tsx
// ✗ خطأ — يتعارض مع email الموجود مسبقاً لصفحة Contact في نفس الملف
email: 'البريد الإلكتروني',

// ✓ صحيح
orderEmail: 'البريد الإلكتروني',
```

**كيف تكتشفه:** شغّل `npx tsc --noEmit -p tsconfig.json | grep <اسم الملف>` بعد كل إضافة مفتاح جديد — أي `TS1117` على السطر الذي أضفته للتو يعني تعارض اسم. أو، قبل الإضافة أصلاً: `grep -n "^\s*email: " src/theme/<file>.tsx` — إن ظهر أكثر من نتيجة فالاسم محجوز.

نفس الفحص ينطبق على المفاتيح الجديدة لواتساب (`whatsapp`, `whatsappPh`, `errWhatsapp`, `contactViaEmail`, `contactViaWhatsapp`) — لم تظهر أي تعارضات معها في `color-electric-blue-rush-theme.tsx` أو `color-bold-red-rush-ecommerce-theme.tsx`، لكن تحقق دائماً بنفس طريقة `grep` قبل الإضافة في كل ثيم جديد، فبعض الثيمات قد تملك مفتاح `whatsapp` مسبقاً (مثلاً كأيقونة تواصل في الـ Footer).

### ⚠️ خلل موجود مسبقاً في نفس الثيمات، اكتُشف أثناء نفس العمل (غير ناتج عن منتج رقمي، لكن يظهر بوضوح بعد حذف سطر التوصيل)

في ملخص الطلب (Summary)، بعض الثيمات (مؤكَّد في `color-electric-blue-rush-theme.tsx` و`color-bold-red-rush-ecommerce-theme.tsx`، افحص البقية بنفس الطريقة) فيها سطر بعنوان `t.price` ("السعر") لكن قيمته الفعلية **اسم المنتج** (`product.name.slice(...)`) — خطأ نسخ-ولصق أصلي، لا يوجد مفتاح `t.product` في الملف أصلاً، ولا سطر سعر حقيقي منفصل.

```tsx
// ✗ الخطأ الأصلي — التسمية "السعر" لكن القيمة اسم المنتج
{ l: t.price, v: product.name.slice(0, 26) + (product.name.length > 26 ? '...' : '') },

// ✓ الإصلاح — سطر منتج بتسمية صحيحة + سطر سعر حقيقي منفصل
{ l: t.product, v: product.name.slice(0, 26) + (product.name.length > 26 ? '...' : '') },
{ l: t.price, v: `${fp.toLocaleString()} ${currency}` },
```

أضف `product: 'المنتج'` / `'Produit'` / `'Product'` لملفات الترجمة الثلاث عند إصلاح هذا. أصلحه كلما مررت على ثيم لإضافة منتج رقمي — نفس منطق §20 (ليس سببه هذا التعديل، لكن سهل الاكتشاف والإصلاح أثناء المرور، ولا تتركه فقط لأنه غير مرتبط).

### قائمة تحقق إضافية (أضِفها لقائمة §15)

- [ ] `Product` interface يحتوي `isDigital?: boolean`
- [ ] `fd`/`formData` يحتوي `customerEmail: ''` و`customerWhatsapp: ''`، بالإضافة إلى حالة `contactMethod` (`'email' | 'whatsapp'`, افتراضي `'email'`)
- [ ] سؤال نصي (`t.contactQuestion`، مثال: "هل تملك بريداً إلكترونياً أم واتساب؟") يظهر فوق زرّي التبديل مباشرة — وليس زرّين بلا أي شرح للاختيار
- [ ] مفتاح الترجمة الجديد اسمه `orderEmail` وليس `email` — تحقق أولاً أن `email` غير مستخدَم مسبقاً في نفس الملف (`grep -n "^\s*email: "`)؛ نفس الفحص لمفاتيح `whatsapp`/`whatsappPh`/`errWhatsapp`/`contactViaEmail`/`contactViaWhatsapp` قبل إضافتها
- [ ] زرّا التبديل (بريد/واتساب) يستخدمان لون الثيم الفعلي (نفس المستخدَم في `delivery-grid`)، وليس لوناً عاماً مخترعاً
- [ ] `getLiv()` تُرجع `0` فوراً إذا `product.isDigital` (أول سطر في الدالة، قبل فحص الشحن المجاني)
- [ ] `validate()`: فرع `if (product.isDigital)` يتفرّع بدوره حسب `contactMethod` — بريد أو واتساب، وليس كلاهما معاً؛ وإلا الولاية/البلدية كالمعتاد للمنتج العادي
- [ ] `handleSubmit`: حقول الشحن لا تُرسَل إطلاقاً لمنتج رقمي، وحقل التواصل غير المختار (`customerEmail` أو `customerWhatsapp`) لا يُرسَل أيضاً — فقط الحقل المطابق لـ `contactMethod`
- [ ] زر "أضف للسلة" مخفي بالكامل لمنتج رقمي، والنموذج يظهر مباشرة بدلاً منه
- [ ] حقل الكمية مخفي بالكامل لمنتج رقمي (وليس مقفلاً على 1 فقط كما في §19)
- [ ] سطر "التوصيل" في ملخص الطلب محذوف بالكامل لمنتج رقمي (وليس معروضاً بقيمة 0)
- [ ] `Cart` **بلا أي تعديل** — منتج رقمي لا يدخله إطلاقاً بما أن زر الإضافة مخفي
- [ ] سطر "السعر" في ملخص الطلب يعرض السعر الفعلي (`fp`)، وليس اسم المنتج — أصلحه إن وُجد بغض النظر عن ارتباطه بمنتج رقمي (انظر التحذير أعلاه)
- [ ] `npx tsc --noEmit` و`npx eslint <file>` قبل التعديل (`git stash`) وبعده — قارن العدد، الهدف عدم زيادة الأخطاء لا حذف كل القديم منها
- [ ] تم تشغيل `node scripts/bundle-themes.mjs --slug=<name>`

---
