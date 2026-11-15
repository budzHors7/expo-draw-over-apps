export const documentation = [
  { href: '/docs', label: 'Overview' },
  { href: '/docs/permission', label: 'Permission' },
  { href: '/docs/react-native-window', label: 'React Native window' },
  { href: '/docs/native-window', label: 'Native window' },
  { href: '/docs/multiple-windows', label: 'Multiple windows' },
  { href: '/docs/window-controls', label: 'Window controls' },
  { href: '/docs/limitations', label: 'Limitations' },
  { href: '/docs/public-api', label: 'Public API' },
];

export const sectionId = (text: string) => text.toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

export const assetPath = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`;
