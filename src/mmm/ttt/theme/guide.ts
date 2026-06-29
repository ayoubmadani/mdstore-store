/**
 * ═══════════════════════════════════════════════════
 *  THEME REFERENCE GUIDE
 *  مرجع الثيمات — أصل الثيمات
 * ═══════════════════════════════════════════════════
 *
 *  Structure / البنية:
 *    src/theme/{lang}/{theme-key}/main.tsx
 *
 *  Each main.tsx exports:
 *    - default  Main({ store, children })   → layout wrapper
 *    - Navbar   ({ store })
 *    - Footer   ({ store })
 *    - Card     ({ product, displayImage, discount, store, viewDetails })
 *    - Home     ({ store })
 *    - Details  ({ product, ... })
 *    - ProductForm ({ product, userId, domain, selectedOffer,
 *                    setSelectedOffer, selectedVariants, platform?, priceLoss? })
 *    - StaticPage ({ page })  → 'privacy' | 'terms' | 'cookies' | 'contact'
 *    - Privacy  ()
 *    - Terms    ()
 *    - Cookies  ()
 *    - Contact  ()
 *
 * ───────────────────────────────────────────────────
 *  ARABIC THEMES  (ar/)
 * ───────────────────────────────────────────────────
 *
 *  Key                          │ Folder
 *  ─────────────────────────────┼─────────────────────────────────
 *  chamsou-game                 │ ar/chamsou-game            ★ reference
 *  default                      │ ar/default
 *  beauty-wellness              │ ar/beauty-wellness
 *  boho-chic                    │ ar/boho-chic
 *  e-commerce                   │ ar/e-commerce
 *  fitness-focused              │ ar/fitness-focused
 *  gulf-islamic-fashion-theme   │ ar/gulf-islamic-fashion-theme
 *  home-comforts                │ ar/home-comforts
 *  kids-kingdom                 │ ar/kids-kingdom
 *  luxury-elegance              │ ar/luxury-elegance
 *  omni-flex-universal-store    │ ar/omni-flex-universal-store
 *  outdoor-adventures           │ ar/outdoor-adventures
 *  pet-lovers-paradise          │ ar/pet-lovers-paradise
 *  street-style                 │ ar/street-style
 *  tech-innovation              │ ar/tech-innovation
 *  ultimate-mega-store          │ ar/ultimate-mega-store
 *
 * ───────────────────────────────────────────────────
 *  ENGLISH THEMES  (en/)
 * ───────────────────────────────────────────────────
 *
 *  Key                  │ Folder
 *  ─────────────────────┼──────────────────────────
 *  default              │ en/default
 *  beauty-wellness      │ en/beauty-wellness
 *  boho-chic            │ en/boho-chic
 *  e-commerce           │ en/e-commerce
 *  fitness-focused      │ en/fitness-focused
 *  home-comforts        │ en/home-comforts
 *  kids-kingdom         │ en/kids-kingdom
 *  outdoor-adventures   │ en/outdoor-adventures
 *  pet-lovers-paradise  │ en/pet-lovers-paradise
 *  street-style         │ en/street-style
 *  tech-innovation      │ en/tech-innovation
 *
 * ───────────────────────────────────────────────────
 *  RULES / قواعد مشتركة
 * ───────────────────────────────────────────────────
 *
 *  bw  → Never use store.subdomain inside theme links.
 *         Use plain paths: `/`, `/contact`, `/Privacy`, `/Terms`, `/Cookies`
 *         The subdomain routing is handled by the app layer, not the theme.
 *
 *  ti  → ProductForm must use the standard payload shape:
 *         { productId, variantDetailId, domain, storeId, offerId,
 *           platform, quantity, totalPrice, typeShip, priceShip,
 *           priceLoss, customerId, customerName, customerPhone,
 *           customerWilayaId, customerCommuneId }
 *         Redirect after order: router.push(`/${domain}/successfully`)
 *
 * ═══════════════════════════════════════════════════
 */

export type ThemeLang = 'ar' | 'en';

export const THEME_KEYS_AR = [
  'chamsou-game',
  'default',
  'beauty-wellness',
  'boho-chic',
  'e-commerce',
  'fitness-focused',
  'gulf-islamic-fashion-theme',
  'home-comforts',
  'kids-kingdom',
  'luxury-elegance',
  'omni-flex-universal-store',
  'outdoor-adventures',
  'pet-lovers-paradise',
  'street-style',
  'tech-innovation',
  'ultimate-mega-store',
] as const;

export const THEME_KEYS_EN = [
  'default',
  'beauty-wellness',
  'boho-chic',
  'e-commerce',
  'fitness-focused',
  'home-comforts',
  'kids-kingdom',
  'outdoor-adventures',
  'pet-lovers-paradise',
  'street-style',
  'tech-innovation',
] as const;

export type ThemeKeyAr = typeof THEME_KEYS_AR[number];
export type ThemeKeyEn = typeof THEME_KEYS_EN[number];