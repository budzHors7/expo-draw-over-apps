export const navLinks = [
  { href: '#overview', label: 'Overview' },
  { href: '#install', label: 'Quick start' },
  { href: '#api', label: 'API' },
  { href: '#opensource', label: 'Open source' },
];

export const heroStats = [
  {
    value: 'Android only',
    label: 'Focused on overlays, permissions, and service-driven UI instead of pretending to be a broad cross-platform abstraction.',
  },
  {
    value: 'React Native bubble',
    label: 'Use the shipped floating UI or replace it with your own renderer and design language.',
  },
  {
    value: 'Open repo workflow',
    label: 'Docs, source, the example app, and issues all stay connected to the same public GitHub project.',
  },
];

export const featureTiles = [
  {
    eyebrow: 'Permission flow',
    title: 'Ask for overlay access only when Android actually blocks you.',
    body: 'Start with canDrawOverlays(), send users into settings only when needed, then refresh when the app becomes active again.',
    tags: ['canDrawOverlays()', 'requestPermission()', 'Lifecycle friendly'],
    className: 'lg:col-span-5',
    accent: 'bg-zinc-950/[0.03] dark:bg-white/[0.03]',
  },
  {
    eyebrow: 'Renderer swap',
    title: 'Keep the native service and still design the bubble your way.',
    body: 'setBubbleRenderer() gives you a narrow seam for customization without throwing away the working Android overlay plumbing.',
    tags: ['Custom UI', 'React Native components', 'StyleSheet or NativeWind'],
    className: 'lg:col-span-4',
    accent: 'bg-zinc-950/[0.03] dark:bg-white/[0.03]',
  },
  {
    eyebrow: 'Realtime sync',
    title: 'The bubble and the app stay aligned on count, visibility, and source of change.',
    body: 'useBubbleState(), refreshBubbleState(), and the counter helpers make the overlay feel like part of the app instead of a detached widget.',
    tags: ['useBubbleState()', 'Shared counter', 'Visible state'],
    className: 'lg:col-span-3',
    accent: 'bg-zinc-950/[0.03] dark:bg-white/[0.03]',
  },
  {
    eyebrow: 'Expo fit',
    title: 'Made for dev builds, custom clients, and standalone Android builds.',
    body: 'This module ships native Android code, so the docs stay honest about where it runs and where it does not.',
    tags: ['No Expo Go', 'Development builds', 'Android service'],
    className: 'lg:col-span-7',
    accent: 'bg-zinc-950/[0.03] dark:bg-white/[0.03]',
  },
  {
    eyebrow: 'Open source shape',
    title: 'Readers can move from the docs into code, issues, and the example app in one hop.',
    body: 'That keeps the website useful without becoming a documentation island that drifts away from the repository.',
    tags: ['GitHub', 'Example app', 'Issues'],
    className: 'lg:col-span-5',
    accent: 'bg-zinc-950/[0.03] dark:bg-white/[0.03]',
  },
];

export const workflowSteps = [
  {
    step: '01',
    title: 'Read permission state',
    body: 'Use canDrawOverlays() to know whether Android already allows the overlay window.',
  },
  {
    step: '02',
    title: 'Send the user to settings',
    body: 'Call requestPermission() only when permission is missing, then wait for the app to become active again.',
  },
  {
    step: '03',
    title: 'Start the bubble service',
    body: 'showBubble() makes the floating UI visible and ready to move above other apps.',
  },
  {
    step: '04',
    title: 'Sync app and bubble actions',
    body: 'Counter updates and visibility changes stay in sync through the shared state helpers.',
  },
];

export const apiGroups = [
  {
    title: 'Permissions',
    items: ['canDrawOverlays(): boolean', 'requestPermission(): Promise<boolean>'],
  },
  {
    title: 'Bubble visibility',
    items: [
      'showBubble(): Promise<boolean>',
      'hideBubble(): boolean',
      'isBubbleVisible(): boolean',
      'openApp(): Promise<boolean>',
    ],
  },
  {
    title: 'Shared state',
    items: [
      "incrementBubbleCount(source?: 'app' | 'bubble')",
      "decrementBubbleCount(source?: 'app' | 'bubble')",
      "setBubbleCount(count: number, source?: 'app' | 'bubble')",
      'refreshBubbleState(): BubbleState',
      'subscribeToBubbleState(listener): () => void',
      'useBubbleState(): BubbleState',
    ],
  },
  {
    title: 'Customization',
    items: [
      'setBubbleRenderer(renderer: BubbleRenderer | null): void',
      'BubbleRendererProps',
      'BubbleState',
    ],
  },
];

export const projectLinks = [
  {
    href: 'https://github.com/budzHors7/expo-draw-over-apps',
    label: 'GitHub repo',
    detail: 'Browse the module source, README, release history, and the current docs code.',
  },
  {
    href: 'https://github.com/budzHors7/expo-draw-over-apps/tree/main/example',
    label: 'Example app',
    detail: 'Inspect the working Expo example that requests permission, shows the bubble, and syncs the counter.',
  },
  {
    href: 'https://github.com/budzHors7/expo-draw-over-apps/issues',
    label: 'Issue tracker',
    detail: 'Collect bugs, feature requests, integration edge cases, and setup feedback in one public place.',
  },
];
