import fs from 'node:fs';
import path from 'node:path';

const repositoryRoot = path.resolve(__dirname, '../..');
const docsRoot = path.join(repositoryRoot, 'docs');

function read(relativePath: string): string {
  const absolutePath = path.join(repositoryRoot, relativePath);
  return fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, 'utf8') : '';
}

function readTree(root: string): string {
  if (!fs.existsSync(root)) return '';

  return fs.readdirSync(root, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((entry) => {
      const entryPath = path.join(root, entry.name);
      return entry.isDirectory() ? readTree(entryPath) : fs.readFileSync(entryPath, 'utf8');
    })
    .join('\n');
}

describe('SDK 58 documentation site', () => {
  it('uses Next.js MDX with a GitHub Pages static export', () => {
    const manifest = JSON.parse(read('docs/package.json')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const dependencies = { ...manifest.dependencies, ...manifest.devDependencies };
    const nextConfig = read('docs/next.config.mjs');

    expect(dependencies).toEqual(expect.objectContaining({
      '@next/mdx': expect.any(String),
      next: expect.any(String),
      react: expect.any(String),
      'react-dom': expect.any(String),
    }));
    expect(Object.keys(dependencies).some((name) => name.includes('docusaurus'))).toBe(false);
    expect(nextConfig).toContain("output: 'export'");
    expect(nextConfig).toContain("'/expo-draw-over-apps'");
  });

  it('contains one complete SDK 58 guide for both window APIs and coordinates', () => {
    const activeContent = [read('README.md'), readTree(path.join(docsRoot, 'src'))].join('\n');

    expect(activeContent).toContain('Expo SDK 58');
    expect(activeContent).toContain('ReactNativeWindow');
    expect(activeContent).toContain('NativeWindow');
    expect(activeContent).toContain('setBubbleRendererForBubble');
    expect(activeContent).toMatch(/showBubble\([^)]*\{\s*x:\s*\d+,\s*y:\s*\d+/s);
    expect(activeContent).toContain("location: 'bottom-right'");
    expect(activeContent).toContain("location: 'top-right'");
    expect(activeContent).toContain("location: 'top-center'");
    expect(activeContent).toContain("location: 'center'");
    expect(activeContent).toContain("location: 'bottom-center'");
    expect(activeContent).toContain('bunx expo install expo-draw-over-apps');
    expect(activeContent).toContain('https://docs.expo.dev/versions/v58.0.0/sdk/ui/jetpack-compose/');
  });

  it('documents registering and showing multiple independent overlay windows', () => {
    const multipleWindowsGuide = read('docs/src/app/docs/multiple-windows/page.mdx');

    expect(multipleWindowsGuide).toContain(
      'setBubbleRendererForBubble(CALL_CONTROLS_ID, CallControlsWindow)'
    );
    expect(multipleWindowsGuide).toContain(
      'setBubbleRendererForBubble(UPLOAD_STATUS_ID, UploadStatusWindow)'
    );
    expect(multipleWindowsGuide).toContain("showBubble(CALL_CONTROLS_ID, { location: 'top-left' })");
    expect(multipleWindowsGuide).toContain(
      "showBubble(UPLOAD_STATUS_ID, { location: 'bottom-right' })"
    );
    expect(multipleWindowsGuide).toContain("import { Stack } from 'expo-router/stack'");
    expect(multipleWindowsGuide).toContain('export default function RootLayout()');
    expect(multipleWindowsGuide).toContain('// App.tsx');
    expect(multipleWindowsGuide).toContain('export default function App()');
    expect(multipleWindowsGuide).toContain('<OverlayWindowsRegistration>');
    expect(multipleWindowsGuide).toContain('<SetupTabs>');
    expect(multipleWindowsGuide).toContain('label="Expo Router"');
    expect(multipleWindowsGuide).toContain('label="App.tsx / no Router"');
    expect(multipleWindowsGuide).toContain('CONTACT_WINDOW_IDS.map');
  });

  it('removes version selectors, old window names, and Docusaurus runtime code', () => {
    const activeContent = [
      read('README.md'),
      read('docs/package.json'),
      read('docs/next.config.mjs'),
      readTree(path.join(docsRoot, 'src')),
      read('.github/workflows/deploy-docs.yml'),
    ].join('\n');

    expect(activeContent).not.toMatch(/@docusaurus|docusaurus\.config|pages\/versions|VersionedDocs|routeSegment/i);
    expect(activeContent).not.toMatch(/SDK 5[5-7]/);
    expect(activeContent).not.toMatch(
      /ReactNativeWindowContainer|NativeWindowContainer|setComposeBubbleRenderer|ExpoDrawOverAppsComposeBubbleRenderer/
    );
  });
});
