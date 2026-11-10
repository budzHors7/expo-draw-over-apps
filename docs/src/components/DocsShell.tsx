'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

type NavigationItem = {
  href: string;
  label: string;
};

const navigation: NavigationItem[] = [
  { href: '/docs', label: 'Overview' },
  { href: '/docs/permission', label: 'Permission' },
  { href: '/docs/react-native-window', label: 'React Native window' },
  { href: '/docs/native-window', label: 'Native window' },
  { href: '/docs/window-controls', label: 'Window controls' },
  { href: '/docs/limitations', label: 'Limitations' },
  { href: '/docs/public-api', label: 'Public API' },
];

const pageSections: Record<string, NavigationItem[]> = {
  '/docs': [
    { href: '#install', label: 'Install' },
    { href: '#choose-a-window', label: 'Choose a window' },
    { href: '#show-it', label: 'Show it' },
  ],
  '/docs/permission': [
    { href: '#request-permission', label: 'Request permission' },
    { href: '#refresh-on-resume', label: 'Refresh on resume' },
  ],
  '/docs/react-native-window': [
    { href: '#complete-renderer', label: 'Complete renderer' },
    { href: '#register-and-show', label: 'Register and show' },
  ],
  '/docs/native-window': [
    { href: '#complete-renderer', label: 'Complete renderer' },
    { href: '#register-and-show', label: 'Register and show' },
  ],
  '/docs/window-controls': [
    { href: '#coordinates', label: 'Coordinates' },
    { href: '#move-an-open-window', label: 'Move an open window' },
    { href: '#close-and-edge-hide', label: 'Close and edge hide' },
  ],
  '/docs/limitations': [{ href: '#production-checklist', label: 'Production checklist' }],
  '/docs/public-api': [{ href: '#generated-reference', label: 'Generated reference' }],
};

function normalizePathname(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
}

function Navigation({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Documentation">
      <p className="nav-label">SDK 58 guide</p>
      {navigation.map((item) => (
        <Link
          aria-current={pathname === item.href ? 'page' : undefined}
          className={pathname === item.href ? 'active' : undefined}
          href={item.href}
          key={item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function DocsShell({ children }: { children: ReactNode }) {
  const pathname = normalizePathname(usePathname() ?? '/docs');
  const sections = pageSections[pathname] ?? [];

  return (
    <div className="docs-grid">
      <aside className="docs-sidebar"><Navigation pathname={pathname} /></aside>
      <details className="mobile-docs-nav">
        <summary>Docs</summary>
        <Navigation pathname={pathname} />
      </details>
      <article className="docs-article">{children}</article>
      <aside className="page-toc">
        <p className="nav-label">On this page</p>
        {sections.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
      </aside>
    </div>
  );
}
