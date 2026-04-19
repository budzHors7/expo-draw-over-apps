export const navLinks = [
  { href: '#overview', label: 'Overview' },
  { href: '#install', label: 'Quick start' },
  { href: '#api', label: 'API' },
  { href: '#opensource', label: 'Open source' },
];

export const heroStats = [
  {
    value: 'Android only',
    label: 'Focused on overlays, permissions, named bubbles, and service-driven UI instead of pretending to be a broad cross-platform abstraction.',
  },
  {
    value: 'Edge-hide ready',
    label: 'Opt a bubble into a reachable side sliver with edgeHideEnabled or toggle that behavior later with setEdgeHideEnabled().',
  },
  {
    value: 'expo-ui supported',
    label: 'Use the packaged Compose-flavored renderer API, with current overlay builds falling back to the stable React Native surface.',
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
    eyebrow: 'Edge hide',
    title: 'Let the bubble tuck into the edge and stay recoverable.',
    body: 'Pass edgeHideEnabled into showBubble() or flip it later with setEdgeHideEnabled() when a named bubble should leave a clickable sliver on the left or right side.',
    tags: ['edgeHideEnabled', 'setEdgeHideEnabled()', 'Per bubble'],
    className: 'lg:col-span-4',
    accent: 'bg-zinc-950/[0.03] dark:bg-white/[0.03]',
  },
  {
    eyebrow: 'Realtime sync',
    title: 'The app and every bubble stay aligned on count, visibility, and source of change.',
    body: 'useBubbleState(), useAllBubbleStates(), refreshBubbleState(), and the counter helpers make multiple overlays feel like part of the app instead of detached widgets.',
    tags: ['useBubbleState()', 'useAllBubbleStates()', 'Shared counter'],
    className: 'lg:col-span-3',
    accent: 'bg-zinc-950/[0.03] dark:bg-white/[0.03]',
  },
  {
    eyebrow: 'expo-ui path',
    title: 'Use the packaged Compose-flavored renderer API when your app already ships @expo/ui.',
    body: 'setComposeBubbleRenderer() gives you the public expo-ui integration point, while current Android overlay builds still fall back to a stable React Native renderer for safety.',
    tags: ['@expo/ui', 'setComposeBubbleRenderer()', 'Fallback renderer'],
    className: 'lg:col-span-7',
    accent: 'bg-zinc-950/[0.03] dark:bg-white/[0.03]',
  },
  {
    eyebrow: 'Renderer swap',
    title: 'Keep the native service and still design each bubble your way.',
    body: 'Use setBubbleRenderer() globally or setBubbleRendererForBubble() per bubble with StyleSheet, NativeWind, inline styles, or the packaged Compose-flavored path.',
    tags: ['setBubbleRenderer()', 'setBubbleRendererForBubble()', 'StyleSheet / NativeWind'],
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
    title: 'Show the named bubble',
    body: 'Call showBubble(bubbleId, { edgeHideEnabled }) to make a specific overlay visible and decide whether it can tuck into the screen edge.',
  },
  {
    step: '04',
    title: 'Pick renderer and sync state',
    body: 'Use setBubbleRenderer(), setComposeBubbleRenderer(), and the shared state helpers to keep the app and every bubble aligned.',
  },
];

export const apiGroups = [
  {
    title: 'Permissions',
    items: ['canDrawOverlays(): boolean', 'requestPermission(): Promise<boolean>'],
  },
  {
    title: 'Visibility',
    items: [
      'showBubble(bubbleId?: string, options?: BubbleDisplayOptions): Promise<boolean>',
      'hideBubble(bubbleId?: string): boolean',
      'hideAllBubbles(): boolean',
      'isBubbleVisible(bubbleId?: string): boolean',
      'openApp(): Promise<boolean>',
    ],
  },
  {
    title: 'Edge hide',
    items: ['setEdgeHideEnabled(enabled: boolean, bubbleId?: string): boolean', 'BubbleDisplayOptions'],
  },
  {
    title: 'Shared state',
    items: [
      'getAllBubbleStates(): BubbleState[]',
      "incrementBubbleCount(source?: 'app' | 'bubble', bubbleId?: string): number",
      "decrementBubbleCount(source?: 'app' | 'bubble', bubbleId?: string): number",
      "setBubbleCount(count: number, source?: 'app' | 'bubble', bubbleId?: string): number",
      'refreshBubbleState(bubbleId?: string): BubbleState',
      'subscribeToBubbleState(listener): () => void',
      'useBubbleState(bubbleId?: string): BubbleState',
      'useAllBubbleStates(): BubbleState[]',
    ],
  },
  {
    title: 'Customization',
    items: [
      'setBubbleRenderer(renderer: BubbleRenderer | null): void',
      'setBubbleRendererForBubble(bubbleId: string, renderer: BubbleRenderer | null): void',
      'setComposeBubbleRenderer(bubbleId?: string): BubbleRenderer',
      'ExpoDrawOverAppsComposeBubbleRenderer',
      'BubbleState',
      'BubbleRendererProps',
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
    detail: 'Inspect the working Expo example that requests permission, toggles edge hide, switches renderer paths, and syncs the counter.',
  },
  {
    href: 'https://github.com/budzHors7/expo-draw-over-apps/issues',
    label: 'Issue tracker',
    detail: 'Collect bugs, feature requests, integration edge cases, and setup feedback in one public place.',
  },
];
