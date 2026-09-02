'use client';

import { useEffect, useState } from 'react';
import { Phone, MessageCircle, Mail, MapPin, ShoppingCart, ArrowUp, ArrowDown, Facebook, Instagram } from 'lucide-react';
import ProductFormBlockRenderer from './ProductFormBlockRenderer';
import AddShow from '@/components/addShow';
import CustomerTracker from '@/components/CustomerTracker';
import WhatsAppIcon from './WhatsAppIcon';
import type { Pixel } from '@/types/store';

// Matches dashboard/src/pages/editor/blocks/floatingButtonIcons.jsx's own
// name→icon map exactly — the stored value is just this portable string,
// resolved independently to each app's own icon import.
const FLOATING_BUTTON_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  Phone, MessageCircle, Mail, MapPin, ShoppingCart, ArrowUp, ArrowDown, Facebook, Instagram,
  WhatsApp: WhatsAppIcon,
};

const FLOATING_BUTTON_POSITION_STYLE: Record<string, React.CSSProperties> = {
  'top-right': { top: 20, right: 20 },
  'top-left': { top: 20, left: 20 },
  'top-center': { top: 20, left: '50%', transform: 'translateX(-50%)' },
  'bottom-right': { bottom: 20, right: 20 },
  'bottom-left': { bottom: 20, left: 20 },
  'bottom-center': { bottom: 20, left: '50%', transform: 'translateX(-50%)' },
};

// Page-wide floating action button block (e.g. a WhatsApp/call button).
// Anchoring it to the *true* viewport corner (like a WhatsApp button on a
// normal full-width site) put it out in the empty margin on a wide desktop
// screen, since this page builder always renders a narrow, mobile-width
// column (settings.maxWidth, 720px by default) even on desktop — the
// button ended up floating well outside the visible page content instead
// of near it. Bounding it to that same column, the same way
// SpacerBlockRenderer's pinned bar already does, keeps it anchored to a
// corner of the actual visible page at any viewport size.
function FloatingActionButton({ props, referenceWidth }: { props: Record<string, unknown>; referenceWidth: number }) {
  const { link, linkType, position, contentType, text, icon, width: w, height: h, backgroundColor, textColor } = props as FloatingButtonProps;
  const isFormLink = linkType === 'form';
  // Once a "jump to order form" button's own target has scrolled into view,
  // its job is done — leaving it on screen just sits a floating button on
  // top of the very form it was pointing at. Only tracked for form-linked
  // buttons; an external-link button (WhatsApp, phone, etc.) has no such
  // target and always stays visible.
  const [formInView, setFormInView] = useState(false);

  useEffect(() => {
    if (!isFormLink) return undefined;
    const target = document.getElementById('md-product-form');
    if (!target) return undefined;
    const observer = new IntersectionObserver(([entry]) => setFormInView(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(target);
    return () => observer.disconnect();
  }, [isFormLink]);

  if (isFormLink && formInView) return null;

  const isText = (contentType || 'icon') === 'text';
  const Icon = FLOATING_BUTTON_ICONS[icon || 'MessageCircle'] || FLOATING_BUTTON_ICONS.MessageCircle;
  const width = w || 56;
  const height = h || 56;
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: `${referenceWidth}px`,
        pointerEvents: 'none',
        zIndex: 40,
      }}
    >
      <a
        href={isFormLink ? '#md-product-form' : link || '#'}
        target={isFormLink ? undefined : '_blank'}
        rel={isFormLink ? undefined : 'noreferrer'}
        onClick={(e) => {
          if (!isFormLink) return;
          e.preventDefault();
          document.getElementById('md-product-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        style={{
          position: 'absolute',
          ...FLOATING_BUTTON_POSITION_STYLE[position || 'bottom-right'],
          width: isText ? undefined : width,
          height,
          minWidth: isText ? width : undefined,
          padding: isText ? '0 16px' : 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: isText ? 12 : '50%',
          backgroundColor: backgroundColor || '#10b981',
          color: textColor || '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.25)',
          fontWeight: 700,
          fontSize: 14,
          textDecoration: 'none',
          pointerEvents: 'auto',
        }}
      >
        {isText ? text : <Icon size={Math.round(Math.min(width, height) * 0.45)} />}
      </a>
    </div>
  );
}

interface FloatingElement {
  id: string;
  type: 'text' | 'button' | 'image';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  content?: string;
  fontSize?: number;
  fontWeight?: number;
  fontStyle?: string;
  textDecoration?: string;
  color?: string;
  text?: string;
  link?: string;
  linkType?: 'external' | 'form';
  backgroundColor?: string;
  textColor?: string;
  src?: string;
  alt?: string;
}

interface ImageBlockProps {
  src?: string;
  alt?: string;
  caption?: string;
  width?: number;
  align?: 'start' | 'center' | 'end';
  height?: number;
}

interface SpacerBlockProps {
  height?: number;
  backgroundColor?: string;
  position?: 'static' | 'top' | 'bottom';
}

interface BuilderBlock {
  id?: string;
  type: string;
  props: Record<string, unknown>;
}
interface FloatingButtonProps {
  link?: string;
  linkType?: 'external' | 'form';
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
  contentType?: 'text' | 'icon';
  text?: string;
  icon?: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
  textColor?: string;
}

interface BuilderPageData {
  id: string;
  name: string;
  storeId: string;
  productId?: string;
  settings?: { backgroundColor?: string; maxWidth?: number; padding?: number; language?: 'ar' | 'fr' | 'en' };
  tree: BuilderBlock[];
  pixels?: Pixel[];
}

// View-only counterpart to dashboard/src/pages/editor/blocks/ElementsOverlay.jsx
// — same positioning math (x/y % anchored to the block, translate(-50%,-50%)),
// no drag/resize handles, and real click behavior instead of the editor's
// always-prevented-default (a button actually navigates, or actually scrolls
// to the order form).
//
// `referenceWidth` is the page width the merchant was actually looking at
// while sizing text in the editor (the page's own maxWidth) — text fontSize
// is expressed in that same fixed px value everywhere else, which is only
// correct at that one width. Below it (an actual phone screen, once the
// page column itself shrinks below the desktop-sized editor canvas), a
// fixed px size stays the same while its %-based box shrinks around it,
// so the text overflows the box and spills across whatever is underneath
// (typically the block's own image). `100cqw` = 1% of the nearest ancestor
// with `containerType:'inline-size'` (set on this element's own wrapper),
// so scaling the fontSize by (original / referenceWidth) * 100cqw keeps it
// proportional to *that specific block's* rendered width at any viewport
// size — clamped so it never renders smaller than 10px or bigger than the
// original px value the merchant actually set.
function FloatingElements({ elements, referenceWidth }: { elements: unknown; referenceWidth: number }) {
  const items = Array.isArray(elements) ? (elements as FloatingElement[]) : [];
  if (items.length === 0) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {items.map((el) => {
        const width = el.width ? Math.min(100, el.width) : el.type === 'text' ? 60 : el.type === 'image' ? 40 : undefined;
        const boxHeight = el.height || (el.type === 'image' ? 160 : undefined);
        const commonStyle = {
          position: 'absolute' as const,
          left: `${el.x ?? 50}%`,
          top: `${el.y ?? 50}%`,
          transform: 'translate(-50%, -50%)',
          width: width ? `${width}%` : undefined,
          // Same fixed-px-vs-shrinking-container issue as fontSize below —
          // width already scales with the container (%), so a raw px height
          // stops matching it at any width other than referenceWidth,
          // stretching the element tall and thin on narrower screens. cqw is
          // a container-width-relative unit, so using it here (not just for
          // fontSize) keeps height shrinking in lockstep with width.
          height: boxHeight ? `clamp(20px, ${(boxHeight / referenceWidth) * 100}cqw, ${boxHeight}px)` : undefined,
          pointerEvents: 'auto' as const,
        };

        if (el.type === 'button') {
          const isFormLink = el.linkType === 'form';
          // Same reasoning as the text element's fontSize clamp below — a
          // fixed px padding/font stays the same size while the block itself
          // (and everything positioned on it by %) shrinks around it at
          // narrower widths, so the button ends up crowding or overlapping
          // its neighbors instead of shrinking along with them. Padding in
          // `em` scales automatically once fontSize itself is responsive.
          const basePx = el.fontSize || 16;
          return (
            <a
              key={el.id}
              href={isFormLink ? '#md-product-form' : el.link || '#'}
              onClick={(e) => {
                if (!isFormLink) return;
                e.preventDefault();
                document.getElementById('md-product-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{
                ...commonStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: width ? 0 : '0.7em 1.6em',
                borderRadius: 8,
                backgroundColor: el.backgroundColor || '#10b981',
                color: el.textColor || '#ffffff',
                fontWeight: 600,
                fontSize: `clamp(10px, ${(basePx / referenceWidth) * 100}cqw, ${basePx}px)`,
                textDecoration: 'none',
                whiteSpace: width ? 'normal' : 'nowrap',
              }}
            >
              {el.text}
            </a>
          );
        }

        if (el.type === 'image') {
          return (
            <div key={el.id} style={{ ...commonStyle, borderRadius: 8, overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- dynamic per-page src, not a static build-time asset */}
              {el.src && <img src={el.src} alt={el.alt || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
          );
        }

        // text element
        const basePx = el.fontSize || 24;
        return (
          <div
            key={el.id}
            style={{
              ...commonStyle,
              fontSize: `clamp(10px, ${(basePx / referenceWidth) * 100}cqw, ${basePx}px)`,
              fontWeight: el.fontWeight || 700,
              fontStyle: el.fontStyle || 'normal',
              textDecoration: el.textDecoration || 'none',
              color: el.color || '#ffffff',
              textAlign: 'center',
              lineHeight: 1.3,
              overflow: boxHeight ? 'hidden' : 'visible',
            }}
          >
            {el.content}
          </div>
        );
      })}
    </div>
  );
}

// Mirrors dashboard/src/pages/editor/blocks/ImageBlock.jsx.
function ImageBlockRenderer({ props, referenceWidth }: { props: Record<string, unknown>; referenceWidth: number }) {
  const { src, alt, caption, width, align, height } = props as ImageBlockProps;
  if (!src) return null;
  const widthPct = width || 100;
  const justify = align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : 'center';
  // `height` is a fixed px value set at the page's reference width (720 by
  // default) — expressed here as a real aspect-ratio (box width at the
  // reference width : height) so it stays proportional at any container
  // width. object-fit:contain (not cover) means this never needs to crop,
  // so it doesn't need an exactly-right box height to look correct — any
  // rounding slack just shows as empty space around the image instead of
  // cutting off part of it, which is what made getting this pixel-perfect
  // worth fighting for in the first place.
  // Assumes the height was set against the full reference width (720 by
  // default) regardless of widthPct — simpler, and matches how this field
  // is actually used in practice (a custom crop height on a full-width
  // image), instead of a widthPct-scaled ratio that only made sense for a
  // narrower, aligned image that also happens to have a custom height.
  const aspectRatio = height ? `${referenceWidth} / ${height}` : undefined;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: justify, width: '100%' }}>
      <div style={{ width: `${widthPct}%`, maxWidth: '100%', minWidth: 0, minHeight: 0, aspectRatio, overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- dynamic per-page src, not a static build-time asset */}
        <img
          src={src}
          alt={alt || ''}
          style={{
            width: '100%',
            height: aspectRatio ? '100%' : 'auto',
            display: 'block',
            objectFit: aspectRatio ? 'cover' : undefined,
            objectPosition: 'top',
          }}
        />
      </div>
      {caption && (
        <p style={{ marginTop: 8, fontSize: 13, color: '#71717a', textAlign: align || 'center' }}>{caption}</p>
      )}
    </div>
  );
}

// Mirrors dashboard/src/pages/editor/blocks/SpacerBlock.jsx — unlike the
// editor (which can't safely let this go position:fixed inside the canvas,
// see Canvas.jsx's isPinned handling), this is the real published page, so a
// pinned spacer genuinely sticks to the real viewport edge here. Its floating
// elements are rendered *inside* this same fixed box rather than as a sibling
// in the tree-map loop below — a pinned spacer is taken out of normal flow,
// which collapses the shared position:relative wrapper to 0 height, so any
// FloatingElements positioned by percentage against that wrapper would
// compute against zero and effectively vanish.
// `left:0, right:0` would stretch this across the full browser viewport —
// spanning past the page's own centered maxWidth column entirely, unlike the
// editor's simulated preview, which always stays inside the page card's own
// width. Centering it at the same maxWidth instead keeps it visually locked
// to the page column at any viewport size, matching that preview.
function SpacerBlockRenderer({ props, elements, maxWidth }: { props: Record<string, unknown>; elements: unknown; maxWidth: number }) {
  const { height, backgroundColor, position } = props as SpacerBlockProps;
  const isPinned = position === 'top' || position === 'bottom';
  return (
    <div
      style={{
        height: height || 60,
        backgroundColor: backgroundColor || '#ffffff',
        ...(isPinned
          ? {
              position: 'fixed' as const,
              top: position === 'top' ? 0 : undefined,
              bottom: position === 'bottom' ? 0 : undefined,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: `${maxWidth}px`,
              zIndex: 30,
              containerType: 'inline-size' as const,
            }
          : { position: 'relative' as const }),
      }}
    >
      {isPinned && <FloatingElements elements={elements} referenceWidth={maxWidth} />}
    </div>
  );
}

// Renders a published builder-page's block tree — deliberately independent
// of the storefront's theme system (no ThemeRunner, no eval): the published
// artifact is plain JSON, and every block type here has a fixed, built-in
// renderer, the same way componentsMap.js drives the editor.
export default function BuilderPageRenderer({ page, lpDomain, dedicated }: { page: BuilderPageData; lpDomain: string; dedicated?: boolean }) {
  const settings = page.settings || {};
  const pagePadding = settings.padding || 0;
  const pageMaxWidth = settings.maxWidth || 720;

  // Pinned spacers render position:fixed and are taken out of document flow
  // entirely, so nothing below would otherwise know to leave room for them —
  // real content would start at the very top of the page and render right
  // underneath (visually covered by) the fixed bar, unlike the editor's own
  // preview, which always keeps it in-flow and thus never overlaps anything.
  const pinnedTopHeight = page.tree
    .filter((b) => b.type === 'spacer' && b.props?.position === 'top')
    .reduce((sum, b) => sum + (Number(b.props?.height) || 60), 0);
  const pinnedBottomHeight = page.tree
    .filter((b) => b.type === 'spacer' && b.props?.position === 'bottom')
    .reduce((sum, b) => sum + (Number(b.props?.height) || 60), 0);

  return (
    <div
      dir={(settings.language || 'ar') === 'ar' ? 'rtl' : 'ltr'}
      lang={settings.language || 'ar'}
      style={{
        backgroundColor: settings.backgroundColor || '#ffffff',
        width: '100%',
        maxWidth: `${pageMaxWidth}px`,
        marginInline: 'auto',
        boxSizing: 'border-box',
        padding: pagePadding || undefined,
        paddingTop: pinnedTopHeight ? pinnedTopHeight + pagePadding : undefined,
        paddingBottom: pinnedBottomHeight ? pinnedBottomHeight + pagePadding : undefined,
      }}
    >
      <AddShow storeId={page.storeId} productId={page.productId} builderPageId={page.id} />
      <CustomerTracker pixels={page.pixels ?? []} pageType="landing_page" landingPageId={page.id} />
      {page.tree.map((block, index) => {
        const isPinnedSpacer = block.type === 'spacer' && (block.props?.position === 'top' || block.props?.position === 'bottom');
        if (block.type === 'floatingButton') return <FloatingActionButton key={block.id ?? index} props={block.props} referenceWidth={pageMaxWidth} />;
        return (
          <div key={block.id ?? index} style={{ position: 'relative', containerType: 'inline-size' }} id={block.type === 'productForm' ? 'md-product-form' : undefined}>
            {block.type === 'image' && <ImageBlockRenderer props={block.props} referenceWidth={pageMaxWidth} />}
            {block.type === 'spacer' && <SpacerBlockRenderer props={block.props} elements={isPinnedSpacer ? block.props?.elements : undefined} maxWidth={pageMaxWidth} />}
            {block.type === 'productForm' && (
              <ProductFormBlockRenderer
                productId={page.productId || (block.props?.productId as string | undefined)}
                props={block.props}
                lpDomain={lpDomain}
                builderPageId={page.id}
                language={settings.language}
                dedicated={dedicated}
                pixels={page.pixels}
              />
            )}
            {!isPinnedSpacer && <FloatingElements elements={block.props?.elements} referenceWidth={pageMaxWidth} />}
          </div>
        );
      })}
    </div>
  );
}
