export const siteConfig = {
  name: 'Expo Draw Over Apps',
  packageName: 'expo-draw-over-apps',
  title: 'Expo Draw Over Apps | Android overlay permissions and floating bubble UI for Expo apps',
  description:
    'Open source Expo module for Android overlay permissions, draggable floating bubble UI, synchronized bubble state, and custom React Native renderers.',
  url: 'https://expo-draw-over-apps.vercel.app',
  repoUrl: 'https://github.com/budzHors7/expo-draw-over-apps',
  creatorName: 'Anda Hanise',
  creatorUrl: 'https://github.com/budzHors7',
  creatorHandle: '@budzHors7',
  socialImage: 'https://expo-draw-over-apps.vercel.app/og-preview.png',
  twitterImage: 'https://expo-draw-over-apps.vercel.app/twitter-preview.png',
  favicon: 'https://expo-draw-over-apps.vercel.app/favicon.svg',
  imageAlt:
    'Expo Draw Over Apps social preview showing Android overlay permissions and floating bubble UI for Expo apps.',
  keywords: [
    'expo draw over apps',
    'expo android overlay',
    'react native floating bubble',
    'expo floating bubble',
    'android draw over other apps',
    'expo module',
    'react native overlay permission',
    'expo android permission',
    'nativewind bubble renderer',
  ],
} as const;

export const siteStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${siteConfig.url}#creator`,
      name: siteConfig.creatorName,
      url: siteConfig.creatorUrl,
    },
    {
      '@type': 'WebSite',
      '@id': `${siteConfig.url}#website`,
      name: siteConfig.name,
      alternateName: siteConfig.packageName,
      url: siteConfig.url,
      description: siteConfig.description,
      inLanguage: 'en',
      publisher: {
        '@id': `${siteConfig.url}#creator`,
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${siteConfig.url}#application`,
      name: siteConfig.name,
      alternateName: siteConfig.packageName,
      description: siteConfig.description,
      url: siteConfig.url,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Android',
      image: siteConfig.socialImage,
      isAccessibleForFree: true,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      author: {
        '@id': `${siteConfig.url}#creator`,
      },
    },
    {
      '@type': 'SoftwareSourceCode',
      '@id': `${siteConfig.url}#source`,
      name: siteConfig.name,
      alternateName: siteConfig.packageName,
      codeRepository: siteConfig.repoUrl,
      codeSampleType: 'full',
      description: siteConfig.description,
      programmingLanguage: ['TypeScript', 'Kotlin'],
      runtimePlatform: 'Android',
      license: 'https://opensource.org/licenses/MIT',
      url: siteConfig.url,
      author: {
        '@id': `${siteConfig.url}#creator`,
      },
    },
  ],
} as const;
