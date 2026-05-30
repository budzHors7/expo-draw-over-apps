import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { BubbleRendererProps } from 'expo-draw-over-apps';
import {
  decrementExampleBubbleCount,
  incrementExampleBubbleCount,
  useExampleBubbleState,
} from '../state/bubbleExampleState';

export function ReactNativeBubbleRenderer({ bubbleId, close, openApp }: BubbleRendererProps) {
  const state = useExampleBubbleState(bubbleId);

  return (
    <View style={styles.shell}>
      <Text style={styles.eyebrow}>React Native Bubble</Text>
      <View style={styles.debugBadge}>
        <Text style={styles.debugBadgeText}>ID: {bubbleId}</Text>
      </View>
      <Text style={styles.count}>{state.count}</Text>

      <View style={styles.actions}>
        <Pressable
          onPress={() => decrementExampleBubbleCount('bubble', bubbleId)}
          style={[styles.actionButton, styles.negativeButton]}
        >
          <Text style={styles.actionText}>-</Text>
        </Pressable>

        <Pressable
          onPress={() => incrementExampleBubbleCount('bubble', bubbleId)}
          style={[styles.actionButton, styles.positiveButton]}
        >
          <Text style={styles.actionText}>+</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => void openApp()} style={styles.openButton}>
        <Text style={styles.openText}>Open app</Text>
      </Pressable>

      <Pressable onPress={close} style={styles.hideButton}>
        <Text style={styles.hideText}>Close bubble</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: 196,
    minHeight: 182,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 12,
    backgroundColor: '#111827',
    borderWidth: 2,
    borderColor: '#22c55e',
    shadowColor: '#030712',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 18,
  },
  eyebrow: {
    color: '#86efac',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  debugBadge: {
    alignSelf: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#475569',
  },
  debugBadgeText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
  },
  count: {
    color: '#f9fafb',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positiveButton: {
    backgroundColor: '#2563eb',
  },
  negativeButton: {
    backgroundColor: '#f97316',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  openButton: {
    borderRadius: 16,
    paddingVertical: 11,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
  },
  openText: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '800',
  },
  hideButton: {
    borderRadius: 16,
    paddingVertical: 10,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#4b5563',
    alignItems: 'center',
  },
  hideText: {
    color: '#f9fafb',
    fontSize: 12,
    fontWeight: '700',
  },
});
