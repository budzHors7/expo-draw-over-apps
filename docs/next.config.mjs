import createMDX from '@next/mdx';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const githubPagesBasePath = '/expo-draw-over-apps';
const isGithubPagesBuild = process.env.GITHUB_ACTIONS === 'true';
const basePath = isGithubPagesBuild ? githubPagesBasePath : '';
const docsRoot = path.dirname(fileURLToPath(import.meta.url));

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX({
  output: 'export',
  trailingSlash: true,
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  basePath,
  assetPrefix: basePath || undefined,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: docsRoot,
  },
});
