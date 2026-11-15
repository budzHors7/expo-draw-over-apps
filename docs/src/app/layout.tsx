import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SiteHeader } from '../components/SiteHeader';
import { assetPath } from '../lib/navigation';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Expo Draw Over Apps',
    template: '%s · Expo Draw Over Apps',
  },
  description: 'Expo SDK 58 Android overlay windows with React Native or Jetpack Compose.',
  icons: { icon: assetPath('/images/overlay-logo.png') },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var p='system';try{var s=localStorage.getItem('expo-overlay-docs-theme');if(s==='light'||s==='dark')p=s}catch(e){}var d=p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';document.documentElement.dataset.themePreference=p})()` }} />
      </head>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
