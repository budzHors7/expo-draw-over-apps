import React, { useMemo, useState } from 'react';

type VersionKey = '56-beta' | '55';

const versionCopy: Record<
  VersionKey,
  {
    label: string;
    badge: string;
    install: string;
    notes: string[];
    links: { label: string; href: string }[];
  }
> = {
  '56-beta': {
    label: 'SDK 56 beta',
    badge: 'Current repo implementation',
    install: 'npm install expo-draw-over-apps@56.0.2-beta.1 react-native-reanimated',
    notes: [
      'Targets Expo SDK 56 beta, React 19.2.3, and React Native 0.85.',
      'Adds Reanimated window containers for smooth overlay resize transitions.',
      'Includes React Native and Expo UI native window containers that accept React Native children.',
    ],
    links: [
      {
        label: 'Expo SDK 56 beta changelog',
        href: 'https://expo.dev/changelog/sdk-56-beta',
      },
    ],
  },
  '55': {
    label: 'SDK 55',
    badge: 'Latest npm release',
    install: 'npm install expo-draw-over-apps@55',
    notes: [
      'Version 55.0.0 supports Android overlay permission and floating React Native bubbles.',
      'Version 55.0.2 adds React Native or Jetpack Compose bubble support and depends on @expo/ui ~55.0.11.',
      'Use this line when your app is still on Expo SDK 55.',
    ],
    links: [
      {
        label: 'npm package',
        href: 'https://www.npmjs.com/package/expo-draw-over-apps',
      },
    ],
  },
};

export default function VersionInstallSelector() {
  const [selectedVersion, setSelectedVersion] = useState<VersionKey>('56-beta');
  const copy = useMemo(() => versionCopy[selectedVersion], [selectedVersion]);

  return (
    <section className="versionInstallSelector" aria-label="Select expo-draw-over-apps version">
      <div className="versionInstallSelector__header">
        <div>
          <p className="versionInstallSelector__eyebrow">Module version</p>
          <h2 className="versionInstallSelector__title">Choose the docs track</h2>
        </div>
        <label className="versionInstallSelector__control">
          <span>Version</span>
          <select
            value={selectedVersion}
            onChange={(event) => setSelectedVersion(event.target.value as VersionKey)}
          >
            <option value="56-beta">SDK 56 beta</option>
            <option value="55">SDK 55</option>
          </select>
        </label>
      </div>

      <div className="versionInstallSelector__body">
        <div>
          <div className="versionInstallSelector__badge">{copy.badge}</div>
          <h3>{copy.label}</h3>
          <ul>
            {copy.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <div className="versionInstallSelector__links">
            {copy.links.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <pre className="versionInstallSelector__command">
          <code>{copy.install}</code>
        </pre>
      </div>
    </section>
  );
}
