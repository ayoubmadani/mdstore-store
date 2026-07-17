'use client';

import ProductFormBlockRenderer from './ProductFormBlockRenderer';
import AddShow from '@/components/addShow';

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
interface BuilderPageData {
  id: string;
  name: string;
  storeId: string;
  productId?: string;
  settings?: { backgroundColor?: string; maxWidth?: number; padding?: number };
  tree: BuilderBlock[];
}

// View-only counterpart to dashboard/src/pages/editor/blocks/ElementsOverlay.jsx
// — same positioning math (x/y % anchored to the block, translate(-50%,-50%)),
// no drag/resize handles, and real click behavior instead of the editor's
// always-prevented-default (a button actually navigates, or actually scrolls
// to the order form).
function FloatingElements({ elements }: { elements: unknown }) {
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
          height: boxHeight ? `${boxHeight}px` : undefined,
          pointerEvents: 'auto' as const,
        };

        if (el.type === 'button') {
          const isFormLink = el.linkType === 'form';
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
                padding: width ? 0 : '10px 24px',
                borderRadius: 8,
                backgroundColor: el.backgroundColor || '#10b981',
                color: el.textColor || '#ffffff',
                fontWeight: 600,
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
        return (
          <div
            key={el.id}
            style={{
              ...commonStyle,
              fontSize: el.fontSize || 24,
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
function ImageBlockRenderer({ props }: { props: Record<string, unknown> }) {
  const { src, alt, caption, width, align, height } = props as ImageBlockProps;
  if (!src) return null;
  const widthPct = width || 100;
  const justify = align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : 'center';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: justify }}>
      <div style={{ width: `${widthPct}%`, maxWidth: '100%', height: height || undefined, overflow: 'hidden', borderRadius: 12 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- dynamic per-page src, not a static build-time asset */}
        <img
          src={src}
          alt={alt || ''}
          style={{
            width: '100%',
            height: height ? '100%' : 'auto',
            display: 'block',
            objectFit: height ? 'cover' : undefined,
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
            }
          : { position: 'relative' as const }),
      }}
    >
      {isPinned && <FloatingElements elements={elements} />}
    </div>
  );
}

// Renders a published builder-page's block tree — deliberately independent
// of the storefront's theme system (no ThemeRunner, no eval): the published
// artifact is plain JSON, and every block type here has a fixed, built-in
// renderer, the same way componentsMap.js drives the editor.
export default function BuilderPageRenderer({ page, lpDomain }: { page: BuilderPageData; lpDomain: string }) {
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
      dir="rtl"
      style={{
        backgroundColor: settings.backgroundColor || '#ffffff',
        maxWidth: `${pageMaxWidth}px`,
        marginInline: 'auto',
        padding: pagePadding || undefined,
        paddingTop: pinnedTopHeight ? pinnedTopHeight + pagePadding : undefined,
        paddingBottom: pinnedBottomHeight ? pinnedBottomHeight + pagePadding : undefined,
      }}
    >
      <AddShow storeId={page.storeId} productId={page.productId} builderPageId={page.id} />
      {page.tree.map((block, index) => {
        const isPinnedSpacer = block.type === 'spacer' && (block.props?.position === 'top' || block.props?.position === 'bottom');
        return (
          <div key={block.id ?? index} style={{ position: 'relative' }} id={block.type === 'productForm' ? 'md-product-form' : undefined}>
            {block.type === 'image' && <ImageBlockRenderer props={block.props} />}
            {block.type === 'spacer' && <SpacerBlockRenderer props={block.props} elements={isPinnedSpacer ? block.props?.elements : undefined} maxWidth={pageMaxWidth} />}
            {block.type === 'productForm' && (
              <ProductFormBlockRenderer
                productId={page.productId || (block.props?.productId as string | undefined)}
                props={block.props}
                lpDomain={lpDomain}
                builderPageId={page.id}
              />
            )}
            {!isPinnedSpacer && <FloatingElements elements={block.props?.elements} />}
          </div>
        );
      })}
    </div>
  );
}
