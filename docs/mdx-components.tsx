import type { MDXComponents } from 'mdx/types';
import { isValidElement, type ReactNode } from 'react';
import { CodeBlock } from './src/components/CodeBlock';
import { DocHeading } from './src/components/DocHeading';

const components: MDXComponents = {
  h2: ({ children }) => <DocHeading level={2}>{children}</DocHeading>,
  h3: ({ children }) => <DocHeading level={3}>{children}</DocHeading>,
  pre: ({ children }) => {
    const child = isValidElement<{ children?: ReactNode; className?: string }>(children) ? children : null;
    const code = child?.props.children;
    if (typeof code !== 'string') return <pre>{children}</pre>;
    return <CodeBlock code={code} language={child?.props.className?.replace('language-', '')} />;
  },
};

export function useMDXComponents(): MDXComponents {
  return components;
}
