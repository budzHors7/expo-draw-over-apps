# expo-draw-over-apps

An Android Expo module for draw-over-apps permission and application-owned floating windows.

The `58.x` package line targets **Expo SDK 58**, React Native 0.88, and the Expo Modules 2 bridge. It exposes two window surfaces:

- `ReactNativeWindow` for React Native content with Reanimated size and radius transitions
- `NativeWindow` for native content built with `@expo/ui/jetpack-compose`

You can show multiple named windows, choose exact `x` and `y` screen coordinates or a predefined screen location, move visible windows, edge-hide them, share numeric native state, and close each native surface independently.

> Android only. This module contains native code and does not run in Expo Go.

## Install

```bash
npx expo install expo-draw-over-apps @expo/ui react-native-reanimated react-native-worklets
```

With Bun, use the equivalent command:

```bash
bunx expo install expo-draw-over-apps @expo/ui react-native-reanimated react-native-worklets
```

The package major follows the Expo SDK major: use `expo-draw-over-apps@58` with Expo SDK 58. The published package declares `expo: ^58.0.0` as a peer dependency so package managers can report an incompatible SDK.

Build a development client after installation:

```bash
npx expo run:android
```

## Permission

```tsx
import { canDrawOverlays, requestPermission } from 'expo-draw-over-apps';

if (!canDrawOverlays()) {
  await requestPermission();
}
```

The user changes this permission in Android system settings. Recheck `canDrawOverlays()` when your app returns to the foreground.

## React Native window

Create a renderer from ordinary React Native components:

```tsx
import { Pressable, StyleSheet, Text } from 'react-native';
import {
  ReactNativeWindow,
  showBubble,
  type BubbleRendererProps,
} from 'expo-draw-over-apps';

export function StatusWindow({ bubbleId, close }: BubbleRendererProps) {
  return (
    <ReactNativeWindow
      width={220}
      height={150}
      borderRadius={28}
      backgroundColor="#0f172a"
      animationConfig={{ duration: 220 }}
      style={styles.window}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Upload complete</Text>
      <Pressable onPress={() => void showBubble(bubbleId, { x: 240, y: 120 })}>
        <Text style={styles.action}>Move</Text>
      </Pressable>
      <Pressable onPress={close}><Text style={styles.action}>Close</Text></Pressable>
    </ReactNativeWindow>
  );
}

const styles = StyleSheet.create({
  window: { borderWidth: 1, borderColor: '#38bdf8', padding: 16 },
  content: { flex: 1, justifyContent: 'space-between' },
  title: { color: '#f8fafc', fontSize: 18, fontWeight: '800' },
  action: { color: '#7dd3fc', fontWeight: '700' },
});
```

## Native window

`NativeWindow` is a direct Expo UI Jetpack Compose host. Its descendants must be Compose components rather than React Native views.

```tsx
import { Button, Column, Shape, Surface, Text } from '@expo/ui/jetpack-compose';
import { fillMaxWidth, paddingAll, size } from '@expo/ui/jetpack-compose/modifiers';
import { NativeWindow, showBubble, type BubbleRendererProps } from 'expo-draw-over-apps';

export function NativeStatusWindow({ bubbleId, close }: BubbleRendererProps) {
  return (
    <NativeWindow seedColor="#2563eb">
      <Surface
        tonalElevation={4}
        shadowElevation={12}
        shape={Shape.RoundedCorner({
          cornerRadii: { topStart: 28, topEnd: 28, bottomStart: 28, bottomEnd: 28 },
        })}
        modifiers={[size(240, 220)]}
      >
        <Column
          horizontalAlignment="center"
          verticalArrangement={{ spacedBy: 10 }}
          modifiers={[fillMaxWidth(), paddingAll(16)]}
        >
          <Text style={{ typography: 'titleMedium', fontWeight: '800' }}>Upload complete</Text>
          <Button onClick={() => void showBubble(bubbleId, { x: 240, y: 120 })}>
            <Text>Move</Text>
          </Button>
          <Button onClick={close}><Text>Close</Text></Button>
        </Column>
      </Surface>
    </NativeWindow>
  );
}
```

See Expo's [SDK 58 Jetpack Compose reference](https://docs.expo.dev/versions/v58.0.0/sdk/ui/jetpack-compose/) for the supported native components and modifiers. Expo UI for Android is beta in this SDK.

## Register and show

Register application-owned renderers before starting the overlay service. Clear them and close their native surfaces during cleanup.

```tsx
import { useEffect } from 'react';
import {
  closeBubble,
  setBubbleRendererForBubble,
  showBubble,
} from 'expo-draw-over-apps';
import { StatusWindow } from './StatusWindow';

const BUBBLE_ID = 'status-window';

export function OverlayRegistration() {
  useEffect(() => {
    setBubbleRendererForBubble(BUBBLE_ID, StatusWindow);

    return () => {
      closeBubble(BUBBLE_ID);
      setBubbleRendererForBubble(BUBBLE_ID, null);
    };
  }, []);

  return null;
}

await showBubble(BUBBLE_ID, { x: 48, y: 180, edgeHideEnabled: true });
await showBubble(BUBBLE_ID, { location: 'bottom-right' });
```

Coordinates are optional physical screen pixels measured from the top-left corner. Each axis can be supplied independently. `location` accepts the complete 3×3 grid: `top-left`, `top-center`, `top-right`, `center-left`, `center`, `center-right`, `bottom-left`, `bottom-center`, and `bottom-right`. The `top` and `bottom` aliases remain available for `top-center` and `bottom-center`. Presets keep the complete window within the visible movement bounds. An explicit `x` or `y` overrides that preset axis. Android clamps explicit positions into the available display bounds. Calling `showBubble` with an already-visible ID repositions that window immediately.

## Main API

- Permission: `canDrawOverlays`, `requestPermission`
- Windows: `showBubble`, `closeBubble`, `closeAllBubbles`, `isBubbleVisible`, `setEdgeHideEnabled`
- Renderers: `setBubbleRenderer`, `setBubbleRendererForBubble`, `ReactNativeWindow`, `NativeWindow`
- State: `useBubbleState`, `useAllBubbleStates`, `subscribeToBubbleState`
- Numeric shared values: `setOverlaySharedValue`, `useOverlaySharedValueState`, `getOverlaySharedValueState`
- In-app fixtures: `FloatingWindowPreview`

The complete generated reference and focused tutorials are on the [documentation site](https://budzhors7.github.io/expo-draw-over-apps/).

## Development

```bash
npm install
npm run build
npm test
npm run lint
```

For the docs website:

```bash
npm run docs:install
npm run docs:dev
npm run docs:build
```

The Next.js App Router site uses MDX and exports static GitHub Pages assets to `docs/out`.

Run the example on an Android emulator for native overlay verification:

```bash
cd example
npm install
npx expo run:android
```

## Project

- [Contributing](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [MIT License](./LICENSE)
