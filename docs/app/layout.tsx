import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ThemeProvider } from '../components/theme-provider';
import { siteConfig, siteStructuredData } from '../lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.keywords],
  authors: [
    {
      name: siteConfig.creatorName,
      url: siteConfig.creatorUrl,
    },
  ],
  creator: siteConfig.creatorName,
  publisher: siteConfig.creatorName,
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    type: 'website',
    url: siteConfig.url,
    locale: 'en_US',
    images: [
      {
        url: siteConfig.socialImage,
        width: 1200,
        height: 630,
        alt: siteConfig.imageAlt,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    creator: siteConfig.creatorHandle,
    images: [siteConfig.twitterImage],
  },
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: ['/favicon.svg'],
    apple: ['/favicon.svg'],
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(siteStructuredData),
          }}
        />
      </head>
      <body className="min-h-screen bg-stone-50 font-sans text-slate-950 antialiased dark:bg-ink-950 dark:text-sand-50">
        <a
          href="#main-content"
          className="sr-only absolute left-4 top-4 z-[60] rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:outline-none dark:bg-white dark:text-zinc-950"
        >
          Skip to main content
        </a>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
