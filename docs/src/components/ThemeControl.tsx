'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type ThemePreference = 'light' | 'dark' | 'system';
const storageKey = 'expo-overlay-docs-theme';

export function ThemeControl() {
  const [preference, setPreference] = useState<ThemePreference>('system');

  useEffect(() => {
    const saved = document.documentElement.dataset.themePreference;
    if (saved === 'light' || saved === 'dark') setPreference(saved);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const synchronize = () => {
      const choice = document.documentElement.dataset.themePreference;
      if (choice === 'system') document.documentElement.dataset.theme = media.matches ? 'dark' : 'light';
    };
    media.addEventListener('change', synchronize);
    return () => media.removeEventListener('change', synchronize);
  }, []);

  function changeTheme(choice: ThemePreference) {
    setPreference(choice);
    const dark = choice === 'dark' || (choice === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.dataset.themePreference = choice;
    try { window.localStorage.setItem(storageKey, choice); } catch { /* Storage may be disabled. */ }
  }

  const Icon = preference === 'system' ? Monitor : preference === 'dark' ? Moon : Sun;
  return (
    <label className="theme-control">
      <Icon aria-hidden="true" size={16} />
      <select aria-label="Color theme" value={preference} onChange={(event) => changeTheme(event.target.value as ThemePreference)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </label>
  );
}
