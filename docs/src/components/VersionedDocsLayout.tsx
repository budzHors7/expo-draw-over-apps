import React, { useEffect, useState, type ReactNode } from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';

export type VersionKey = '56-beta' | '55';
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
  '56-beta': {
    label: 'SDK 56 beta',
    status: 'Latest docs track',
    bundledVersion: '56.0.2-beta.1',
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
    targetVersion === '56-beta' ? 'v56.0.0' : undefined
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
  pageKey,
  routeSegment,
  selectedVersion,
}: {
  links: PageLink[];
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
  const sdk56Route = useBaseUrl(getVersionSelectRoute('56-beta', pageKey));
  const sdk55Route = useBaseUrl(getVersionSelectRoute('55', pageKey));
  const routeByVersion: Record<VersionKey, string> = {
    '56-beta': sdk56Route,
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
        <option value="55">SDK 55</option>
        <option value="56-beta">SDK 56 beta</option>
      </select>
    </label>
  );
}

function VersionSidebar({
  pageKey,
  routeSegment,
  sectionLinks,
  selectedVersion,
}: {
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
          pageKey={pageKey}
          routeSegment={routeSegment}
          selectedVersion={selectedVersion}
        />
      </nav>

      <nav aria-label="Feature documentation" className="sdkReferenceSidebarLinks sdkReferenceSidebarLinks--secondary">
        <VersionPageLinks
          links={featurePageLinks}
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
              onClick={() => setActiveSectionHref(link.href)}
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
