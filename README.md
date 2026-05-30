# expo-draw-over-apps

`expo-draw-over-apps` is an Expo module for Android overlay permission and floating bubble UI.

It can:

- check and request the `draw over other apps` permission
- show named floating bubbles from an Android overlay service
- close bubbles and release their overlay surfaces
- edge-hide a bubble on the left or right side of the screen
- keep overlay visibility state in sync
- share numeric overlay values through native state, including foreground refreshes after background overlay updates
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

For SDK 56 window containers, install Reanimated with Expo's installer:

```bash
npx expo install react-native-reanimated react-native-worklets
```

Install `@expo/ui` only if you want the packaged Compose-flavored renderer API or the native Expo UI window container:

```bash
npx expo install @expo/ui
```

`@expo/ui` is an optional peer dependency. Apps that use only React Native window containers do not need it.

## Version tracks

- SDK 56: current stable implementation, published as `56.0.6`. Adds native overlay shared values, Reanimated-backed `ReactNativeWindowContainer`, and `NativeWindowContainer`.
- SDK 55: latest npm release is `55.0.2`. It supports Android overlay permission and floating React Native or Jetpack Compose bubbles. Install with `npm install expo-draw-over-apps@55`.

If your app is a bare React Native app and does not already use Expo modules, install Expo modules first:

[Install Expo modules in a React Native project](https://docs.expo.dev/bare/installing-expo-modules/)

## Quick start

```tsx
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  canDrawOverlays,
  closeBubble,
  requestPermission,
  setOverlaySharedValue,
  showBubble,
  useBubbleState,
  useOverlaySharedValueState,
} from 'expo-draw-over-apps';

const counterKey = 'quick-start-counter';

export default function App() {
  const [granted, setGranted] = useState(false);
  const bubbleState = useBubbleState();
  const counterState = useOverlaySharedValueState(counterKey);

  useEffect(() => {
    setGranted(canDrawOverlays());
  }, []);

  async function handlePermission() {
    await requestPermission();
    setGranted(canDrawOverlays());
  }

  async function handleToggleBubble() {
    if (bubbleState.isVisible) {
      closeBubble();
      return;
    }

    await showBubble('default', { edgeHideEnabled: true });
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
      <Text>Overlay permission: {granted ? 'granted' : 'missing'}</Text>
      <Text>Bubble visible: {bubbleState.isVisible ? 'yes' : 'no'}</Text>
      <Text>Shared counter: {counterState.value}</Text>

      <Pressable onPress={() => void handlePermission()}>
        <Text>Request permission</Text>
      </Pressable>

      <Pressable onPress={() => void handleToggleBubble()}>
        <Text>{bubbleState.isVisible ? 'Close bubble' : 'Show bubble'}</Text>
      </Pressable>

      <Pressable
        onPress={() => setOverlaySharedValue(counterKey, counterState.value + 1, 'app')}
      >
        <Text>+1 in app</Text>
      </Pressable>
    </View>
  );
}
```

## Smooth window containers

Use the window containers when a bubble changes size. Both accept React Native children, React Native `style`, and NativeWind `className` / `contentClassName`. When no background is declared, both containers follow the system light/dark scheme; pass `backgroundColor`, a style background, or `colorScheme` to force a look.

```tsx
import { Pressable, Text } from 'react-native';
import {
  ReactNativeWindowContainer,
  setOverlaySharedValue,
  useOverlaySharedValueState,
} from 'expo-draw-over-apps';

const resizeKey = 'window-container-counter';

export function SmoothBubble() {
  const sharedStep = useOverlaySharedValueState(resizeKey);
  const expanded = sharedStep.value >= 1;

  return (
    <ReactNativeWindowContainer
      width={expanded ? 238 : 154}
      height={expanded ? 256 : 172}
      borderRadius={expanded ? 44 : 28}
      className="border-2 border-rose-400 bg-slate-950 px-4 py-4"
      contentClassName="flex-1 items-center justify-center"
    >
      <Text style={{ color: 'white', fontWeight: '900' }}>Smooth resize</Text>
      <Pressable
        onPress={() => setOverlaySharedValue(resizeKey, expanded ? 0 : 1, 'bubble')}
      >
        <Text style={{ color: 'white' }}>Resize</Text>
      </Pressable>
    </ReactNativeWindowContainer>
  );
}
```

## Data safety

Use static, non-sensitive bubble IDs and overlay shared-value keys. IDs and keys cross the JavaScript/native boundary and are normalized for stability, not privacy. Overlay shared values store numbers only; keep secrets, personal data, objects, and larger app state in your own protected store.

## Example app

The example app in `example/` shows permission handling, edge hide, named bubbles, example-owned counter/timer helpers backed by native shared values, fixture previews, and renderer switching.

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

Install and build the Android example app:

```bash
cd example
npm install
npx expo prebuild -p android
npx expo run:android
```

The example keeps local `file:..` installs packed with `install-links=true`. This avoids duplicate native module discovery while still testing the publishable package shape. Its Expo config plugin also keeps Reanimated and Worklets CMake staging paths short enough for Windows Android builds.

Run `npx expo install --fix` inside `example/` when Expo reports dependency drift.

## Open source

- [Contributing guide](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [License](./LICENSE)
