'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
  { value: 'dark', label: 'Dark' },
] as const;

function ThemeIcon({ value }: { value: (typeof themeOptions)[number]['value'] }) {
  if (value === 'light') {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current">
        <circle cx="10" cy="10" r="3.5" strokeWidth="1.6" />
        <path
          d="M10 1.75v2.1M10 16.15v2.1M18.25 10h-2.1M3.85 10h-2.1M15.83 4.17l-1.48 1.48M5.65 14.35l-1.48 1.48M15.83 15.83l-1.48-1.48M5.65 5.65 4.17 4.17"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (value === 'dark') {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 20 20" className="h-4 w-4 fill-current">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.5 2a.75.75 0 0 1 .64 1.14A6.5 6.5 0 1 0 16.86 13a.75.75 0 0 1 1.14.64A7.75 7.75 0 1 1 10.5 2Z"
        />
        <path d="M14.75 2.4l.24.74a.45.45 0 0 0 .29.29l.74.24-.74.24a.45.45 0 0 0-.29.29l-.24.74-.24-.74a.45.45 0 0 0-.29-.29l-.74-.24.74-.24a.45.45 0 0 0 .29-.29l.24-.74Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current">
      <rect x="2.5" y="3" width="15" height="10.5" rx="2" strokeWidth="1.5" />
      <path d="M7 17h6M10 13.5V17" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedTheme = mounted ? (theme ?? 'system') : 'system';

  return (
    <div className="inline-flex rounded-full border border-zinc-900/10 bg-white p-1 text-xs font-medium text-zinc-700 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200">
      {themeOptions.map((option) => {
        const isActive = selectedTheme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-label={option.label}
            title={option.label}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${
              isActive
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                : 'text-zinc-700 hover:bg-zinc-950/5 dark:text-zinc-200 dark:hover:bg-white/8'
            }`}
            aria-pressed={isActive}
          >
            <ThemeIcon value={option.value} />
          </button>
        );
      })}
    </div>
  );
}
