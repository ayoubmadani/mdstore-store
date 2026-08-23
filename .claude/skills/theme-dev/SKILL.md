---
name: theme-dev
description: "دليل تطوير ثيمات MdStore: بنية الملفات، أنماط i18n (ar/fr/en)، أخطاء BiDi/RTL، CSS في flex containers، bundle command، وقواعد ثابتة للـ Navbar/Footer/Hero."
---

# Theme Dev — دليل تطوير ثيمات MdStore

دليل مرجعي شامل لكل ما يخص إنشاء وتعديل ثيمات متجر MdStore: بنية الكود، أنماط الترجمة، أخطاء متكررة وحلولها، وقواعد ثابتة يجب احترامها في كل ثيم.

---

## When to Apply

استخدم هذا الـ Skill عند:
- إنشاء ثيم جديد من الصفر
- إضافة i18n لثيم موجود
- تصحيح مشاكل اتجاه النص (RTL/LTR)
- تعديل Hero أو Navbar أو Footer
- تصحيح أخطاء بصرية في الثيم (محاذاة، overflow، ألوان)

---

## 1. بنية الملف الأساسية

كل ثيم ملف `.tsx` واحد في `src/theme/` يصدّر:

```ts
export default Main         // الـ layout الرئيسي
export { Navbar, Footer, Card, Home, Details, ProductForm, Cart,
         Privacy, Terms, Cookies, Contact, StaticPage }
```

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

## 6. أخطاء متكررة وحلولها

| الخطأ | السبب | الحل |
|-------|-------|------|
| نص Hero يمين-محاذاة في متجر LTR | BiDi يتجاوز `dir="ltr"` عند وجود عربي | `textAlign: t.dir === 'rtl' ? 'right' : 'left'` |
| Hero text لا يتمحاذى مع الـ categories | `hn-container` داخل flex يأخذ عرض المحتوى | أضف `width: '100%'` للـ container |
| نص عربي يظهر مقلوباً في hero overflow | `dangerouslySetInnerHTML` + نص طويل جداً | استخدم plain text + `wordBreak: 'break-word'` |
| `cite` text مرئي | `content: attr(cite)` في CSS | احذف خاصية cite أو استخدم `data-*` بدلاً منها |
| JSX comment داخل `&& ()` | `{/* comment */}` داخل تعبير شرطي | ضع التعليق خارج الـ expression أو احذفه |
| `WebKitLineClamp` لا يعمل | `overflow: visible` | أضف `overflow: 'hidden'` للـ container |
| `pt` (points) بدلاً من `px` في CSS | وحدة خاطئة | استخدم `px` أو `rem` دائماً في web |

---

## 7. أنماط CSS الثابتة (Classes بدل Inline)

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

## 8. Navbar — القواعد الثابتة

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

## 9. Footer — القواعد الثابتة

```tsx
// ✓ حقل البريد الإلكتروني
<input type="email" placeholder={t.emailPlaceholder || 'email@example.com'} />

// ✓ store prop يُمرر دائماً
<Footer store={store} />

// ✓ Privacy/Terms/Cookies تستقبل store
export function Privacy({ store }: { store: any }) { ... }
```

---

## 10. Trust Items — نمطان مقبولان

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

## 11. Bundle Command

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

## 12. خصائص CSS الاتجاهية — Logical vs Physical

| الخاصية | Logical (يتأثر بـ BiDi) | Physical (لا يتأثر) |
|---------|------------------------|---------------------|
| المحاذاة | `textAlign: 'start'` | `textAlign: 'left'` أو `'right'` |
| الهامش | `marginInlineStart` | `marginLeft` / `marginRight` |
| الـ padding | `paddingInlineStart` | `paddingLeft` / `paddingRight` |
| الموضع | `insetInlineStart` | `left` / `right` |

**القاعدة:** في الثيمات متعددة اللغات، فضّل الـ Logical للـ RTL/LTR الطبيعي، واستخدم Physical لتجاوز BiDi عند الضرورة.

---

## 13. قائمة تحقق قبل الـ Bundle

- [ ] كل مفاتيح JSON موجودة في ar/fr/en (أو كـ fallback)
- [ ] `dir` صحيح في كل JSON (`'rtl'` للعربي، `'ltr'` للفرنسي/الإنجليزي)
- [ ] Hero container له `width: '100%'` إذا كان داخل flex section
- [ ] نصوص Hero تستخدم `textAlign` فيزيائي (ليس 'start')
- [ ] `store` prop يُمرر لـ Navbar, Footer, Privacy, Terms, Cookies, Contact
- [ ] لا يوجد JSX comment داخل `&& ()`
- [ ] لا يوجد `cite` attribute مرئي
- [ ] تم تشغيل `node scripts/bundle-themes.mjs --slug=<name>`
