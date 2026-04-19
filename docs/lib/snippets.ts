export const installSnippet = String.raw`npm install expo-draw-over-apps

# Optional if you want the packaged Compose-flavored renderer API
npm install @expo/ui`;

export const quickStartSnippet = String.raw`import { useEffect, useState } from 'react';
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
}`;

export const edgeHideSnippet = String.raw`import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  hideBubble,
  setEdgeHideEnabled,
  showBubble,
  useBubbleState,
} from 'expo-draw-over-apps';

const bubbleId = 'chat-head';

export default function EdgeHideControls() {
  const [edgeHideEnabled, setEdgeHide] = useState(true);
  const bubbleState = useBubbleState(bubbleId);

  async function handleShow() {
    await showBubble(bubbleId, { edgeHideEnabled });
  }

  function handleToggleEdgeHide() {
    const nextValue = !edgeHideEnabled;
    setEdgeHideEnabled(nextValue, bubbleId);
    setEdgeHide(nextValue);
  }

  return (
    <View style={{ gap: 12 }}>
      <Text>Bubble visible: {bubbleState.isVisible ? 'yes' : 'no'}</Text>
      <Text>Edge hide: {edgeHideEnabled ? 'enabled' : 'disabled'}</Text>

      <Pressable onPress={() => void handleShow()}>
        <Text>Show chat head</Text>
      </Pressable>

      <Pressable onPress={handleToggleEdgeHide}>
        <Text>{edgeHideEnabled ? 'Disable' : 'Enable'} edge hide</Text>
      </Pressable>

      <Pressable onPress={() => hideBubble(bubbleId)}>
        <Text>Hide bubble</Text>
      </Pressable>
    </View>
  );
}`;

export const customRendererSnippet = String.raw`import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  type BubbleRendererProps,
  setBubbleRendererForBubble,
} from 'expo-draw-over-apps';

const bubbleId = 'chat-head';

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
    setBubbleRendererForBubble(bubbleId, MyBubble);
    return () => setBubbleRendererForBubble(bubbleId, null);
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
});`;

export const composeRendererSnippet = String.raw`import { useEffect } from 'react';
import {
  setBubbleRendererForBubble,
  setComposeBubbleRenderer,
} from 'expo-draw-over-apps';

const bubbleId = 'jetpack-compose-counter';

export default function ComposeBubbleRegistration() {
  useEffect(() => {
    setComposeBubbleRenderer(bubbleId);

    return () => {
      setBubbleRendererForBubble(bubbleId, null);
    };
  }, []);

  return null;
}`;

export const tailwindRendererSnippet = String.raw`import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  type BubbleRendererProps,
  setBubbleRenderer,
} from 'expo-draw-over-apps';

function TailwindBubble({ state, increment, decrement, hide, openApp }: BubbleRendererProps) {
  return (
    <View className="w-52 rounded-[28px] bg-black px-4 py-4">
      <Text className="text-center text-[11px] font-semibold uppercase tracking-[2px] text-zinc-400">
        Tailwind bubble
      </Text>
      <Text className="mt-3 text-center text-4xl font-black text-white">{state.count}</Text>

      <View className="mt-4 flex-row gap-3">
        <Pressable onPress={decrement} className="flex-1 rounded-2xl border border-white/10 bg-zinc-900 py-3">
          <Text className="text-center text-xl font-bold text-white">-</Text>
        </Pressable>

        <Pressable onPress={increment} className="flex-1 rounded-2xl bg-white py-3">
          <Text className="text-center text-xl font-bold text-black">+</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => void openApp()} className="mt-3 rounded-2xl bg-zinc-100 py-3">
        <Text className="text-center font-semibold text-black">Open app</Text>
      </Pressable>
      <Pressable onPress={hide} className="mt-2 rounded-2xl border border-white/10 py-3">
        <Text className="text-center font-semibold text-white">Hide bubble</Text>
      </Pressable>
    </View>
  );
}

export default function BubbleRendererRegistration() {
  useEffect(() => {
    setBubbleRenderer(TailwindBubble);
    return () => setBubbleRenderer(null);
  }, []);

  return null;
}`;
