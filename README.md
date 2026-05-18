# expo-draw-over-apps

`expo-draw-over-apps` is an Expo module for Android overlay permission and floating bubble UI.

It can:

- check and request the `draw over other apps` permission
- show named floating bubbles from an Android overlay service
- edge-hide a bubble on the left or right side of the screen
- keep app and bubble state in sync
- open the app from a bubble
- preview bubble UI inside the app before showing a native overlay
- register custom React Native renderers
- style custom renderers with NativeWind when your app already uses it
- use the packaged `@expo/ui` Compose-flavored renderer API
- wrap custom renderers in Reanimated React Native or Expo UI native window containers for smoother resizing

This package is Android only. It does not run in Expo Go because it includes native Android code.

## Docs

The documentation site lives in `docs/`.

```bash
npm run docs:install
npm run docs:dev
```

Build the static site:

```bash
npm run docs:build
```

Docusaurus writes the static output to `docs/build`. The repo also includes a GitHub Pages workflow that publishes that folder.

## Install

```bash
npm install expo-draw-over-apps
```

For the SDK 56 beta window containers, install Reanimated with Expo's installer:

```bash
npx expo install react-native-reanimated
```

Install `@expo/ui` only if you want the packaged Compose-flavored renderer API or the native Expo UI window container:

```bash
npx expo install @expo/ui
```

`@expo/ui` is an optional peer dependency. Apps that use only React Native window containers do not need it.

## Version tracks

- SDK 56 beta: current repo implementation. Adds Reanimated-backed `ExpoDrawOverAppsReactNativeWindowContainer` and `ExpoDrawOverAppsNativeWindowContainer`.
- SDK 55: latest npm release is `55.0.2`. It supports Android overlay permission and floating React Native or Jetpack Compose bubbles. Install with `npm install expo-draw-over-apps@55`.

If your app is a bare React Native app and does not already use Expo modules, install Expo modules first:

[Install Expo modules in a React Native project](https://docs.expo.dev/bare/installing-expo-modules/)

## Quick start

```tsx
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  canDrawOverlays,
  hideBubble,
  incrementBubbleCount,
  requestPermission,
  showBubble,
  useBubbleState,
} from 'expo-draw-over-apps';

export default function App() {
  const [granted, setGranted] = useState(false);
  const bubbleState = useBubbleState();

  useEffect(() => {
    setGranted(canDrawOverlays());
  }, []);

  async function handlePermission() {
    await requestPermission();
    setGranted(canDrawOverlays());
  }

  async function handleToggleBubble() {
    if (bubbleState.isVisible) {
      hideBubble();
      return;
    }

    await showBubble('default', { edgeHideEnabled: true });
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
      <Text>Overlay permission: {granted ? 'granted' : 'missing'}</Text>
      <Text>Bubble visible: {bubbleState.isVisible ? 'yes' : 'no'}</Text>
      <Text>Counter: {bubbleState.count}</Text>

      <Pressable onPress={() => void handlePermission()}>
        <Text>Request permission</Text>
      </Pressable>

      <Pressable onPress={() => void handleToggleBubble()}>
        <Text>{bubbleState.isVisible ? 'Hide bubble' : 'Show bubble'}</Text>
      </Pressable>

      <Pressable onPress={() => incrementBubbleCount('app')}>
        <Text>+1 in app</Text>
      </Pressable>
    </View>
  );
}
```

## Smooth window containers

Use the window containers when a bubble changes size. Both accept React Native children, React Native `style`, and NativeWind `className` / `contentClassName`.

```tsx
import { Text } from 'react-native';
import { ExpoDrawOverAppsReactNativeWindowContainer } from 'expo-draw-over-apps';

export function SmoothBubble({ state }) {
  const expanded = state.count > 0;

  return (
    <ExpoDrawOverAppsReactNativeWindowContainer
      width={expanded ? 238 : 154}
      height={expanded ? 256 : 172}
      borderRadius={expanded ? 44 : 28}
      className="border-2 border-rose-400 bg-slate-950 px-4 py-4"
      contentClassName="flex-1 items-center justify-center"
    >
      <Text style={{ color: 'white', fontWeight: '900' }}>Smooth resize</Text>
    </ExpoDrawOverAppsReactNativeWindowContainer>
  );
}
```

## Example app

The example app in `example/` shows permission handling, edge hide, named bubbles, shared state, fixture previews, and renderer switching.

Current fixtures:

- React Native Counter Bubble
- Jetpack Compose Counter Bubble
- Countdown Timer Bubble
- React Native Resize Bubble
- Native Expo UI Resize Bubble

## Development

```bash
npm run build
npm test
```

Build the Android example app:

```bash
cd example/android
./gradlew assembleDebug
```

On Windows:

```powershell
cd example\android
.\gradlew.bat assembleDebug
```

## Open source

- [Contributing guide](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [License](./LICENSE)
