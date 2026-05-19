import React from 'react';
import Heading from '@theme/Heading';
import {
  VersionedDocsLayout,
  versionSummaries,
  type VersionKey,
  type VersionRouteSegment,
  type VersionedPageKey,
} from '@site/src/components/VersionedDocsLayout';

type VersionedContentPageProps = {
  pageKey: Exclude<VersionedPageKey, 'reference'>;
  routeSegment?: VersionRouteSegment;
  versionKey: VersionKey;
};

const installCommands: Record<VersionKey, string> = {
  '56-beta': 'npm install expo-draw-over-apps@56.0.2-beta.1 react-native-reanimated',
  '55': 'npm install expo-draw-over-apps@55.0.2',
};

const pageTitles: Record<Exclude<VersionedPageKey, 'reference'>, string> = {
  'getting-started': 'Getting started',
  tutorial: 'Tutorial',
  nativewind: 'NativeWind',
  fixtures: 'Fixtures',
  'public-api': 'Public API',
  demo: 'Demo',
  limitations: 'Limitations',
};

function PageHeader({
  children,
  title,
  versionKey,
}: {
  children: React.ReactNode;
  title: string;
  versionKey: VersionKey;
}) {
  const version = versionSummaries[versionKey];

  return (
    <header className="sdkReferenceHeader">
      <div>
        <span className="sdkReferenceBadge">{version.status}</span>
        <Heading as="h1">{title}</Heading>
        <p>{children}</p>
      </div>
      <dl>
        <div>
          <dt>Reference version</dt>
          <dd>{version.label}</dd>
        </div>
        <div>
          <dt>Bundled version</dt>
          <dd>{version.bundledVersion}</dd>
        </div>
        <div>
          <dt>Platform</dt>
          <dd>Android</dd>
        </div>
      </dl>
    </header>
  );
}

function GettingStarted({ versionKey }: { versionKey: VersionKey }) {
  return (
    <>
      <PageHeader title="Getting started" versionKey={versionKey}>
        Install the package for this SDK track, then use a development build or standalone Android build.
      </PageHeader>

      <section id="installation" className="sdkReferenceSection">
        <Heading as="h2">Installation</Heading>
        <pre>
          <code>{installCommands[versionKey]}</code>
        </pre>
      </section>

      <section id="requirements" className="sdkReferenceSection">
        <Heading as="h2">Requirements</Heading>
        <ul>
          <li>Android only.</li>
          <li>Expo Go is not supported because the module ships native Android code.</li>
          <li>Use a development build, custom client, or standalone Android build.</li>
          <li>The user must grant the Android draw-over-apps permission before a bubble can appear.</li>
        </ul>
      </section>

      <section id="first-bubble" className="sdkReferenceSection">
        <Heading as="h2">First bubble</Heading>
        <ul>
          <li>Call <code>canDrawOverlays()</code> before showing a bubble.</li>
          <li>Call <code>requestPermission()</code> when permission is missing.</li>
          <li>Call <code>showBubble()</code> after permission is granted.</li>
          <li>Use <code>useBubbleState()</code> to read visible state and shared counter state in React.</li>
        </ul>
      </section>
    </>
  );
}

function Tutorial({ versionKey }: { versionKey: VersionKey }) {
  const isSdk56 = versionKey === '56-beta';

  return (
    <>
      <PageHeader title="Tutorial" versionKey={versionKey}>
        Follow the Android overlay flow for this SDK track. Shared behavior is shown in both versions. SDK 56 beta-only APIs stay on SDK 56 beta pages.
      </PageHeader>

      <section id="permission-flow" className="sdkReferenceSection">
        <Heading as="h2">Permission flow</Heading>
        <ol>
          <li>Call <code>canDrawOverlays()</code>.</li>
          <li>If it returns <code>false</code>, call <code>requestPermission()</code>.</li>
          <li>When the app becomes active again, call <code>canDrawOverlays()</code> one more time.</li>
          <li>Call <code>showBubble()</code> only after permission is granted.</li>
        </ol>
      </section>

      <section id="renderers" className="sdkReferenceSection">
        <Heading as="h2">Renderers</Heading>
        <ul>
          <li>Use <code>setBubbleRenderer()</code> or <code>setBubbleRendererForBubble()</code> for React Native renderers.</li>
          <li>Use <code>setComposeBubbleRenderer()</code> for the packaged Compose-flavored renderer.</li>
        </ul>
      </section>

      {isSdk56 ? (
        <section id="sdk-56-beta-additions" className="sdkReferenceSection">
          <Heading as="h2">SDK 56 beta additions</Heading>
          <ul>
            <li>FloatingWindowPreview for rendering a bubble fixture inside the app before starting the overlay service.</li>
            <li>Edge hide controls for tucking a bubble against the screen edge.</li>
            <li>ReactNativeWindowContainer for Reanimated width, height, and radius transitions.</li>
            <li>NativeWindowContainer for an Expo UI Android Host/Surface backdrop with React Native children.</li>
          </ul>

          <section id="floating-window-preview" className="sdkReferenceSubsection">
            <Heading as="h3">Use FloatingWindowPreview</Heading>
            <p>
              Render the same bubble renderer inside your app while you tune layout and state. This does not ask for overlay permission or start the Android overlay service.
            </p>
            <pre>
              <code>{`import { FloatingWindowPreview } from 'expo-draw-over-apps';
import { CounterBubble } from './CounterBubble';

export function BubblePreviewCard() {
  return (
    <FloatingWindowPreview
      width={220}
      height={220}
      bubbleId="counter"
      initialState={{ count: 3 }}
      renderBubble={(props) => <CounterBubble {...props} />}
    />
  );
}`}</code>
            </pre>
          </section>

          <section id="edge-hide-controls" className="sdkReferenceSubsection">
            <Heading as="h3">Use edge hide</Heading>
            <p>
              Pass <code>edgeHideEnabled</code> when the bubble is shown, or change it later for the same named bubble.
            </p>
            <pre>
              <code>{`import { setEdgeHideEnabled, showBubble } from 'expo-draw-over-apps';

const bubbleId = 'counter';

await showBubble(bubbleId, { edgeHideEnabled: true });

function toggleEdgeHide(nextEnabled: boolean) {
  setEdgeHideEnabled(nextEnabled, bubbleId);
}`}</code>
            </pre>
          </section>

          <section id="react-native-window-container" className="sdkReferenceSubsection">
            <Heading as="h3">Use ReactNativeWindowContainer</Heading>
            <p>
              Wrap React Native renderer content when the bubble size or corner radius changes. Numeric <code>width</code>, <code>height</code>, and <code>borderRadius</code> values animate with Reanimated.
            </p>
            <pre>
              <code>{`import { Text } from 'react-native';
import {
  ReactNativeWindowContainer,
  type BubbleRendererProps,
} from 'expo-draw-over-apps';

export function ResizeBubble({ state }: BubbleRendererProps) {
  const expanded = state.count > 0;

  return (
    <ReactNativeWindowContainer
      width={expanded ? 240 : 160}
      height={expanded ? 220 : 140}
      borderRadius={expanded ? 36 : 24}
      backgroundColor="#111827"
    >
      <Text style={{ color: 'white', fontWeight: '800' }}>
        Count: {state.count}
      </Text>
    </ReactNativeWindowContainer>
  );
}`}</code>
            </pre>
          </section>

          <section id="native-window-container" className="sdkReferenceSubsection">
            <Heading as="h3">Use NativeWindowContainer</Heading>
            <p>
              Use the native container when the app has <code>@expo/ui</code> installed and you want the Android Host/Surface backdrop. It still renders React Native children inside the window and falls back to the React Native container when Expo UI is unavailable.
            </p>
            <pre>
              <code>{`import { Text } from 'react-native';
import {
  NativeWindowContainer,
  type BubbleRendererProps,
} from 'expo-draw-over-apps';

export function NativeSurfaceBubble({ state }: BubbleRendererProps) {
  const expanded = state.count > 0;

  return (
    <NativeWindowContainer
      width={expanded ? 260 : 172}
      height={expanded ? 230 : 150}
      borderRadius={expanded ? 40 : 26}
      surfaceColor="#0f172a"
      contentColor="#ffffff"
    >
      <Text style={{ color: 'white', fontWeight: '800' }}>
        Native surface
      </Text>
    </NativeWindowContainer>
  );
}`}</code>
            </pre>
          </section>
        </section>
      ) : null}
    </>
  );
}

function Fixtures({ versionKey }: { versionKey: VersionKey }) {
  const isSdk56 = versionKey === '56-beta';

  return (
    <>
      <PageHeader title="Fixtures" versionKey={versionKey}>
        Use the fixtures that belong to this SDK track when testing the example app.
      </PageHeader>

      <section id="available-fixtures" className="sdkReferenceSection">
        <Heading as="h2">Available fixtures</Heading>
        <ul>
          <li>React Native Counter: shared counter state, open-app action, hide action, and custom React Native UI.</li>
          <li>Jetpack Compose Counter: packaged Compose-flavored renderer powered by <code>@expo/ui</code>.</li>
          {isSdk56 ? (
            <>
              <li>Countdown Timer: timer state and renderer updates inside a bubble.</li>
              <li>React Native Resize Bubble: <code>ReactNativeWindowContainer</code> resize behavior.</li>
              <li>Native Expo UI Resize Bubble: <code>NativeWindowContainer</code> with the Expo UI native backdrop path.</li>
            </>
          ) : null}
        </ul>
      </section>
    </>
  );
}

function NativeWind({ versionKey }: { versionKey: VersionKey }) {
  return (
    <>
      <PageHeader title="NativeWind" versionKey={versionKey}>
        Use NativeWind only when the host Expo app already has NativeWind configured.
      </PageHeader>

      <section id="requirements" className="sdkReferenceSection">
        <Heading as="h2">Requirements</Heading>
        <ul>
          <li>The app must already be configured for NativeWind.</li>
          <li>The bubble renderer must be a React Native renderer registered with <code>setBubbleRenderer()</code> or <code>setBubbleRendererForBubble()</code>.</li>
          <li>NativeWind classes are evaluated by the host app. The overlay service does not configure NativeWind for you.</li>
        </ul>
      </section>

      <section id="renderer" className="sdkReferenceSection">
        <Heading as="h2">Renderer</Heading>
        <pre>
          <code>{`function CounterBubble() {
  return (
    <View className="rounded-2xl bg-zinc-950 px-4 py-3">
      <Text className="text-sm font-semibold text-white">Counter</Text>
    </View>
  );
}

setBubbleRenderer(CounterBubble);`}</code>
        </pre>
      </section>
    </>
  );
}

function PublicApi({ versionKey }: { versionKey: VersionKey }) {
  const isSdk56 = versionKey === '56-beta';

  return (
    <>
      <PageHeader title="Public API" versionKey={versionKey}>
        The public API list below is scoped to this SDK track.
      </PageHeader>

      <section id="core-api" className="sdkReferenceSection">
        <Heading as="h2">Core API</Heading>
        <ul>
          <li><code>canDrawOverlays()</code> and <code>requestPermission()</code></li>
          <li><code>showBubble()</code>, <code>hideBubble()</code>, and <code>isBubbleVisible()</code></li>
          <li><code>incrementBubbleCount()</code>, <code>decrementBubbleCount()</code>, and <code>setBubbleCount()</code></li>
          <li><code>setBubbleRenderer()</code>, <code>setBubbleRendererForBubble()</code>, and <code>setComposeBubbleRenderer()</code></li>
          <li><code>useBubbleState()</code> and <code>subscribeToBubbleState()</code></li>
        </ul>
      </section>

      {isSdk56 ? (
        <section id="sdk-56-beta-api" className="sdkReferenceSection">
          <Heading as="h2">SDK 56 beta API</Heading>
          <ul>
            <li><code>FloatingWindowPreview</code></li>
            <li><code>setEdgeHideEnabled()</code></li>
            <li><code>ReactNativeWindowContainer</code></li>
            <li><code>NativeWindowContainer</code></li>
          </ul>
        </section>
      ) : null}
    </>
  );
}

function Demo({ versionKey }: { versionKey: VersionKey }) {
  return (
    <>
      <PageHeader title="Demo" versionKey={versionKey}>
        Run the example app with the controls and fixtures available for this SDK track.
      </PageHeader>

      <section id="run-demo" className="sdkReferenceSection">
        <Heading as="h2">Run the demo</Heading>
        <pre>
          <code>cd example{'\n'}npm run android</code>
        </pre>
      </section>

      <section id="demo-controls" className="sdkReferenceSection">
        <Heading as="h2">Demo controls</Heading>
        <ul>
          <li>Check and request overlay permission.</li>
          <li>Show, hide, and open the app from a bubble.</li>
          <li>Switch between the fixtures available to the selected SDK track.</li>
        </ul>
      </section>
    </>
  );
}

function Limitations({ versionKey }: { versionKey: VersionKey }) {
  const isSdk56 = versionKey === '56-beta';

  return (
    <>
      <PageHeader title="Limitations" versionKey={versionKey}>
        These limits apply to this SDK track.
      </PageHeader>

      <section id="platform" className="sdkReferenceSection">
        <Heading as="h2">Platform</Heading>
        <ul>
          <li>Android only.</li>
          <li>Expo Go is not supported.</li>
          <li>The overlay permission screen is controlled by Android.</li>
          <li>The floating bubble is hosted by a native Android service.</li>
          {isSdk56 ? <li>The packaged Compose-flavored renderer currently uses the React Native fallback path in live overlay builds.</li> : null}
        </ul>
      </section>
    </>
  );
}

function renderContent(pageKey: Exclude<VersionedPageKey, 'reference'>, versionKey: VersionKey) {
  switch (pageKey) {
    case 'getting-started':
      return <GettingStarted versionKey={versionKey} />;
    case 'tutorial':
      return <Tutorial versionKey={versionKey} />;
    case 'nativewind':
      return <NativeWind versionKey={versionKey} />;
    case 'fixtures':
      return <Fixtures versionKey={versionKey} />;
    case 'public-api':
      return <PublicApi versionKey={versionKey} />;
    case 'demo':
      return <Demo versionKey={versionKey} />;
    case 'limitations':
      return <Limitations versionKey={versionKey} />;
  }
}

function getSectionLinks(pageKey: Exclude<VersionedPageKey, 'reference'>, versionKey: VersionKey) {
  const common: Record<Exclude<VersionedPageKey, 'reference'>, Array<{ href: string; label: string }>> = {
    'getting-started': [
      { href: '#installation', label: 'Installation' },
      { href: '#requirements', label: 'Requirements' },
      { href: '#first-bubble', label: 'First bubble' },
    ],
    tutorial: [
      { href: '#permission-flow', label: 'Permission flow' },
      { href: '#renderers', label: 'Renderers' },
    ],
    nativewind: [
      { href: '#requirements', label: 'Requirements' },
      { href: '#renderer', label: 'Renderer' },
    ],
    fixtures: [{ href: '#available-fixtures', label: 'Available fixtures' }],
    'public-api': [{ href: '#core-api', label: 'Core API' }],
    demo: [
      { href: '#run-demo', label: 'Run the demo' },
      { href: '#demo-controls', label: 'Demo controls' },
    ],
    limitations: [{ href: '#platform', label: 'Platform' }],
  };

  if (pageKey === 'tutorial' && versionKey === '56-beta') {
    return [
      ...common.tutorial,
      { href: '#sdk-56-beta-additions', label: 'SDK 56 beta additions' },
      { href: '#floating-window-preview', label: 'FloatingWindowPreview' },
      { href: '#edge-hide-controls', label: 'Edge hide controls' },
      { href: '#react-native-window-container', label: 'ReactNativeWindowContainer' },
      { href: '#native-window-container', label: 'NativeWindowContainer' },
    ];
  }

  if (pageKey === 'public-api' && versionKey === '56-beta') {
    return [...common['public-api'], { href: '#sdk-56-beta-api', label: 'SDK 56 beta API' }];
  }

  return common[pageKey];
}

export default function VersionedContentPage({
  pageKey,
  routeSegment,
  versionKey,
}: VersionedContentPageProps) {
  const title = pageTitles[pageKey];
  const version = versionSummaries[versionKey];

  return (
    <VersionedDocsLayout
      description={`${title} for expo-draw-over-apps ${version.label}.`}
      pageKey={pageKey}
      routeSegment={routeSegment}
      sectionLinks={getSectionLinks(pageKey, versionKey)}
      seoKeywords={['expo-draw-over-apps', version.label, title]}
      title={title}
      versionKey={versionKey}
    >
      {renderContent(pageKey, versionKey)}
    </VersionedDocsLayout>
  );
}
