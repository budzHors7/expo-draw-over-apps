import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

const featureCards = [
  {
    title: 'Request overlay permission',
    body: 'Check whether Android allows draw-over-apps, open the settings screen when it does not, and refresh state when the app resumes.',
  },
  {
    title: 'Show named bubbles',
    body: 'Use stable bubble IDs for separate overlay surfaces, including counters, timers, and resize examples from the fixture app.',
  },
  {
    title: 'Preview before overlay',
    body: 'Render a bubble fixture inside the app with FloatingWindowPreview before asking for permission or starting the Android service.',
  },
  {
    title: 'Style with NativeWind',
    body: 'Use className in custom bubble renderers when your Expo app already has NativeWind configured.',
  },
];

const flowNodes = [
  {
    eyebrow: 'Expo app',
    title: 'Call the module',
    body: 'Ask for overlay permission, register a bubble, and update shared state from React Native.',
    lines: ['permission', 'showBubble', 'bubble state'],
  },
  {
    eyebrow: 'Module bridge',
    title: 'Normalize work',
    body: 'Keep IDs stable, route renderer names, and send commands to the native overlay service.',
    lines: ['bubble id', 'renderer key', 'edge hide'],
  },
  {
    eyebrow: 'Android service',
    title: 'Draw over apps',
    body: 'Attach the floating view, keep it interactive, and let users move or hide it at the screen edge.',
    lines: ['overlay view', 'drag + resize', 'fallback view'],
  },
];

const rendererOptions = ['React Native', 'NativeWind', 'Jetpack Compose', 'expo-ui fallback'];

function ModuleFunctionDiagram(): JSX.Element {
  return (
    <div className="moduleDiagram" aria-label="How expo-draw-over-apps connects Expo code to Android overlays">
      <div className="moduleDiagramTop">
        {flowNodes.map((node, index) => (
          <article className="moduleNode" key={node.title}>
            <div className="moduleNodeHeader">
              <span>{node.eyebrow}</span>
              {index < flowNodes.length - 1 ? <span aria-hidden="true">-&gt;</span> : null}
            </div>
            <strong>{node.title}</strong>
            <p>{node.body}</p>
            <div className="moduleNodeLines">
              {node.lines.map((line) => (
                <code key={line}>{line}</code>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="overlayDemo">
        <div className="overlayApp">
          <span>In-app preview</span>
          <strong>Preview fixture</strong>
          <code>FloatingWindowPreview</code>
          <p>Render the same fixture before starting the Android overlay.</p>
        </div>
        <div className="overlayScreen" aria-hidden="true">
          <div className="overlayEdge" />
          <div className="overlayBubble">
            <span>Timer</span>
            <strong>04:28</strong>
          </div>
        </div>
      </div>

      <div className="rendererRail" aria-label="Supported renderer options">
        {rendererOptions.map((renderer) => (
          <span key={renderer}>{renderer}</span>
        ))}
      </div>
    </div>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout
      title="Expo Draw Over Apps"
      description="Expo module for Android overlay permission, floating bubbles, NativeWind renderers, expo-ui registration, and in-app bubble previews."
    >
      <main>
        <section className="homeHero">
          <div className="container homeHeroInner">
            <div className="homeHeroCopy">
              <Heading as="h1">Expo Draw Over Apps</Heading>
              <p>
                Android overlay permission, floating bubbles, edge hide, shared bubble state, NativeWind renderers, and
                fixture previews for Expo apps.
              </p>
              <div className="homeHeroActions">
                <Link className="button button--primary button--lg" to="/docs/">
                  Read the docs
                </Link>
                <Link className="button button--secondary button--lg" to="/docs/fixtures/">
                  View fixtures
                </Link>
              </div>
            </div>
            <ModuleFunctionDiagram />
          </div>
        </section>

        <section className="container homeSection">
          <div className="homeGrid">
            {featureCards.map((feature) => (
              <article className="homeCard" key={feature.title}>
                <Heading as="h2">{feature.title}</Heading>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container homeSection homeSplit">
          <div>
            <Heading as="h2">Docs that match the example app</Heading>
            <p>
              The docs now follow the example fixtures directly: React Native counter, Jetpack Compose counter,
              countdown timer, React Native resize bubble, and Native Expo UI resize bubble.
            </p>
          </div>
          <div className="homeCommand">
            <code>npm run docs:dev</code>
            <code>npm run docs:build</code>
          </div>
        </section>
      </main>
    </Layout>
  );
}
