'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, ChevronDown } from 'lucide-react';
import { documentation as navigation } from '../lib/navigation';

type NavigationItem = {
  href: string;
  label: string;
};

const pageSections: Record<string, NavigationItem[]> = {
  '/docs': [
    { href: '#install', label: 'Install' },
    { href: '#choose-a-window', label: 'Choose a window' },
    { href: '#show-it', label: 'Show it' },
    { href: '#multiple-windows', label: 'Multiple windows' },
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
  '/docs/multiple-windows': [
    { href: '#choose-your-project-setup', label: 'Choose project setup' },
    { href: '#register-two-renderers', label: 'Register two renderers' },
    { href: '#show-and-control-the-windows', label: 'Show and control' },
    { href: '#reuse-one-renderer', label: 'Reuse one renderer' },
  ],
  '/docs/window-controls': [
    { href: '#predefined-locations', label: 'Predefined locations' },
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
      {navigation.map((item, index) => (
        <Link
          aria-current={pathname === item.href ? 'page' : undefined}
          className={[pathname === item.href ? 'active' : '', index === 2 || index === 6 ? 'nav-group-start' : ''].filter(Boolean).join(' ')}
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
  const currentIndex = navigation.findIndex((item) => item.href === pathname);
  const previous = navigation[currentIndex - 1];
  const next = navigation[currentIndex + 1];
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    setActiveSection('');
    const observer = new IntersectionObserver((entries) => {
      const entry = entries.find((item) => item.isIntersecting);
      if (entry) setActiveSection(`#${entry.target.id}`);
    }, { rootMargin: '-100px 0px -65% 0px' });
    document.querySelectorAll('.docs-article > h2').forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div className="docs-grid">
      <aside className="docs-sidebar"><Navigation pathname={pathname} /></aside>
      <details className="mobile-docs-nav">
        <summary><BookOpen size={16} aria-hidden="true" /><span>{navigation[currentIndex]?.label ?? 'Docs'}</span><ChevronDown size={16} aria-hidden="true" /></summary>
        <Navigation pathname={pathname} />
      </details>
      <main className="docs-article" id="main-content">
        {children}
        <nav className="docs-pagination" aria-label="Documentation pages">
          {previous ? <Link href={previous.href}><span>Previous</span><strong><ArrowLeft size={15} aria-hidden="true" />{previous.label}</strong></Link> : <span />}
          {next ? <Link href={next.href}><span>Next</span><strong>{next.label}<ArrowRight size={15} aria-hidden="true" /></strong></Link> : null}
        </nav>
        <footer className="docs-footer">Expo Draw Over Apps · SDK 58 documentation</footer>
      </main>
      <aside className="page-toc" aria-label="On this page">
        <div>
          <p>On this page</p>
          {sections.map((item) => <a aria-current={(activeSection || sections[0]?.href) === item.href ? 'location' : undefined} className={(activeSection || sections[0]?.href) === item.href ? 'active' : undefined} href={item.href} key={item.href}>{item.label}</a>)}
        </div>
      </aside>
    </div>
  );
}
