import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { CodeBlock } from '../components/CodeBlock';
import { assetPath } from '../lib/navigation';

export default function HomePage() {
  return (
    <main className="landing" id="main-content">
      <section className="hero">
        <div className="hero-copy">
          <h1>Floating windows,<br />owned by your Expo app.</h1>
          <p className="hero-lede">
            Add floating windows using Android’s overlay permission. Build application-owned content with React Native or Jetpack Compose, then place it precisely with coordinates or nine predefined positions.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" href="/docs">Get started <ArrowRight size={19} aria-hidden="true" /></Link>
            <a className="secondary-action" href="https://github.com/budzHors7/expo-draw-over-apps">View on GitHub <ArrowUpRight size={17} aria-hidden="true" /></a>
          </div>
        </div>
        <Image className="hero-illustration" src={assetPath('/images/floating-windows.png')} width={1365} height={1140} sizes="(max-width: 760px) 90vw, 520px" alt="Floating windows positioned at top-left, center, and bottom-right on a nine-point grid" priority />
      </section>
      <section className="window-flow" aria-labelledby="flow-title">
        <h2 id="flow-title">From your code to the screen</h2>
        <div className="flow-grid">
          <div><h3>Register</h3><code>setBubbleRendererForBubble</code></div>
          <ArrowRight className="flow-arrow" size={19} aria-hidden="true" />
          <div><h3>Position</h3><code>{"{ location: 'top-right' }"}</code></div>
          <ArrowRight className="flow-arrow" size={19} aria-hidden="true" />
          <div><h3>Render</h3><code>ReactNativeWindow | NativeWindow</code></div>
        </div>
      </section>
      <section className="landing-install" aria-labelledby="install-title">
        <h2 id="install-title">Install</h2>
        <CodeBlock code="npx expo install expo-draw-over-apps @expo/ui react-native-reanimated react-native-worklets" language="bash" />
        <p className="landing-note">Android only. Build a development client to use the module; Expo Go is not supported.</p>
      </section>
      <footer className="landing-footer">
        <Link href="/docs/react-native-window">React Native window <ArrowRight size={14} aria-hidden="true" /></Link>
        <Link href="/docs/native-window">Native window <ArrowRight size={14} aria-hidden="true" /></Link>
        <Link href="/docs/multiple-windows">Multiple windows <ArrowRight size={14} aria-hidden="true" /></Link>
      </footer>
    </main>
  );
}
