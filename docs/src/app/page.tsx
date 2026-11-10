import Link from 'next/link';

const features = [
  ['Position precisely', 'Set x and y in screen pixels when a window opens or while it is already visible.'],
  ['Own the renderer', 'Register a component for each named bubble and clean it up with the same lifecycle as your app.'],
  ['Choose the surface', 'Use a Reanimated React Native window or a direct Expo UI Jetpack Compose host.'],
];

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Android overlays · Expo SDK 58</p>
          <h1>Floating windows, owned by your Expo app.</h1>
          <p className="hero-lede">
            Request draw-over-apps permission, register application-owned window UI, and place it exactly where it should appear.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" href="/docs">Start with SDK 58</Link>
            <a className="secondary-action" href="https://github.com/budzHors7/expo-draw-over-apps">View on GitHub</a>
          </div>
        </div>
        <div className="window-diagram" aria-label="Application code showing a window through the Android overlay service">
          <div><span>01</span><strong>Register</strong><code>setBubbleRendererForBubble</code></div>
          <i aria-hidden="true">→</i>
          <div><span>02</span><strong>Position</strong><code>{'{ x: 48, y: 180 }'}</code></div>
          <i aria-hidden="true">→</i>
          <div><span>03</span><strong>Render</strong><code>ReactNativeWindow | NativeWindow</code></div>
        </div>
      </section>
      <section className="feature-lines" aria-label="Highlights">
        {features.map(([title, description]) => (
          <article key={title}><h2>{title}</h2><p>{description}</p></article>
        ))}
      </section>
      <section className="install-strip">
        <div><p className="eyebrow">Install</p><h2>One SDK 58 path</h2></div>
        <pre><code>npx expo install expo-draw-over-apps @expo/ui react-native-reanimated react-native-worklets</code></pre>
      </section>
    </main>
  );
}
