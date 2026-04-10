import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ThemeProvider } from '../components/theme-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'expo-draw-over-apps',
  description: 'Android overlay permission helpers and floating React Native bubbles for Expo apps.',
  openGraph: {
    title: 'expo-draw-over-apps',
    description: 'Android overlay permission helpers and floating React Native bubbles for Expo apps.',
    siteName: 'expo-draw-over-apps',
    type: 'website',
    url: 'https://github.com/budzHors7/expo-draw-over-apps',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'expo-draw-over-apps',
    description: 'Android overlay permission helpers and floating React Native bubbles for Expo apps.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-stone-50 font-sans text-slate-950 antialiased dark:bg-ink-950 dark:text-sand-50">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
