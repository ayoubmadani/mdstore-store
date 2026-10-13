---
name: mdstore-theme-creator
description: Create a complete MdStore storefront theme with its own visual identity and publish it through the mdstore MCP admin tools (admin_create_theme, admin_publish_theme_code). Use when the user asks to create, design, or upload a new MdStore theme/قالب/ثيم, or to fix a theme that fails to load.
---

# إنشاء ثيم MdStore — من الفكرة إلى النشر

الثيم = **ملف TSX واحد مستقل**. يستورد فقط من المكتبات المسموحة ومن `@mdstore/theme-kit`، ويُرفع عبر الـ MCP. الخادم يفحصه ويبنيه ويرفعه. لا يوجد أي ملف آخر ولا خطوة يدوية.

## 0. الأدوات (مفتاح أدمن `mdsa_` فقط)

| الخطوة | الأداة |
|---|---|
| أنواع الثيمات | `admin_list_theme_types` (تجنّب `hidden`: custom وtesting) |
| نوع جديد إن لم يناسب أي نوع | `admin_create_theme_type` (PIN) |
| سجل الثيم (الأسماء/الأوصاف/الصورة/الوسوم/السعر) | `admin_create_theme` (PIN) |
| الكود | `admin_request_pin` ← اطلب الـ PIN من المستخدم ← `admin_publish_theme_code` |

قواعد الـ PIN: لكل عملية تحدٍّ جديد، وهو صالح 5 دقائق ولعملية واحدة. **لا تخمّن الرمز أبداً**: اعرض اسم التحدّي (مثل `AAFFHH`) واطلب الأرقام الستة من المستخدم.
الثيم يُنشأ **غير مفعّل**. المستخدم يفعّله من لوحة الأدمن بعد أن يراه.

## 1. الهوية البصرية — إلزامية وفريدة

قبل أي كود، اكتب «بطاقة الهوية» واعرضها على المستخدم:

```
المفهوم: جملة واحدة (مثل: «مكتبة دافئة بروح الورق والحبر»)
الألوان: primary · accent · ink (نص) · surface (خلفية) · muted — بصيغة hex
الخطوط: عنوان عربي + عنوان لاتيني + نص (Google Fonts، تدعم العربية للنصوص)
الأشكال: radius (حاد 4px / متوسط 12px / دائري 24px+) · الظلال (لا شيء / ناعمة / صلبة مزاحة)
Navbar: نمط من القائمة أدناه
Hero: نمط من القائمة أدناه
بطاقة المنتج: نمط + نسبة الصورة (1:1 / 3:4 / 4:5 / 16:9)
عنصر توقيع: زخرفة واحدة تتكرر وتجعل الثيم معروفاً (نقشة، حافة متموجة، خط مزدوج، ختم، شريط مائل…)
الحركة: هادئة / مرحة / بلا حركة
```

**ممنوع:**
- نسخ ثيم موجود وتغيير ألوانه فقط. غيّر **3 أشياء على الأقل** من: Navbar وHero والبطاقة والفوتر وتخطيط صفحة المنتج.
- إعادة زوج خطوط أو لون أساسي مستعمل في ثيم من نفس النشاط. راجع `reference/existing-themes.md`.
- الألوان الافتراضية العامة (`#3B82F6`، و`#000/#fff` فقط) بلا شخصية.

**أنماط مقترحة:**
- **Navbar:** A شعار وسط وروابط على الجانبين · B شعار يسار وبحث عريض · C شريط شفاف فوق الهيرو · D شريطان (علوي للتواصل وسفلي للتصنيفات) · E قائمة جانبية منزلقة.
- **Hero:** صورة كاملة مع نص فوقها · تقسيم نص/صورة · نصي تحريري كبير بلا صورة · فسيفساء صور · منتج بارز مع سعر.
- **بطاقات:** إطار بظل · صورة مع معلومات تظهر عند المرور · بسيطة بلا إطار · غلاف طويل (كتب/أزياء) · أفقية (قائمة).
- **التصنيفات:** أزرار كبسولية قابلة للتمرير · شبكة بصور · قائمة جانبية.

صور الهيرو والمعاينة: روابط مباشرة من `images.unsplash.com` تطابق النشاط، بصيغة `?w=1200&q=70&auto=format` للهيرو و`?w=800&q=70&auto=format` للمعاينة (الجوال لا يحتاج أكبر).

## 2. العقد التقني (لا تخالفه)

**الاستيرادات المسموحة فقط:**
`react`، و`react-dom`، و`next/link`، و`next/image`، و`next/navigation`، و`axios`، و`zustand`، و`lucide-react`، و`framer-motion`، و`isomorphic-dompurify`، و`uuid`، و`@mdstore/theme-kit`.
أي استيراد آخر (مثل `@/…`، أو ملف نسبي، أو رابط) يرفضه الخادم.
- `lucide-react`: بالاسم فقط (`import { Home, ShoppingBag } from 'lucide-react'`). الخادم يدمج الأيقونات المستعملة فقط داخل الحزمة. `import * as` يُلغي ذلك ويجبر المتجر على تحميل كل المكتبة (~200KB).
- `framer-motion`: ثقيلة ولا تُحمَّل إلا لثيم يستوردها. استعمل حركات CSS (`@keyframes` و`transition`) بدلها.

**الـ exports المطلوبة:** `default` (الغلاف: Navbar + children + Footer)، و`Home`، و`Details`، و`Cart`، و`StaticPage`. والمستحسن أيضاً: `Success`، و`Navbar`، و`Footer`، و`Card`، و`ProductForm`، و`Privacy`، و`Terms`، و`Cookies`، و`Contact`.

| export | props |
|---|---|
| `default` | `{ store, children, domain }` — ضع `<style>{THEME_CSS}</style>` هنا |
| `Home` | `{ store, page }` — `store.products`، `store.categories`، `store.count` (48 منتج/صفحة)، `?category=` و`?search=` |
| `Details` | `{ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, store }` |
| `ProductForm` | `{ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform?, store? }` |
| `Cart` | `{ domain, store }` — السلة في `localStorage[domain]` (مصفوفة عناصر) |
| `Success` | `{ store, order }` — `order.productName`، `order.total` |
| `StaticPage` | `{ staticPage, page, store }` ← privacy / terms / cookies / contact |

**من `@mdstore/theme-kit`:**
```ts
import {
  useCartStore,                 // { count, initCount(n) } — عدّاد السلة في الـ Navbar
  WhatsAppOrderButton,          // <WhatsAppOrderButton product store /> — في ProductForm تحت أزرار الطلب
  WhatsAppGlyph, comingSoon, storeWhatsappHref, whatsappHref,
  ProductAddons, addonsTotal, addonsLabel,   // الإضافات المدفوعة
  API_URL, fetchWilayas, fetchCommunes, createOrder, sendContactMessage, isValidDzPhone,
} from '@mdstore/theme-kit';
```

**ميزات إلزامية** (كلها مطبّقة في `reference/theme-template.tsx`، فانسخ **المنطق** وغيّر **التصميم**):
1. **اللغات:** `store.language` بقيم `ar`/`fr`/`en`. ثلاث كائنات ترجمة كاملة بنفس المفاتيح، و`dir` = `rtl` للعربية. في العناصر التي فيها عربي داخل LTR استعمل `textAlign` فيزيائياً (`right`/`left`) وليس `start`. اقلب الأسهم في RTL.
2. **الشحن:** `fetchWilayas(userId, product.store.id)` في ProductForm، و`fetchWilayas(store.user.id, store.id)` في Cart. لا تحذف `storeId`، فكل متجر له حساب شحن.
3. **الإضافات:** `const [addonIds, setAddonIds] = useState<string[]>([])`، و`<ProductAddons product store selected={addonIds} onChange={setAddonIds} accent={…} />` في أعلى ProductForm، و`fp = getFP() + addonsTotal(product, addonIds)`. أرسل `addonIds` مع الطلب، واحفظه في عنصر السلة، وأرسل `addonIds: i.addonIds` من Cart.
4. **الطلب:** الحقول `customerName`، و`customerPhone` (تحقّق بـ `isValidDzPhone`)، و`customerWelaya`، و`customerCommune`، و`typeLivraison: 'home'|'office'`، و`quantity`، و`finalPrice`، و`totalPrice`، و`priceLivraison`، و`productId`، و`storeId`، و`userId`، و`selectedOffer`، و`variantDetailId`، و`platform`. بعد النجاح: `router.push('/successfully?productId=…')`.
5. **السلة:** إذا `store.cart === false` يظهر النموذج مباشرة بدون أزرار السلة. وإلا يظهر «أضف للسلة» و«اطلب الآن».
6. **منتج رقمي** (`product.isDigital`): لا ولاية ولا توصيل. يُطلب بريد **أو** واتساب.
7. **العروض والمتغيرات:** `product.offers` (سعر لكمية)، و`allAttrs` بأنماط `displayMode` (color وimage وtext)، والمتغير غير المتوفر معطّل.
8. **التوصيل المجاني:** `product.shippingFree`، و`offer.shippingFree`، و`store.supportFreeShipping` مع `freeShippingMinAmount`.
9. **Footer:** الهاتف + واتساب + البريد **دائماً**، والناقص منها يُعرض بـ `comingSoon(store)`. الأرقام داخل `<span dir="ltr">`.
10. **الشريط العلوي:** `store.topBar.enabled && store.topBar.text`. **الشعار:** `store.design.logoUrl`، وإلا اسم المتجر بتصميم الهوية.
11. **وصف المنتج HTML:** يُعرض دائماً عبر `DOMPurify.sanitize`.
12. **ولاية واحدة فقط:** إذا أرجع `fetchWilayas` ولاية واحدة، تُختار تلقائياً عبر `useEffect` على مستوى المكوّن (لا داخل `useEffect` آخر) ويُقفل حقلها: `disabled={wilayas.length === 1}`. ينطبق ذلك في ProductForm وفي Cart، كما في القالب المرجعي.
13. **نوع التوصيل لكل ولاية:** كل ولاية فيها `homeEnabled` و`officeEnabled`. لا تُظهر خيارات نوع التوصيل قبل اختيار الولاية، وبعدها اعرض المتاح فقط عبر `deliveryShown(wilayas, fd.customerWelaya, type)`. ضع `data-delivery-option` على زر كل نوع، واجعل الأزرار وحدها في حاويتها: المتجر يجعل الزر الوحيد بعرض السطر كاملاً. وإذا صار النوع المختار غير متاح، انقل `typeLivraison` للنوع الآخر في `useEffect` على مستوى المكوّن. كل هذا مطبّق في القالب المرجعي.
14. **الجوال أولاً:** شبكات بـ `minmax(0,1fr)`، ولا overflow أفقي، وقائمة جوال، و`width:100%` للحاوية داخل flex.
15. **السرعة (PageSpeed على الجوال)** — كما في القالب المرجعي:
    - صورة الواجهة الأولى (hero) وصورة المنتج الرئيسية في Details: `fetchPriority="high" decoding="async"` بلا `loading="lazy"`.
    - كل الصور الأخرى (بطاقات المنتجات، المصغّرات، السلة، البحث، الأقسام السفلية): `loading="lazy" decoding="async"`، مع `aspect-ratio` أو `width`/`height` للحاوية حتى لا تقفز الصفحة (CLS).
    - الخطوط: عائلتان أو ثلاث كحد أقصى، وفقط الأوزان المستعملة، في `@import` واحد مع `display=swap`.
    - لا حركة `infinite` على عناصر كبيرة أو صور كاملة العرض (مثل Ken Burns على الهيرو)، ولا `backdrop-filter` أو `filter: blur` على مساحات كبيرة. الحركة بـ `transform` و`opacity` فقط، وأوقفها مع `@media (prefers-reduced-motion: reduce)`.
    - لا تحرّك خصائص تعيد الرسم أو التخطيط (`box-shadow`، `width`/`height`، `top`/`left`، `background-position`)، ولا عشرات العناصر المتحركة في نفس الوقت.

## 3. سير العمل

1. افهم النشاط، ثم `admin_list_theme_types`.
2. اكتب **بطاقة الهوية** والـ JSON (الأسماء والأوصاف بثلاث لغات، و`slug` إنجليزي ينتهي بـ `-theme`، والوسوم، وصورة المعاينة، و`typeId`، والسعر) واعرضهما.
3. `admin_create_theme` مع PIN.
4. اكتب الكود كاملاً انطلاقاً من **منطق** القالب المرجعي، مع تصميم جديد بالكامل حسب البطاقة. راجع قائمة التحقق أدناه.
5. `admin_request_pin` ← PIN ← `admin_publish_theme_code` (الكود في الأداة، **لا في المحادثة**).
6. إن رجع خطأ (استيراد أو export أو سطر)، أصلحه وأعد الرفع بتحدٍّ جديد.
7. أخبر المستخدم: الثيم مرفوع وغير مفعّل، فعّله من لوحة الأدمن ← Themes.

## 4. قائمة التحقق قبل الرفع

- [ ] بطاقة الهوية مختلفة عن الثيمات في `reference/existing-themes.md`، و3 تخطيطات على الأقل مختلفة عن القالب المرجعي.
- [ ] الاستيرادات من القائمة المسموحة فقط، ولا `@/` في أي مكان.
- [ ] `default` و`Home` و`Details` و`Cart` و`StaticPage` مُصدَّرة.
- [ ] ثلاث ترجمات كاملة بنفس المفاتيح، وكل نص ظاهر يأتي من الترجمة.
- [ ] الشحن بـ `storeId`، والإضافات في الطلب والسلة، وزر واتساب، وFooter التواصل.
- [ ] منتج رقمي، وعروض، ومتغيرات، وتوصيل مجاني، و`store.cart === false`، وولاية واحدة تُختار وتُقفل، ونوع التوصيل حسب الولاية.
- [ ] لا يوجد `localStorage` أو `window` خارج `useEffect` أو معالجات الأحداث (الصفحة تُعرض على الخادم أيضاً).
- [ ] لا تعليق JSX داخل `&& (…)`، ولا `pt` في CSS.
- [ ] السرعة: الهيرو وصورة المنتج الرئيسية `fetchPriority="high"`، وباقي الصور `loading="lazy"`، وأيقونات lucide بالاسم، ولا framer-motion، ولا حركة `infinite` أو `blur` على مساحات كبيرة.

## المراجع
- `reference/theme-template.tsx`: ثيم كامل يعمل (المكتبة العصرية) بكل الميزات أعلاه، ومنها قواعد السرعة. **مرجع للمنطق، لا للتصميم.**
- `reference/existing-themes.md`: الخطوط والألوان المستعملة في الثيمات الحالية.
