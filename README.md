# expo-draw-over-apps

Android overlay windows for Expo SDK 58. The package manages overlay permission and window lifecycle; your app owns everything rendered inside the window.

Choose one root:

- `ReactNativeWindow` for React Native children and animated numeric sizing.
- `NativeWindow` for direct [`@expo/ui/jetpack-compose`](https://docs.expo.dev/versions/v58.0.0/sdk/ui/jetpack-compose/) children.

This is an SDK 58 hard cut with exactly these two window roots and no packaged Compose renderer. The module is Android-only and requires a development or production build; it does not run in Expo Go.

## Install

```bash
npm install expo-draw-over-apps
npx expo install @expo/ui react-native-reanimated react-native-worklets
npx expo prebuild --platform android
```

If this is a bare React Native app, [install Expo modules](https://docs.expo.dev/bare/installing-expo-modules/) first.

## Permission

```tsx
import { AppState, Button, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { canDrawOverlays, requestPermission } from 'expo-draw-over-apps';

export default function PermissionScreen() {
  const [granted, setGranted] = useState(canDrawOverlays());

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setGranted(canDrawOverlays());
    });
    return () => subscription.remove();
  }, []);

  return (
    <View>
      <Text>{granted ? 'Overlay permission granted' : 'Overlay permission required'}</Text>
      <Button title="Open overlay settings" onPress={() => void requestPermission()} />
    </View>
  );
}
```

`requestPermission()` opens Android settings when permission is missing. Re-check `canDrawOverlays()` after the app becomes active again.

## React Native window

```tsx
import { useEffect } from 'react';
import { Button, Text, View } from 'react-native';
import {
  ReactNativeWindow,
  setBubbleRendererForBubble,
  showBubble,
  type BubbleRendererProps,
} from 'expo-draw-over-apps';

const bubbleId = 'react-native-window';

function ReactNativeRenderer({ close }: BubbleRendererProps) {
  return (
    <ReactNativeWindow width={220} borderRadius={24} contentContainerStyle={{ padding: 16 }}>
      <Text>Application-owned React Native content</Text>
      <Button title="Close" onPress={close} />
    </ReactNativeWindow>
  );
}

export default function App() {
  useEffect(() => {
    setBubbleRendererForBubble(bubbleId, ReactNativeRenderer);
    return () => setBubbleRendererForBubble(bubbleId, null);
  }, []);

  return <Button title="Show React Native window" onPress={() => void showBubble(bubbleId)} />;
}
```

## Native Compose window

```tsx
import { useEffect } from 'react';
import { Button as ReactNativeButton } from 'react-native';
import { Button, Column, Surface, Text } from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';
import {
  NativeWindow,
  setBubbleRendererForBubble,
  showBubble,
  type BubbleRendererProps,
} from 'expo-draw-over-apps';

const bubbleId = 'native-window';

function NativeRenderer({ close }: BubbleRendererProps) {
  return (
    <NativeWindow seedColor="#2563eb">
      <Surface>
        <Column modifiers={[paddingAll(16)]}>
          <Text>Application-owned Compose content</Text>
          <Button onClick={close}>
            <Text>Close</Text>
          </Button>
        </Column>
      </Surface>
    </NativeWindow>
  );
}

export default function App() {
  useEffect(() => {
    setBubbleRendererForBubble(bubbleId, NativeRenderer);
    return () => setBubbleRendererForBubble(bubbleId, null);
  }, []);

  return <ReactNativeButton title="Show native window" onPress={() => void showBubble(bubbleId)} />;
}
```

`NativeWindow` renders Compose children directly. If Compose content needs a React Native subtree, use Expo UI's documented `RNHostView` interop explicitly.

## Documentation and development

The [documentation site](./docs/docs/index.mdx) has complete permission, window, lifecycle, state, and API guides.

```bash
npm install
npm test -- --runInBand
npm run build
npm run docs:install
npm run docs:build
```

The example app contains exactly two application-owned fixtures, one for each window root.

## Data safety

Use static, non-sensitive bubble IDs and overlay shared-value keys. They cross the JavaScript/native boundary and are normalized for stability, not privacy. Native shared values store numbers only; keep secrets and larger application state in your own protected store.

## Project

- [Contributing guide](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [License](./LICENSE)
