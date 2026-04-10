import { fileURLToPath } from 'node:url';

const isGithubPagesBuild = process.env.GITHUB_ACTIONS === 'true';
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const basePath = isGithubPagesBuild && repositoryName ? `/${repositoryName}` : '';
const docsRoot = fileURLToPath(new URL('.', import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  outputFileTracingRoot: docsRoot,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.modules = [
      fileURLToPath(new URL('./node_modules', import.meta.url)),
      ...(config.resolve.modules ?? []),
    ];
    return config;
  },
  ...(basePath
    ? {
        assetPrefix: basePath,
        basePath,
      }
    : {}),
};

export default nextConfig;
