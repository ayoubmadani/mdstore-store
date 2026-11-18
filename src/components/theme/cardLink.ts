// بطاقة المنتج كلها قابلة للضغط (مع بقاء زرها): الضغط في أي مكان من البطاقة يفتح صفحة المنتج،
// إلا إن كان على زر أو رابط أو حقل داخلها فيعمل هو كما كان. Ctrl/⌘ + ضغط ← تبويب جديد.
import type { MouseEvent } from 'react';
import { useRouter } from 'next/navigation';

let styled = false;
const ensureCursor = () => {
  if (styled || typeof document === 'undefined') return;
  styled = true;
  const s = document.createElement('style');
  s.textContent = '[data-card-link]{cursor:pointer}';
  document.head.appendChild(s);
};

export function useCardLink(href: string) {
  const router = useRouter();
  ensureCursor();
  return {
    'data-card-link': true,
    onClick: (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if ((e.target as HTMLElement).closest?.('a,button,input,select,textarea,label')) return;
      if (e.metaKey || e.ctrlKey) { window.open(href, '_blank'); return; }
      router.push(href);
    },
  };
}
