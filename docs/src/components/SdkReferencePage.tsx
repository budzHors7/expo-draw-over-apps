import React from 'react';
import Heading from '@theme/Heading';
import {
  VersionedDocsLayout,
  type VersionKey,
  type VersionRouteSegment,
} from '@site/src/components/VersionedDocsLayout';

type FeatureGroup = {
  title: string;
  items: string[];
};

type SdkVersionContent = {
  bundledVersion: string;
  description: string;
  featureGroups: FeatureGroup[];
  installCommand: string;
  key: VersionKey;
  label: string;
  seoDescription: string;
  seoKeywords: string[];
  status: string;
};

type SdkReferencePageProps = {
  routeSegment?: VersionRouteSegment;
  versionKey: VersionKey;
};

const versions: Record<VersionKey, SdkVersionContent> = {
  '56-beta': {
    key: '56-beta',
    label: 'SDK 56 beta',
    status: 'Latest docs track',
    bundledVersion: '56.0.2-beta.1',
    installCommand: 'npm install expo-draw-over-apps@56.0.2-beta.1 react-native-reanimated',
    description:
      'SDK 56 beta keeps the Android overlay API and adds the current preview, edge hide, and animated window container APIs.',
    seoDescription:
      'SDK 56 beta reference for expo-draw-over-apps preview, edge hide, React Native and native window containers, and Android overlay bubbles.',
    seoKeywords: [
      'expo-draw-over-apps sdk 56 beta',
      'FloatingWindowPreview',
      'edge hide bubble',
      'ReactNativeWindowContainer',
      'NativeWindowContainer',
      'expo android overlay',
    ],
    featureGroups: [
      {
        title: 'Core overlay API',
        items: [
          'Android draw-over-apps permission helpers.',
          'Floating bubble overlay with shared state.',
          'React Native and Jetpack Compose renderer registration.',
        ],
      },
      {
        title: 'New in SDK 56 beta',
        items: [
          'FloatingWindowPreview for rendering a bubble fixture inside the app before starting the overlay service.',
          'Edge hide controls for tucking a bubble against the screen edge.',
          'ReactNativeWindowContainer for Reanimated width, height, and radius transitions.',
          'NativeWindowContainer for an Expo UI Android Host/Surface backdrop with React Native children.',
        ],
      },
    ],
  },
  '55': {
    key: '55',
    label: 'SDK 55',
    status: 'Package version 55.0.2',
    bundledVersion: '55.0.2',
    installCommand: 'npm install expo-draw-over-apps@55.0.2',
    description:
      'SDK 55 covers the original Android overlay flow from the 55.0.2 package readme.',
    seoDescription:
      'SDK 55 reference for expo-draw-over-apps Android overlay permission, draggable bubbles, shared state, NativeWind renderers, and Jetpack Compose renderer support.',
    seoKeywords: [
      'expo-draw-over-apps sdk 55',
      'expo-draw-over-apps 55.0.2',
      'android overlay permission',
      'react native floating bubble',
      'nativewind bubble renderer',
      'jetpack compose bubble renderer',
    ],
    featureGroups: [
      {
        title: 'Available in SDK 55',
        items: [
          'Android draw-over-apps permission helpers.',
          'Draggable floating bubble overlay.',
          'Shared counter state between the app and the bubble.',
          'Open-app action from the bubble.',
          'React Native custom bubble renderer registration.',
          'NativeWind className support for custom React Native bubble renderers when the app is configured for NativeWind.',
          'Packaged Jetpack Compose renderer powered by @expo/ui/jetpack-compose.',
        ],
      },
    ],
  },
};

export default function SdkReferencePage({ routeSegment, versionKey }: SdkReferencePageProps) {
  const version = versions[versionKey];

  return (
    <VersionedDocsLayout
      description={version.seoDescription}
      pageKey="reference"
      routeSegment={routeSegment}
      sectionLinks={[
        { href: '#installation', label: 'Installation' },
        { href: '#features', label: 'Features' },
        { href: '#api', label: 'API surface' },
      ]}
      seoKeywords={version.seoKeywords}
      title="SDK reference"
      versionKey={versionKey}
    >
      <header className="sdkReferenceHeader">
        <div>
          <span className="sdkReferenceBadge">{version.status}</span>
          <Heading as="h1">Expo Draw Over Apps</Heading>
          <p>{version.description}</p>
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

      <section id="installation" className="sdkReferenceSection">
        <Heading as="h2">Installation</Heading>
        <pre>
          <code>{version.installCommand}</code>
        </pre>
      </section>

      <section id="features" className="sdkReferenceSection">
        <Heading as="h2">Features</Heading>
        <div className="sdkReferenceFeatureGrid">
          {version.featureGroups.map((group) => (
            <section key={group.title} className="sdkReferenceFeatureGroup">
              <Heading as="h3">{group.title}</Heading>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section id="api" className="sdkReferenceSection">
        <Heading as="h2">API surface</Heading>
        {versionKey === '56-beta' ? (
          <ul>
            <li>
              <code>FloatingWindowPreview</code>
            </li>
            <li>
              <code>setEdgeHideEnabled</code>
            </li>
            <li>
              <code>ReactNativeWindowContainer</code>
            </li>
            <li>
              <code>NativeWindowContainer</code>
            </li>
          </ul>
        ) : (
          <ul>
            <li>
              <code>canDrawOverlays</code> and <code>requestPermission</code>
            </li>
            <li>
              <code>showBubble</code>, <code>hideBubble</code>, and <code>isBubbleVisible</code>
            </li>
            <li>
              <code>setBubbleRenderer</code> and <code>setComposeBubbleRenderer</code>
            </li>
            <li>
              <code>useBubbleState</code> and shared counter helpers
            </li>
          </ul>
        )}
      </section>
    </VersionedDocsLayout>
  );
}
