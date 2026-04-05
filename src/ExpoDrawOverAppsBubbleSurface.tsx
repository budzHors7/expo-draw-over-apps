import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getExpoDrawOverAppsModule } from './ExpoDrawOverAppsModule';
import { decrementBubbleCount, incrementBubbleCount, setBubbleCount, useBubbleState } from './bubbleState';
import { useBubbleRenderer } from './bubbleRenderer';

export default function ExpoDrawOverAppsBubbleSurface() {
  const bubbleState = useBubbleState();
  const BubbleRenderer = useBubbleRenderer();

  if (!bubbleState.isVisible) {
    return null;
  }

  if (BubbleRenderer) {
    return (
      <BubbleRenderer
        state={bubbleState}
        increment={() => incrementBubbleCount('bubble')}
        decrement={() => decrementBubbleCount('bubble')}
        setCount={(count) => setBubbleCount(count, 'bubble')}
        hide={() => getExpoDrawOverAppsModule()?.hideBubble() ?? false}
        openApp={() => getExpoDrawOverAppsModule()?.openApp() ?? Promise.resolve(false)}
      />
    );
  }

  return (
    <View style={styles.bubble}>
      <Text style={styles.caption}>Bubble Counter</Text>
      <View style={styles.counterRow}>
        <Pressable onPress={() => decrementBubbleCount('bubble')} style={[styles.counterAction, styles.counterActionDark]}>
          <Text style={styles.counterActionText}>-</Text>
        </Pressable>
        <Pressable onPress={() => incrementBubbleCount('bubble')} style={styles.counterButton}>
          <Text style={styles.counterValue}>{bubbleState.count}</Text>
          <Text style={styles.counterHint}>Tap + / -</Text>
        </Pressable>
        <Pressable onPress={() => incrementBubbleCount('bubble')} style={[styles.counterAction, styles.counterActionBright]}>
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
