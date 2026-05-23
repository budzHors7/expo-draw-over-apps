import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';

export type VersionKey = '56' | '55';
export type VersionRouteSegment = 'latest' | 'v55.0.0' | 'v56.0.0';
export type VersionedPageKey =
  | 'reference'
  | 'getting-started'
  | 'tutorial'
  | 'nativewind'
  | 'fixtures'
  | 'public-api'
  | 'demo'
  | 'limitations';

type PageLink = {
  label: string;
  pageKey: VersionedPageKey;
  path: string;
};

type VersionSummary = {
  bundledVersion: string;
  label: string;
  status: string;
};

type VersionedDocsLayoutProps = {
  children: ReactNode;
  description: string;
  pageKey: VersionedPageKey;
  routeSegment?: VersionRouteSegment;
  sectionLinks?: Array<{ href: string; label: string }>;
  seoKeywords?: string[];
  title: string;
  versionKey: VersionKey;
};

export const versionSummaries: Record<VersionKey, VersionSummary> = {
  '56': {
    label: 'SDK 56',
    status: 'Latest stable docs',
    bundledVersion: '56.0.4',
  },
  '55': {
    label: 'SDK 55',
    status: 'Package version 55.0.2',
    bundledVersion: '55.0.2',
  },
};

const pageLinks: PageLink[] = [
  {
    label: 'SDK reference',
    pageKey: 'reference',
    path: '/sdk/draw-over-apps',
  },
  {
    label: 'Getting started',
    pageKey: 'getting-started',
    path: '',
  },
  {
    label: 'Tutorial',
    pageKey: 'tutorial',
    path: '/tutorial',
  },
  {
    label: 'NativeWind',
    pageKey: 'nativewind',
    path: '/nativewind',
  },
  {
    label: 'Fixtures',
    pageKey: 'fixtures',
    path: '/fixtures',
  },
  {
    label: 'Public API',
    pageKey: 'public-api',
    path: '/public-api',
  },
  {
    label: 'Demo',
    pageKey: 'demo',
    path: '/demo',
  },
  {
    label: 'Limitations',
    pageKey: 'limitations',
    path: '/limitations',
  },
];

const primaryPageLinks = pageLinks.slice(0, 2);
const featurePageLinks = pageLinks.slice(2);
const mobileSidebarMediaQuery = '(max-width: 996px)';

function getVersionRoot(versionKey: VersionKey, routeSegment?: VersionRouteSegment) {
  if (routeSegment) {
    return `/versions/${routeSegment}`;
  }

  return versionKey === '55' ? '/versions/v55.0.0' : '/versions/latest';
}

export function getVersionedPageRoute(
  versionKey: VersionKey,
  pageKey: VersionedPageKey,
  routeSegment?: VersionRouteSegment
) {
  const page = pageLinks.find((link) => link.pageKey === pageKey) ?? pageLinks[0];
  return `${getVersionRoot(versionKey, routeSegment)}${page.path}`;
}

function getVersionSelectRoute(targetVersion: VersionKey, pageKey: VersionedPageKey) {
  return getVersionedPageRoute(
    targetVersion,
    pageKey,
    targetVersion === '56' ? 'v56.0.0' : undefined
  );
}

function getSidebarLinkClass(isActive: boolean) {
  return isActive ? 'sdkReferenceSidebarLink--active' : undefined;
}

function useActiveSectionHref(sectionLinks: Array<{ href: string; label: string }>) {
  const [activeHref, setActiveHref] = useState(sectionLinks[0]?.href ?? '');
  const sectionLinkKey = sectionLinks.map((link) => link.href).join('|');

  useEffect(() => {
    if (sectionLinks.length === 0 || typeof window === 'undefined') {
      return undefined;
    }

    const sectionHrefs = new Set(sectionLinks.map((link) => link.href));

    function updateFromHash() {
      const nextHash = window.location.hash;
      setActiveHref(sectionHrefs.has(nextHash) ? nextHash : sectionLinks[0].href);
    }

    updateFromHash();
    window.addEventListener('hashchange', updateFromHash);

    if (typeof IntersectionObserver === 'undefined') {
      return () => {
        window.removeEventListener('hashchange', updateFromHash);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visibleEntry?.target.id) {
          setActiveHref(`#${visibleEntry.target.id}`);
        }
      },
      {
        rootMargin: '-22% 0px -62% 0px',
        threshold: [0, 1],
      }
    );

    sectionLinks.forEach((link) => {
      const id = link.href.startsWith('#') ? link.href.slice(1) : '';
      const section = id ? document.getElementById(id) : null;
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      window.removeEventListener('hashchange', updateFromHash);
      observer.disconnect();
    };
  }, [sectionLinkKey]);

  return [activeHref, setActiveHref] as const;
}

function VersionPageLinks({
  links,
  onNavigate,
  pageKey,
  routeSegment,
  selectedVersion,
}: {
  links: PageLink[];
  onNavigate?: () => void;
  pageKey: VersionedPageKey;
  routeSegment?: VersionRouteSegment;
  selectedVersion: VersionKey;
}) {
  return (
    <>
      {links.map((link) => (
        <Link
          className={getSidebarLinkClass(link.pageKey === pageKey)}
          key={link.pageKey}
          onClick={onNavigate}
          to={getVersionedPageRoute(selectedVersion, link.pageKey, routeSegment)}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}

function VersionSelect({
  pageKey,
  selectedVersion,
}: {
  pageKey: VersionedPageKey;
  selectedVersion: VersionKey;
}) {
  const sdk56Route = useBaseUrl(getVersionSelectRoute('56', pageKey));
  const sdk55Route = useBaseUrl(getVersionSelectRoute('55', pageKey));
  const routeByVersion: Record<VersionKey, string> = {
    '56': sdk56Route,
    '55': sdk55Route,
  };

  return (
    <label className="sdkReferenceVersionControl">
      <span>Reference version</span>
      <select
        value={selectedVersion}
        onChange={(event) => {
          window.location.href = routeByVersion[event.target.value as VersionKey];
        }}
      >
        <option value="56">SDK 56</option>
        <option value="55">SDK 55</option>
      </select>
    </label>
  );
}

function VersionSidebar({
  onNavigate,
  pageKey,
  routeSegment,
  sectionLinks,
  selectedVersion,
}: {
  onNavigate?: () => void;
  pageKey: VersionedPageKey;
  routeSegment?: VersionRouteSegment;
  sectionLinks: Array<{ href: string; label: string }>;
  selectedVersion: VersionKey;
}) {
  const version = versionSummaries[selectedVersion];
  const [activeSectionHref, setActiveSectionHref] = useActiveSectionHref(sectionLinks);

  return (
    <aside className="sdkReferenceSidebar">
      <VersionSelect pageKey={pageKey} selectedVersion={selectedVersion} />
      <div className="sdkReferenceSidebarSummary">
        <strong>{version.label}</strong>
        <span>{version.status}</span>
        <span>Bundled version: {version.bundledVersion}</span>
      </div>

      <nav aria-label="Core documentation" className="sdkReferenceSidebarLinks">
        <VersionPageLinks
          links={primaryPageLinks}
          onNavigate={onNavigate}
          pageKey={pageKey}
          routeSegment={routeSegment}
          selectedVersion={selectedVersion}
        />
      </nav>

      <nav aria-label="Feature documentation" className="sdkReferenceSidebarLinks sdkReferenceSidebarLinks--secondary">
        <VersionPageLinks
          links={featurePageLinks}
          onNavigate={onNavigate}
          pageKey={pageKey}
          routeSegment={routeSegment}
          selectedVersion={selectedVersion}
        />
      </nav>

      {sectionLinks.length > 0 ? (
        <nav aria-label="Page sections" className="sdkReferenceSidebarLinks sdkReferenceSidebarLinks--secondary">
          {sectionLinks.map((link) => (
            <a
              className={getSidebarLinkClass(activeSectionHref === link.href)}
              href={link.href}
              key={link.href}
              onClick={() => {
                setActiveSectionHref(link.href);
                onNavigate?.();
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      ) : null}
    </aside>
  );
}

function VersionedPagination({
  pageKey,
  routeSegment,
  versionKey,
}: {
  pageKey: VersionedPageKey;
  routeSegment?: VersionRouteSegment;
  versionKey: VersionKey;
}) {
  const currentIndex = pageLinks.findIndex((link) => link.pageKey === pageKey);
  const previousPage = currentIndex > 0 ? pageLinks[currentIndex - 1] : null;
  const nextPage = currentIndex >= 0 && currentIndex < pageLinks.length - 1 ? pageLinks[currentIndex + 1] : null;

  if (!previousPage && !nextPage) {
    return null;
  }

  return (
    <nav className="pagination-nav sdkReferencePagination" aria-label="Versioned docs pages">
      {previousPage ? (
        <Link
          className="pagination-nav__link pagination-nav__link--prev"
          to={getVersionedPageRoute(versionKey, previousPage.pageKey, routeSegment)}
        >
          <div className="pagination-nav__sublabel">Previous</div>
          <div className="pagination-nav__label">{previousPage.label}</div>
        </Link>
      ) : (
        <span />
      )}
      {nextPage ? (
        <Link
          className="pagination-nav__link pagination-nav__link--next"
          to={getVersionedPageRoute(versionKey, nextPage.pageKey, routeSegment)}
        >
          <div className="pagination-nav__sublabel">Next</div>
          <div className="pagination-nav__label">{nextPage.label}</div>
        </Link>
      ) : null}
    </nav>
  );
}

export function VersionedDocsLayout({
  children,
  description,
  pageKey,
  routeSegment,
  sectionLinks = [],
  seoKeywords = [],
  title,
  versionKey,
}: VersionedDocsLayoutProps) {
  const displayedRouteSegment = routeSegment ?? (versionKey === '55' ? 'v55.0.0' : 'latest');
  const version = versionSummaries[versionKey];
  const pageTitle = `${title} | ${version.label}`;
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const mobileSidebarScrollY = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    let frameId = 0;
    let navbarToggle: HTMLButtonElement | null = null;
    const mediaQuery = window.matchMedia(mobileSidebarMediaQuery);

    function toggleMobileSidebar(event: Event) {
      if (!mediaQuery.matches) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setIsMobileSidebarOpen((isOpen) => {
        if (!isOpen) {
          mobileSidebarScrollY.current = window.scrollY;
        }

        return !isOpen;
      });
    }

    function syncToggleAttributes() {
      if (!navbarToggle) {
        return;
      }

      if (!mediaQuery.matches) {
        navbarToggle.removeAttribute('aria-controls');
        navbarToggle.removeAttribute('aria-expanded');
        navbarToggle.removeAttribute('aria-label');
        return;
      }

      navbarToggle.setAttribute('aria-controls', 'sdkReferenceMobileSidebar');
      navbarToggle.setAttribute('aria-expanded', String(isMobileSidebarOpen));
      navbarToggle.setAttribute('aria-label', isMobileSidebarOpen ? 'Close docs menu' : 'Open docs menu');
    }

    function attachToNavbarToggle() {
      navbarToggle = document.querySelector<HTMLButtonElement>('.navbar__toggle');

      if (!navbarToggle) {
        frameId = window.requestAnimationFrame(attachToNavbarToggle);
        return;
      }

      navbarToggle.addEventListener('click', toggleMobileSidebar, { capture: true });
      mediaQuery.addEventListener('change', syncToggleAttributes);
      syncToggleAttributes();
    }

    attachToNavbarToggle();

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      if (navbarToggle) {
        navbarToggle.removeEventListener('click', toggleMobileSidebar, { capture: true });
        navbarToggle.removeAttribute('aria-controls');
        navbarToggle.removeAttribute('aria-expanded');
        navbarToggle.removeAttribute('aria-label');
      }

      mediaQuery.removeEventListener('change', syncToggleAttributes);
    };
  }, [isMobileSidebarOpen]);

  useEffect(() => {
    if (!isMobileSidebarOpen || typeof document === 'undefined') {
      return undefined;
    }

    const scrollY = mobileSidebarScrollY.current;
    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMobileSidebarOpen(false);
      }
    }

    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      window.scrollTo(0, scrollY);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isMobileSidebarOpen]);

  return (
    <Layout title={pageTitle} description={description}>
      <Head>
        <meta name="twitter:title" content={`${pageTitle} | Expo Draw Over Apps`} />
        <meta name="twitter:description" content={description} />
        {seoKeywords.length > 0 ? <meta name="keywords" content={seoKeywords.join(',')} /> : null}
      </Head>
      <main className="sdkReference">
        <VersionSidebar
          pageKey={pageKey}
          routeSegment={routeSegment}
          sectionLinks={sectionLinks}
          selectedVersion={versionKey}
        />
        <div
          aria-hidden={!isMobileSidebarOpen}
          className={`sdkReferenceMobileDrawer${isMobileSidebarOpen ? ' sdkReferenceMobileDrawer--open' : ''}`}
          id="sdkReferenceMobileSidebar"
        >
          <button
            aria-label="Close docs menu"
            className="sdkReferenceMobileDrawerBackdrop"
            onClick={() => setIsMobileSidebarOpen(false)}
            tabIndex={isMobileSidebarOpen ? 0 : -1}
            type="button"
          />
          <div
            aria-label="Versioned docs menu"
            aria-modal={isMobileSidebarOpen}
            className="sdkReferenceMobileDrawerPanel"
            role="dialog"
          >
            <div className="sdkReferenceMobileDrawerHeader">
              <strong>Docs</strong>
              <button
                aria-label="Close docs menu"
                className="sdkReferenceMobileDrawerClose"
                onClick={() => setIsMobileSidebarOpen(false)}
                type="button"
              >
                <span aria-hidden="true" />
              </button>
            </div>
            <VersionSidebar
              onNavigate={() => setIsMobileSidebarOpen(false)}
              pageKey={pageKey}
              routeSegment={routeSegment}
              sectionLinks={sectionLinks}
              selectedVersion={versionKey}
            />
          </div>
        </div>
        <article className="sdkReferenceContent">
          <div className="sdkReferenceBreadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>versions</span>
            <span>/</span>
            <span>{displayedRouteSegment}</span>
          </div>

          {children}

          <VersionedPagination pageKey={pageKey} routeSegment={routeSegment} versionKey={versionKey} />
        </article>
      </main>
    </Layout>
  );
}
