'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
  { value: 'dark', label: 'Dark' },
] as const;

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
            className={`rounded-full px-3 py-2 transition ${
              isActive
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                : 'text-zinc-700 hover:bg-zinc-950/5 dark:text-zinc-200 dark:hover:bg-white/8'
            }`}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
