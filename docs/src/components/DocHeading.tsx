import { Children, isValidElement, type ReactNode } from 'react';
import { sectionId } from '../lib/navigation';

function plainText(children: ReactNode): string {
  return Children.toArray(children).map((child) => {
    if (typeof child === 'string' || typeof child === 'number') return String(child);
    return isValidElement<{ children?: ReactNode }>(child) ? plainText(child.props.children) : '';
  }).join('');
}

export function DocHeading({ children, level }: { children?: ReactNode; level: 2 | 3 }) {
  const Tag = level === 2 ? 'h2' : 'h3';
  const id = sectionId(plainText(children));
  return <Tag id={id}><a className="heading-link" href={`#${id}`}>{children}</a></Tag>;
}
