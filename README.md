# expo-draw-over-apps

`expo-draw-over-apps` is an Expo module for Android that lets your app:

- check and request the `draw over other apps` permission
- show a draggable floating bubble over other apps
- keep a shared counter in sync between the app and the bubble
- open the app from the bubble
- render the bubble with React Native components
- replace the default bubble UI with your own styled React Native component

This module is currently Android only.

## Features

- Android overlay permission helpers
- Floating bubble overlay rendered with React Native
- Draggable bubble window
- Shared realtime bubble state
- Long-press menu to remove the bubble
- Custom bubble renderer support with `StyleSheet` or NativeWind

## Open Source

- [Contributing guide](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)

## Installation

```bash
bun add expo-draw-over-apps
```

If your app does not already use Expo modules in a bare React Native app, install Expo modules first:

[Install Expo modules in a React Native project](https://docs.expo.dev/bare/installing-expo-modules/)

## Expo app requirements

This package contains native Android code, so it does not work in Expo Go.

Use one of these:

- a development build
- a custom client
- a standalone Android build

If you are using Expo managed workflow, run prebuild/build as usual for native modules.

## Android setup

The module ships with the required Android manifest entries:

- `android.permission.SYSTEM_ALERT_WINDOW`
- the internal overlay service

No extra manual manifest setup should be required after autolinking.

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

    await showBubble();
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
      <Text>Overlay permission: {granted ? 'granted' : 'missing'}</Text>
      <Text>Bubble visible: {bubbleState.isVisible ? 'yes' : 'no'}</Text>
      <Text>Counter: {bubbleState.count}</Text>

      <Pressable onPress={handlePermission}>
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

## Permission flow

`requestPermission()` opens the Android overlay permission screen when permission is missing.

Typical flow:

1. Call `canDrawOverlays()`.
2. If it returns `false`, call `requestPermission()`.
3. When the app becomes active again, call `canDrawOverlays()` one more time.
4. Only call `showBubble()` after permission is granted.

## Bubble behavior

The built-in bubble:

- can be dragged around the screen
- exposes `+` and `-` counter actions
- can open the app
- can be hidden
- shows a long-press remove menu

The bubble uses React Native UI, not native Android widgets.

## Custom bubble UI

You can replace the default bubble renderer with your own React Native component by calling `setBubbleRenderer`.

That means you can style it with:

- React Native `StyleSheet`
- inline styles
- NativeWind `className` if your host app already has NativeWind configured

### Example

```tsx
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  type BubbleRendererProps,
  setBubbleRenderer,
} from 'expo-draw-over-apps';

function MyBubble({ state, increment, decrement, hide, openApp }: BubbleRendererProps) {
  return (
    <View style={styles.bubble}>
      <Text style={styles.label}>Counter</Text>
      <Text style={styles.count}>{state.count}</Text>

      <View style={styles.row}>
        <Pressable onPress={decrement} style={styles.button}>
          <Text style={styles.buttonText}>-</Text>
        </Pressable>

        <Pressable onPress={increment} style={styles.button}>
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => void openApp()} style={styles.secondaryButton}>
        <Text style={styles.secondaryText}>Open app</Text>
      </Pressable>

      <Pressable onPress={hide} style={styles.secondaryButton}>
        <Text style={styles.secondaryText}>Hide</Text>
      </Pressable>
    </View>
  );
}

export default function Screen() {
  useEffect(() => {
    setBubbleRenderer(MyBubble);
    return () => setBubbleRenderer(null);
  }, []);

  return null;
}

const styles = StyleSheet.create({
  bubble: {
    width: 200,
    borderRadius: 24,
    padding: 16,
    gap: 12,
    backgroundColor: '#111827',
  },
  label: {
    color: '#86efac',
    textAlign: 'center',
  },
  count: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#2563eb',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
  },
  secondaryText: {
    color: '#111827',
    fontWeight: '700',
  },
});
```

## NativeWind example

If your app already uses NativeWind, your custom renderer can use `className` too:

```tsx
import { Pressable, Text, View } from 'react-native';
import type { BubbleRendererProps } from 'expo-draw-over-apps';

export function TailwindBubble({ state, increment, decrement }: BubbleRendererProps) {
  return (
    <View className="w-48 rounded-3xl bg-slate-900 p-4">
      <Text className="text-center text-xs font-bold uppercase tracking-wider text-emerald-300">
        Counter
      </Text>
      <Text className="text-center text-4xl font-black text-white">
        {state.count}
      </Text>
      <View className="mt-3 flex-row gap-2">
        <Pressable className="flex-1 items-center rounded-2xl bg-orange-500 py-3" onPress={decrement}>
          <Text className="text-xl font-black text-white">-</Text>
        </Pressable>
        <Pressable className="flex-1 items-center rounded-2xl bg-blue-600 py-3" onPress={increment}>
          <Text className="text-xl font-black text-white">+</Text>
        </Pressable>
      </View>
    </View>
  );
}
```

## API

### `canDrawOverlays(): boolean`

Returns whether the app currently has overlay permission.

### `requestPermission(): Promise<boolean>`

Opens the Android overlay permission screen when needed.

Returns:

- `true` if permission is already granted
- `false` if Android opened settings and the user still needs to grant it

### `showBubble(): Promise<boolean>`

Shows the floating bubble.

Returns `true` when the request was accepted.

### `hideBubble(): boolean`

Hides the floating bubble.

### `isBubbleVisible(): boolean`

Returns the current known visibility state.

### `openApp(): Promise<boolean>`

Brings the app back to the foreground from the bubble.

### `incrementBubbleCount(source?: 'app' | 'bubble'): number`

Adds `1` to the shared counter.

### `decrementBubbleCount(source?: 'app' | 'bubble'): number`

Subtracts `1` from the shared counter, without going below `0`.

### `setBubbleCount(count: number, source?: 'app' | 'bubble'): number`

Sets the shared counter to a specific value.

### `refreshBubbleState(): BubbleState`

Refreshes the shared bubble state from native state.

### `subscribeToBubbleState(listener): () => void`

Subscribes to bubble state changes.

### `useBubbleState(): BubbleState`

React hook for the shared bubble state.

### `setBubbleRenderer(renderer: BubbleRenderer | null): void`

Registers a custom React Native bubble renderer.

Pass `null` to restore the default renderer.

## Types

### `BubbleState`

```ts
type BubbleState = {
  count: number;
  isVisible: boolean;
  lastUpdatedAt: number;
  lastChangeSource: 'app' | 'bubble';
};
```

### `BubbleRendererProps`

```ts
type BubbleRendererProps = {
  state: BubbleState;
  increment(): number;
  decrement(): number;
  setCount(count: number): number;
  hide(): boolean;
  openApp(): Promise<boolean>;
};
```

## Notes

- Android only
- not supported in Expo Go
- overlay permission must be granted by the user
- the floating bubble is hosted by an Android service
- custom bubble UI must still use React Native components

## Example app

The repo includes a working example app in `example/` showing:

- permission handling
- show/hide bubble
- shared realtime counter updates
- custom bubble styling
- open app from bubble
- long-press remove menu

## Documentation website

The repo now includes a standalone Next.js documentation site in `docs/`.

Run it locally:

```bash
npm run docs:install
npm run docs:dev
```

Build the static export:

```bash
npm run docs:build
```

That will generate the static site in `docs/out`.

If you prefer running the docs app directly:

```bash
cd docs
npm install
npm run dev
```

## Development

```bash
npm run build
```

To build the Android example app:

```bash
cd example/android
./gradlew assembleDebug
```

On Windows:

```powershell
cd example\android
.\gradlew.bat assembleDebug
```
