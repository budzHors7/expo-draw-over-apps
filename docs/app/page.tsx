import { BrandLogo } from '../components/brand-logo';
import { GitHubStarButton } from '../components/github-star-button';
import { HighlightedCode } from '../components/highlighted-code';
import { CodePanel, ExternalLinkCard, SectionHeader } from '../components/home-primitives';
import { ThemeToggle } from '../components/theme-toggle';
import {
  apiGroups,
  featureTiles,
  heroStats,
  navLinks,
  projectLinks,
  workflowSteps,
} from '../lib/home-content';
import {
  composeRendererSnippet,
  customRendererSnippet,
  edgeHideSnippet,
  installSnippet,
  quickStartSnippet,
  tailwindRendererSnippet,
} from '../lib/snippets';

const openSourceQuickLinks = [
  {
    href: 'https://github.com/budzHors7/expo-draw-over-apps',
    label: 'Repo source',
  },
  {
    href: 'https://github.com/budzHors7/expo-draw-over-apps/tree/main/example',
    label: 'Example app',
  },
  {
    href: 'https://github.com/budzHors7/expo-draw-over-apps/issues',
    label: 'Issues and feedback',
  },
];

export default function HomePage() {
  return (
    <main
      id="main-content"
      role="main"
      tabIndex={-1}
      className="relative w-full overflow-x-hidden overflow-y-visible bg-zinc-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid-fade opacity-55 dark:opacity-25" />

      <section className="relative px-4 pb-24 pt-40 sm:px-6 sm:pt-40 lg:px-8 lg:pt-32">
        <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[1.75rem] border border-zinc-900/10 bg-white/70 px-3 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_20px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-4 dark:border-white/10 dark:bg-zinc-900/70 dark:shadow-[0_18px_40px_rgba(0,0,0,0.34)]">
              <div className="flex items-center justify-between gap-3">
                <a href="#top" className="min-w-0 flex-1">
                  <BrandLogo />
                </a>

                <nav className="hidden items-center gap-5 text-sm text-zinc-600 lg:flex dark:text-zinc-300">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="transition hover:text-zinc-950 dark:hover:text-zinc-50"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>

                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                  <ThemeToggle />
                  <GitHubStarButton />
                </div>
              </div>

              <nav className="no-scrollbar mt-3 overflow-x-auto lg:hidden">
                <div className="flex min-w-max items-center gap-2 pr-1">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="inline-flex shrink-0 rounded-full border border-zinc-900/10 bg-zinc-50 px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-zinc-700 transition hover:border-zinc-900/20 hover:bg-zinc-100 dark:border-white/10 dark:bg-black/20 dark:text-zinc-200 dark:hover:bg-black/30"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </nav>
            </div>
          </div>
        </header>

        <div
          id="top"
          className="mx-auto mt-4 grid max-w-7xl scroll-mt-36 gap-8 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:items-center lg:gap-10"
        >
          <div className="min-w-0">
            <span className="inline-flex rounded-full border border-zinc-900/10 bg-white px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-600 shadow-[0_1px_2px_rgba(15,23,42,0.05)] sm:tracking-[0.28em] dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300">
              Android overlay module / Expo + React Native
            </span>

            <h1 className="mt-6 max-w-4xl [font-family:var(--font-display)] text-4xl font-medium leading-[0.98] tracking-[-0.05em] text-zinc-950 dark:text-zinc-50 sm:mt-7 sm:text-5xl lg:text-6xl xl:text-[5.35rem]">
              Overlay permission, edge-hide bubbles, and renderer choices for Expo Android apps.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-700 sm:text-lg sm:leading-8 dark:text-zinc-300">
              Use the module to request draw-over-apps permission, launch a movable floating bubble, let it edge-hide
              against the screen, keep app and bubble state in sync, and choose between React Native, NativeWind, or
              the packaged expo-ui-flavored renderer path.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap">
              <a
                href="#install"
                className="rounded-full bg-zinc-950 px-6 py-3 text-center text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                Start with quick start
              </a>
              <a
                href="https://github.com/budzHors7/expo-draw-over-apps/tree/main/example"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-zinc-900/10 bg-white px-6 py-3 text-center text-sm font-medium text-zinc-950 transition hover:border-zinc-900/20 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                Browse example app
              </a>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {heroStats.map((stat) => (
                <article
                  key={stat.value}
                  className="rounded-[1.6rem] border border-zinc-900/10 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_12px_32px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-zinc-900 dark:shadow-[0_12px_32px_rgba(0,0,0,0.28)]"
                >
                  <p className="[font-family:var(--font-display)] text-2xl font-medium tracking-[-0.03em] text-zinc-950 dark:text-zinc-50">
                    {stat.value}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-zinc-700 dark:text-zinc-300">{stat.label}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="relative min-w-0">
            <div className="relative rounded-[2rem] border border-zinc-900/10 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_24px_60px_rgba(15,23,42,0.08)] sm:p-4 dark:border-white/10 dark:bg-zinc-900 dark:shadow-[0_20px_48px_rgba(0,0,0,0.32)]">
              <div className="rounded-[1.75rem] border border-zinc-900/10 bg-white p-4 text-zinc-950 sm:p-5 dark:border-white/10 dark:bg-black dark:text-zinc-50">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
                      Live overlay preview
                    </p>
                    <p className="mt-2 [font-family:var(--font-display)] text-xl font-medium tracking-[-0.03em] text-zinc-950 sm:text-2xl dark:text-white">
                      Permission, service, and UI in one surface
                    </p>
                  </div>
                  <span className="rounded-full border border-zinc-900/10 bg-zinc-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-700 dark:border-white/10 dark:bg-white/6 dark:text-zinc-200">
                    State synced
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                  <article className="rounded-[1.5rem] border border-zinc-900/10 bg-zinc-50 p-4 sm:p-5 dark:border-white/10 dark:bg-white/4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                      In-app controls
                    </p>
                    <div className="mt-4 rounded-[1.35rem] border border-zinc-900/10 bg-white p-4 dark:border-white/10 dark:bg-black/30">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Overlay permission</p>
                          <p className="mt-1 text-lg font-medium text-zinc-950 dark:text-white">Granted</p>
                        </div>
                        <span className="rounded-full border border-zinc-900/10 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-white/10 dark:bg-white/6 dark:text-zinc-100">
                          Ready
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[1.15rem] border border-zinc-900/8 bg-zinc-50 p-4 dark:border-white/8 dark:bg-white/4">
                          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Bubble</p>
                          <p className="mt-2 text-base font-medium text-zinc-950 dark:text-white">Visible</p>
                        </div>
                        <div className="rounded-[1.15rem] border border-zinc-900/8 bg-zinc-50 p-4 dark:border-white/8 dark:bg-white/4">
                          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Shared count</p>
                          <p className="mt-2 text-base font-medium text-zinc-950 dark:text-white">14</p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <span className="flex-1 rounded-full bg-zinc-950 px-4 py-3 text-center text-sm font-medium text-white dark:bg-white dark:text-zinc-950">
                          Hide bubble
                        </span>
                        <span className="flex-1 rounded-full border border-zinc-900/10 bg-zinc-50 px-4 py-3 text-center text-sm font-medium text-zinc-950 dark:border-white/10 dark:bg-white/4 dark:text-white">
                          +1 in app
                        </span>
                      </div>
                    </div>
                  </article>

                  <div className="grid min-w-0 gap-4">
                    <article className="rounded-[1.5rem] border border-zinc-900/10 bg-zinc-50 p-4 sm:p-5 dark:border-white/10 dark:bg-white/4">
                      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                        Install
                      </p>
                      <HighlightedCode code={installSnippet} lang="bash" variant="framed" className="mt-3" />
                      <p className="mt-3 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
                        Use a dev build, custom client, or standalone Android build. Install `@expo/ui` too if you want
                        the packaged Compose-flavored renderer API.
                      </p>
                    </article>

                    <article className="rounded-[1.5rem] border border-zinc-900/10 bg-zinc-50 p-4 sm:p-5 dark:border-white/10 dark:bg-white/4">
                      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                        Event stream
                      </p>
                      <div className="mt-4 space-y-3 text-sm">
                        <div className="rounded-[1rem] border border-zinc-900/8 bg-white px-4 py-3 text-zinc-700 dark:border-white/8 dark:bg-black/20 dark:text-zinc-200">
                          requestPermission() opened settings
                        </div>
                        <div className="rounded-[1rem] border border-zinc-900/8 bg-white px-4 py-3 text-zinc-700 dark:border-white/8 dark:bg-black/20 dark:text-zinc-200">
                          showBubble(&apos;default&apos;, {`{`} edgeHideEnabled: true {`}`}) accepted
                        </div>
                        <div className="rounded-[1rem] border border-zinc-900/8 bg-white px-4 py-3 text-zinc-700 dark:border-white/8 dark:bg-black/20 dark:text-zinc-200">
                          setComposeBubbleRenderer() registered the packaged renderer path
                        </div>
                      </div>
                    </article>
                  </div>
                </div>
              </div>

              <article className="absolute -left-4 top-20 hidden w-44 rounded-[1.5rem] border border-zinc-900/10 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_18px_44px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-zinc-900 dark:shadow-[0_18px_44px_rgba(0,0,0,0.34)] lg:block">
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                  Bubble UI
                </p>
                <div className="mt-4 rounded-[1.3rem] border border-zinc-900/10 bg-white p-4 text-center text-zinc-950 dark:border-white/10 dark:bg-zinc-950 dark:text-white">
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">Counter</p>
                  <p className="mt-3 [font-family:var(--font-display)] text-4xl font-medium tracking-[-0.04em]">
                    14
                  </p>
                  <div className="mt-4 flex gap-2">
                    <span className="flex-1 rounded-2xl border border-zinc-900/10 bg-zinc-100 py-2 text-sm font-medium dark:border-white/10 dark:bg-white/10">
                      -
                    </span>
                    <span className="flex-1 rounded-2xl bg-zinc-950 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-950">+</span>
                  </div>
                </div>
              </article>

              <article className="absolute -bottom-6 right-6 hidden max-w-[17rem] rounded-[1.5rem] border border-zinc-900/10 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_18px_44px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-zinc-900 dark:shadow-[0_18px_44px_rgba(0,0,0,0.34)] md:block">
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                  Open source paths
                </p>
                <div className="mt-3 grid gap-2 text-sm">
                  {openSourceQuickLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-[0.95rem] border border-zinc-900/10 bg-zinc-50 px-3 py-2 text-zinc-700 transition hover:border-zinc-900/20 hover:bg-zinc-100 dark:border-white/10 dark:bg-black/20 dark:text-zinc-200 dark:hover:bg-black/30"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <div className="relative border-t border-zinc-900/10 bg-zinc-100/80 dark:border-white/10 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl overflow-x-hidden px-4 pb-20 pt-20 sm:px-6 lg:px-8">
          <section id="overview" className="scroll-mt-36">
            <SectionHeader
              eyebrow="What ships"
              title="One Android overlay module that covers permission flow, edge-hide behavior, renderer swaps, and shared bubble state."
              description="expo-draw-over-apps gives you the permission helpers, overlay service controls, edge-hide toggles, renderer hooks, and synchronized state helpers you need to ship named floating bubbles in an Expo app."
            />

            <div className="mt-10 grid gap-4 lg:grid-cols-12">
              {featureTiles.map((tile) => (
                <article
                  key={tile.title}
                  className={`${tile.className} relative overflow-hidden rounded-[1.75rem] border border-zinc-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_16px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-zinc-900 dark:shadow-[0_12px_32px_rgba(0,0,0,0.3)]`}
                >
                  <div className={`absolute inset-0 ${tile.accent}`} />
                  <div className="relative">
                    <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-zinc-500 dark:text-zinc-400">
                      {tile.eyebrow}
                    </p>
                    <h3 className="mt-4 max-w-xl [font-family:var(--font-display)] text-3xl font-medium leading-tight tracking-[-0.04em] text-zinc-950 dark:text-zinc-50">
                      {tile.title}
                    </h3>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-700 dark:text-zinc-300">{tile.body}</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {tile.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-zinc-900/10 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-white/10 dark:bg-black/20 dark:text-zinc-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-20 scroll-mt-36">
            <SectionHeader
              eyebrow="How it works"
              title="The integration path stays short from Android permission to a live floating bubble."
              description="Most apps will follow the same flow: check permission, hand users off to settings when needed, show the bubble service, then keep state synchronized between the app and the overlay."
            />

            <div className="mt-10 grid gap-4 lg:grid-cols-4">
              {workflowSteps.map((step) => (
                <article
                  key={step.step}
                  className="rounded-[1.75rem] border border-zinc-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_16px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-zinc-900 dark:shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 [font-family:var(--font-display)] text-lg font-medium text-white dark:bg-white dark:text-zinc-950">
                    {step.step}
                  </div>
                  <h3 className="mt-5 [font-family:var(--font-display)] text-2xl font-medium tracking-[-0.03em] text-zinc-950 dark:text-zinc-50">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-zinc-700 dark:text-zinc-300">{step.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="install" className="mt-20 scroll-mt-36">
            <SectionHeader
              eyebrow="Quick start"
              title="Start with permission plus edge hide, then move into React Native, Tailwind, or expo-ui-flavored renderers."
              description="The examples below cover the common module paths: a permission-first setup with edge hide, a per-bubble renderer swap, the packaged Compose-flavored expo-ui path, and a NativeWind renderer when your app already uses utility classes."
            />

            <div className="mt-10 grid gap-6 lg:grid-cols-12">
              <article className="rounded-[1.75rem] border border-zinc-900/10 bg-white p-6 text-zinc-950 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_16px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-black dark:text-zinc-50 lg:col-span-6">
                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">Install</p>
                <HighlightedCode code={installSnippet} lang="bash" variant="framed" className="mt-4" />
                <div className="mt-5 space-y-3 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
                  <p>Use a development build, custom client, or standalone Android build.</p>
                  <p>Expo Go is not supported because the package contains native Android code.</p>
                  <p>Install `@expo/ui` only if you want the packaged Compose-flavored renderer API.</p>
                </div>
              </article>

              <article className="rounded-[1.75rem] border border-zinc-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_16px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-zinc-900 dark:shadow-[0_12px_32px_rgba(0,0,0,0.3)] lg:col-span-6">
                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
                  Deployment notes
                </p>
                <div className="mt-4 grid gap-3 text-sm leading-7 text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
                  <p>Android only</p>
                  <p>Overlay permission must be granted by the user</p>
                  <p>The floating bubble is hosted by an Android service</p>
                  <p>The packaged expo-ui renderer currently falls back to a stable React Native overlay surface</p>
                </div>
              </article>

              <div className="grid gap-6 lg:col-span-12 lg:grid-cols-12">
                <CodePanel
                  title="Basic usage"
                  label="tsx"
                  lang="tsx"
                  code={quickStartSnippet}
                  caption="Start here for the common path: request permission, show the default bubble with edge hide enabled, and read synchronized state inside the app."
                  className="lg:col-span-6"
                />
                <CodePanel
                  title="Edge hide controls"
                  label="tsx"
                  lang="tsx"
                  code={edgeHideSnippet}
                  caption="Use a named bubble when you want to toggle edge-hide behavior at runtime and keep the same bubble reachable from the side of the screen."
                  className="lg:col-span-6"
                />
                <CodePanel
                  title="Custom renderer"
                  label="tsx"
                  lang="tsx"
                  code={customRendererSnippet}
                  caption="Use this when you want to keep the Android overlay plumbing but register a renderer for one named bubble with your own React Native components."
                  className="lg:col-span-6"
                />
                <CodePanel
                  title="expo-ui / Compose renderer"
                  label="tsx"
                  lang="tsx"
                  code={composeRendererSnippet}
                  caption="If your app already ships `@expo/ui`, the packaged Compose-flavored renderer API is available through setComposeBubbleRenderer(), with the current overlay build falling back to a stable React Native surface."
                  className="lg:col-span-6"
                />
                <CodePanel
                  title="Tailwind / NativeWind renderer"
                  label="tsx"
                  lang="tsx"
                  code={tailwindRendererSnippet}
                  caption="If your React Native app already uses NativeWind, you can register a bubble renderer built with Tailwind utility classes instead of a StyleSheet."
                  className="lg:col-span-12"
                />
              </div>
            </div>
          </section>

          <section id="api" className="mt-20 scroll-mt-36">
            <SectionHeader
              eyebrow="API"
              title="Every exported helper maps to a real overlay job in the Expo module."
              description="From checking draw-over-apps permission to showing named bubbles, toggling edge hide, reading multi-bubble state, and registering Compose-flavored or React Native renderers, the API is organized around the actual integration steps you use in an Expo Android app."
            />

            <div className="mt-10 grid gap-5 xl:grid-cols-2">
              {apiGroups.map((group) => (
                <article
                  key={group.title}
                  className="rounded-[1.75rem] border border-zinc-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_16px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-zinc-900 dark:shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="max-w-lg flex-1">
                      <h3 className="[font-family:var(--font-display)] text-2xl font-medium tracking-[-0.03em] text-zinc-950 dark:text-zinc-50">
                        {group.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
                        {group.title === 'Permissions' &&
                          'Permission checks and the Android overlay settings handoff.'}
                        {group.title === 'Visibility' &&
                          'Methods that show, hide, and query named bubbles, plus the app reopen helper.'}
                        {group.title === 'Edge hide' &&
                          'Per-bubble edge sliver controls for drag-to-edge behavior and display options.'}
                        {group.title === 'Shared state' &&
                          'Counter, visibility, and multi-bubble snapshots shared by the app and overlay surfaces.'}
                        {group.title === 'Customization' &&
                          'Renderer registration helpers for global, per-bubble, and packaged expo-ui-flavored bubble UIs.'}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 rounded-full border border-zinc-900/10 bg-zinc-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500 dark:border-white/10 dark:bg-black/20 dark:text-zinc-400">
                      {group.items.length} entries
                    </span>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {group.items.map((item) => (
                      <HighlightedCode
                        key={item}
                        code={item}
                        lang="tsx"
                        variant="framed"
                        className="code-block--wrap"
                      />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="opensource" className="mt-20 scroll-mt-36">
            <SectionHeader
              eyebrow="Open source"
              title="Source, example app, and issue tracking stay connected to the module."
              description="Every important destination stays obvious: the main repo for source and releases, the example app for implementation details, and issues for community feedback."
            />

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {projectLinks.map((link) => (
                <ExternalLinkCard key={link.href} href={link.href} label={link.label} detail={link.detail} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
