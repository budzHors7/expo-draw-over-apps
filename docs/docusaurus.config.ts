import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { themes } from 'prism-react-renderer';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'expo-draw-over-apps';
const repositoryOwner = process.env.GITHUB_REPOSITORY_OWNER ?? 'budzHors7';
const repositoryOwnerSlug = repositoryOwner.toLowerCase();
const repoUrl = 'https://github.com/budzHors7/expo-draw-over-apps';
const repoStars = 1;
const isGithubPagesBuild = process.env.GITHUB_ACTIONS === 'true';
const siteUrl = isGithubPagesBuild ? `https://${repositoryOwnerSlug}.github.io` : 'https://expo-draw-over-apps.vercel.app';
const baseUrl = isGithubPagesBuild ? `/${repositoryName}/` : '/';
const siteTitle = 'Expo Draw Over Apps';
const siteDescription =
  'Versioned docs for expo-draw-over-apps, an Android overlay permission and floating bubble Expo module.';
const siteBaseUrl = `${siteUrl}${baseUrl}`;
const socialImageUrl = `${siteBaseUrl}img/og-preview.png`;

const config: Config = {
  title: siteTitle,
  tagline: 'Android overlay permissions and floating bubble UI for Expo apps',
  favicon: 'img/favicon.svg',
  url: siteUrl,
  baseUrl,
  headTags: [
    {
      tagName: 'meta',
      attributes: {
        property: 'og:image:width',
        content: '1200',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:image:height',
        content: '630',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:image:alt',
        content: `${siteTitle} documentation preview`,
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'twitter:title',
        content: `${siteTitle} | Android overlay bubbles for Expo apps`,
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'twitter:description',
        content: siteDescription,
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'twitter:image:alt',
        content: `${siteTitle} documentation preview`,
      },
    },
  ],
  organizationName: repositoryOwner,
  projectName: repositoryName,
  trailingSlash: false,
  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        entryPoints: ['../src/index.ts'],
        tsconfig: '../tsconfig.json',
        out: 'docs/public-api',
        readme: 'none',
        disableSources: true,
        sort: ['source-order'],
        visibilityFilters: {
          private: false,
          protected: false,
          inherited: true,
          external: true,
        },
        sidebar: {
          autoConfiguration: true,
          pretty: true,
        },
      },
    ],
  ],
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: 'generated',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/budzHors7/expo-draw-over-apps/tree/main/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    image: 'img/og-preview.png',
    metadata: [
      {
        name: 'description',
        content: siteDescription,
      },
      {
        name: 'keywords',
        content: [
          'expo draw over apps',
          'expo android overlay',
          'react native floating bubble',
          'expo floating bubble',
          'android draw over other apps',
          'expo module',
          'expo sdk module',
          'expo sdk versioned docs',
          'react native overlay permission',
          'expo ui bubble renderer',
          'nativewind bubble renderer',
          'react native android overlay service',
        ].join(','),
      },
    ],
    navbar: {
      title: 'Expo Draw Over Apps',
      logo: {
        alt: 'Expo Draw Over Apps logo',
        src: 'img/expo-draw-over-apps-mark.svg',
        srcDark: 'img/expo-draw-over-apps-mark-dark.svg',
      },
      items: [
        {
          to: '/versions/v55.0.0/sdk/draw-over-apps/',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/versions/v55.0.0/public-api/',
          position: 'left',
          label: 'Public API',
        },
        {
          type: 'custom-githubStars',
          href: repoUrl,
          starCount: repoStars,
          position: 'right',
        },
      ],
    },
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    announcementBar: {
      id: 'pre-release-v56',
      content: `Pre-release v56 of expo-draw-over-apps is now available <a class="announcementBarLink" href="${baseUrl}versions/v56.0.0/sdk/draw-over-apps">v56 docs</a>`,
      backgroundColor: '#111827',
      textColor: '#ffffff',
      isCloseable: false,
    },
    colorMode: {
      respectPrefersColorScheme: true,
    },
    prism: {
      theme: themes.github,
      darkTheme: themes.dracula,
      additionalLanguages: ['bash', 'java', 'kotlin'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
