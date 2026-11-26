import { Children, cloneElement, isValidElement, type ReactNode } from 'react';

/** الشعار بجانب اسم المتجر المكتوب: نصّه البديل يصير فارغاً (alt="") حتى لا يُقرأ الاسم مرتين
 *  لقارئ الشاشة. يصل إلى الصورة ولو كانت داخل عناصر أخرى، ولا يغيّر شيئاً آخر. */
export function decorativeImages(node: ReactNode): ReactNode {
  if (!isValidElement(node)) {
    return Array.isArray(node) ? Children.map(node, decorativeImages) : node;
  }
  const props = node.props as { children?: ReactNode };
  if (node.type === 'img') return cloneElement(node, { alt: '' } as object);
  if (props.children == null || typeof props.children === 'function') return node;
  const kids = Array.isArray(props.children) ? Children.map(props.children, decorativeImages) : decorativeImages(props.children);
  return cloneElement(node, undefined, kids);
}
