import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { BubbleRendererProps } from 'expo-draw-over-apps';
import {
  decrementExampleBubbleCount,
  incrementExampleBubbleCount,
  useExampleBubbleState,
} from '../state/bubbleExampleState';

export function JetpackComposeBubbleRenderer({ bubbleId, close, openApp }: BubbleRendererProps) {
  const state = useExampleBubbleState(bubbleId);

  return (
    <View style={styles.shell}>
      <Text style={styles.eyebrow}>Expo UI Bubble</Text>
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

      <View style={styles.actions}>
        <Pressable onPress={() => void openApp()} style={[styles.actionButton, styles.secondaryButton]}>
          <Text style={styles.secondaryText}>Open</Text>
        </Pressable>

        <Pressable onPress={close} style={[styles.actionButton, styles.tertiaryButton]}>
          <Text style={styles.secondaryText}>Close</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: 196,
    minHeight: 190,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 12,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#22d3ee',
    shadowColor: '#020617',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 18,
  },
  eyebrow: {
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
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
    color: '#f8fafc',
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
    minHeight: 44,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  negativeButton: {
    backgroundColor: '#334155',
  },
  positiveButton: {
    backgroundColor: '#2563eb',
  },
  secondaryButton: {
    backgroundColor: '#0f766e',
  },
  tertiaryButton: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#475569',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  secondaryText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '800',
  },
});
