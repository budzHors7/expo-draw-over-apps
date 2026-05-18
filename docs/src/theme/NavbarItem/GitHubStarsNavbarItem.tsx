import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

type GitHubStarsNavbarItemProps = {
  className?: string;
  href: string;
  isDropdownItem?: boolean;
  mobile?: boolean;
  position?: 'left' | 'right';
  starCount: number;
};

function getGitHubApiUrl(href: string): string | null {
  try {
    const url = new URL(href);
    const [owner, repo] = url.pathname.split('/').filter(Boolean);

    if (!owner || !repo || url.hostname !== 'github.com') {
      return null;
    }

    return `https://api.github.com/repos/${owner}/${repo}`;
  } catch {
    return null;
  }
}

function formatStars(count: number): string {
  return new Intl.NumberFormat('en-US', { notation: count >= 1000 ? 'compact' : 'standard' }).format(count);
}

function StarIcon(): JSX.Element {
  return (
    <svg className="navbar-stars-button__icon" aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="m12 2.6 2.85 5.78 6.38.93-4.62 4.5 1.09 6.35L12 17.16l-5.7 3 1.09-6.35-4.62-4.5 6.38-.93L12 2.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function GitHubStarsNavbarItem({
  className,
  href,
  isDropdownItem = false,
  mobile = false,
  position: _position,
  starCount,
}: GitHubStarsNavbarItemProps): JSX.Element {
  const [count, setCount] = useState(starCount);
  const apiUrl = useMemo(() => getGitHubApiUrl(href), [href]);
  const formattedStars = formatStars(count);
  const label = `Open GitHub repository, ${formattedStars} ${count === 1 ? 'star' : 'stars'}`;
  const linkClassName = clsx(
    mobile ? 'menu__link' : isDropdownItem ? 'dropdown__link' : 'navbar__item navbar__link',
    'navbar-stars-button',
    className,
  );

  useEffect(() => {
    if (!apiUrl) {
      return;
    }

    const controller = new AbortController();

    fetch(apiUrl, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((repo: { stargazers_count?: number } | null) => {
        if (typeof repo?.stargazers_count === 'number') {
          setCount(repo.stargazers_count);
        }
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [apiUrl]);

  const element = (
    <a className={linkClassName} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
      <span className="navbar-stars-button__label">GitHub</span>
      <StarIcon />
      <span className="navbar-stars-button__count">{formattedStars}</span>
    </a>
  );

  if (mobile || isDropdownItem) {
    return <li className={mobile ? 'menu__list-item' : undefined}>{element}</li>;
  }

  return element;
}
