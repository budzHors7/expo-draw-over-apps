import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getExpoDrawOverAppsModule } from './ExpoDrawOverAppsModule';
import { decrementBubbleCount, incrementBubbleCount, setBubbleCount, useBubbleState } from './bubbleState';
import { useBubbleRenderer } from './bubbleRenderer';
import { DEFAULT_BUBBLE_ID } from './bubbleTypes';

type ExpoDrawOverAppsBubbleSurfaceProps = {
  bubbleId?: string;
};

export default function ExpoDrawOverAppsBubbleSurface({
  bubbleId = DEFAULT_BUBBLE_ID,
}: ExpoDrawOverAppsBubbleSurfaceProps) {
  const bubbleState = useBubbleState(bubbleId);
  const BubbleRenderer = useBubbleRenderer(bubbleId);

  if (!bubbleState.isVisible) {
    return null;
  }

  if (BubbleRenderer) {
    return (
      <BubbleRenderer
        bubbleId={bubbleId}
        state={bubbleState}
        increment={() => incrementBubbleCount('bubble', bubbleId)}
        decrement={() => decrementBubbleCount('bubble', bubbleId)}
        setCount={(count) => setBubbleCount(count, 'bubble', bubbleId)}
        hide={() =>
          (bubbleId === DEFAULT_BUBBLE_ID
            ? getExpoDrawOverAppsModule()?.hideBubble()
            : getExpoDrawOverAppsModule()?.hideBubbleInstance(bubbleId)) ?? false
        }
        openApp={() => getExpoDrawOverAppsModule()?.openApp() ?? Promise.resolve(false)}
      />
    );
  }

  return (
    <View style={styles.bubble}>
      <Text style={styles.caption}>Bubble Counter</Text>
      <View style={styles.debugBadge}>
        <Text style={styles.debugBadgeText}>ID: {bubbleId}</Text>
      </View>
      <View style={styles.counterRow}>
        <Pressable
          onPress={() => decrementBubbleCount('bubble', bubbleId)}
          style={[styles.counterAction, styles.counterActionDark]}
        >
          <Text style={styles.counterActionText}>-</Text>
        </Pressable>
        <Pressable onPress={() => incrementBubbleCount('bubble', bubbleId)} style={styles.counterButton}>
          <Text style={styles.counterValue}>{bubbleState.count}</Text>
          <Text style={styles.counterHint}>Tap + / -</Text>
        </Pressable>
        <Pressable
          onPress={() => incrementBubbleCount('bubble', bubbleId)}
          style={[styles.counterAction, styles.counterActionBright]}
        >
          <Text style={styles.counterActionText}>+</Text>
        </Pressable>
      </View>
      <Pressable onPress={() => void getExpoDrawOverAppsModule()?.openApp()} style={styles.openAppButton}>
        <Text style={styles.openAppText}>Open app</Text>
      </Pressable>
      <Text style={styles.longPressHint}>Hold bubble for menu</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    width: 168,
    minHeight: 122,
    borderRadius: 24,
    padding: 14,
    gap: 10,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#020617',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 18,
  },
  caption: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  debugBadge: {
    alignSelf: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
  },
  debugBadgeText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
  },
  counterButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    gap: 2,
  },
  counterValue: {
    color: '#eff6ff',
    fontSize: 26,
    fontWeight: '800',
  },
  counterHint: {
    color: '#dbeafe',
    fontSize: 11,
    fontWeight: '600',
  },
  counterAction: {
    width: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterActionDark: {
    backgroundColor: '#334155',
  },
  counterActionBright: {
    backgroundColor: '#2563eb',
  },
  counterActionText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: -2,
  },
  openAppButton: {
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
  },
  openAppText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '700',
  },
  longPressHint: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});
