'use client';

import { useEffect, useState } from 'react';

const REPOSITORY_URL = 'https://github.com/budzHors7/expo-draw-over-apps';
const REPOSITORY_API_URL = 'https://api.github.com/repos/budzHors7/expo-draw-over-apps';

const starFormatter = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  maximumFractionDigits: 1,
});

type RepoResponse = {
  stargazers_count?: number;
};

export function GitHubStarButton() {
  const [starCount, setStarCount] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStars() {
      try {
        const response = await fetch(REPOSITORY_API_URL, {
          signal: controller.signal,
          headers: {
            Accept: 'application/vnd.github+json',
          },
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as RepoResponse;

        if (typeof data.stargazers_count === 'number') {
          setStarCount(starFormatter.format(data.stargazers_count));
        }
      } catch {
        // Leave the badge in its fallback state when the public GitHub API is unavailable.
      }
    }

    void loadStars();

    return () => controller.abort();
  }, []);

  return (
    <a
      href={REPOSITORY_URL}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-w-0 items-center justify-center gap-2 rounded-full border border-zinc-900/10 bg-white px-3 py-2 text-sm font-medium text-zinc-950 transition hover:border-zinc-900/20 hover:bg-zinc-100 sm:px-4 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
    >
      <span className="inline-flex items-center justify-center rounded-full border border-zinc-900/10 bg-zinc-50 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-zinc-500 sm:px-2.5 sm:text-[11px] sm:tracking-[0.18em] dark:border-white/10 dark:bg-white/6 dark:text-zinc-300">
        <span className="inline-flex items-center justify-center gap-1.5 leading-none tabular-nums">
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 20 20"
            className="h-3.5 w-3.5 shrink-0 fill-current"
          >
            <path d="M10 1.5 12.59 6.75l5.8.84-4.2 4.09.99 5.78L10 14.74 4.82 17.46l.99-5.78-4.2-4.09 5.8-.84L10 1.5Z" />
          </svg>
          {starCount ?? ''}
        </span>
      </span>
      <span className="truncate leading-none">GitHub</span>
    </a>
  );
}
