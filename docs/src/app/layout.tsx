import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Expo Draw Over Apps',
    template: '%s · Expo Draw Over Apps',
  },
  description: 'Expo SDK 58 Android overlay windows with React Native or Jetpack Compose.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>
        <header className="site-header">
          <Link className="brand" href="/">
            <span aria-hidden="true" className="brand-mark">▣</span>
            <span>Expo Draw Over Apps</span>
          </Link>
          <nav aria-label="Primary navigation">
            <Link href="/docs">Docs</Link>
            <a href="https://github.com/budzHors7/expo-draw-over-apps">GitHub ↗</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
