import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';

const windows = [
  {
    title: 'ReactNativeWindow',
    body: 'Render application-owned React Native views with animated width, height, and corner radius.',
    href: '/docs/tutorial/react-native-window',
  },
  {
    title: 'NativeWindow',
    body: 'Render application-owned Expo UI components directly inside an SDK 58 Jetpack Compose Host.',
    href: '/docs/tutorial/native-window',
  },
];

export default function Home(): JSX.Element {
  return (
    <Layout
      title="Expo Draw Over Apps"
      description="SDK 58 Android overlay windows for React Native and Jetpack Compose"
    >
      <main>
        <section className="homeHero">
          <div className="container homeHeroInner">
            <div className="homeHeroCopy">
              <Heading as="h1">Two window roots. Your UI.</Heading>
              <p>
                An Expo SDK 58 module for Android overlay permission, named floating windows, and
                application-owned React Native or Jetpack Compose content.
              </p>
              <div className="homeHeroActions">
                <Link className="button button--primary button--lg" to="/docs/">
                  Start with SDK 58
                </Link>
                <Link className="button button--secondary button--lg" to="/docs/api/">
                  API guide
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="container homeSection">
          <div className="homeGrid">
            {windows.map((window) => (
              <article className="homeCard" key={window.title}>
                <Heading as="h2">{window.title}</Heading>
                <p>{window.body}</p>
                <Link to={window.href}>Copy the complete example →</Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
