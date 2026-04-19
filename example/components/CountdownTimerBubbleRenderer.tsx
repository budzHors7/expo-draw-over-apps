import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { BubbleRendererProps } from 'expo-draw-over-apps';

export const TIMER_DURATION_SECONDS = 15;

function formatCountdown(totalSeconds: number) {
  const safeValue = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeValue / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (safeValue % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
}

export function CountdownTimerBubbleRenderer({ bubbleId, state, setCount, hide }: BubbleRendererProps) {
  useEffect(() => {
    if (state.count <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setCount(state.count - 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [setCount, state.count]);

  return (
    <View style={styles.shell}>
      <Text style={styles.eyebrow}>Countdown Bubble</Text>
      <View style={styles.debugBadge}>
        <Text style={styles.debugBadgeText}>ID: {bubbleId}</Text>
      </View>
      <Text style={styles.title}>Focus timer</Text>
      <Text style={styles.timeValue}>{formatCountdown(state.count)}</Text>
      <Text style={styles.bodyText}>
        {state.count > 0
          ? 'Refreshing every second without dragging.'
          : 'Time is up. Restart to run the timer again.'}
      </Text>

      <View style={styles.actions}>
        <Pressable onPress={() => setCount(TIMER_DURATION_SECONDS)} style={styles.restartButton}>
          <Text style={styles.restartText}>Restart</Text>
        </Pressable>

        <Pressable onPress={hide} style={styles.hideButton}>
          <Text style={styles.hideText}>Hide bubble</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: 208,
    minHeight: 188,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 10,
    backgroundColor: '#1c1917',
    borderWidth: 2,
    borderColor: '#f59e0b',
    shadowColor: '#0c0a09',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 18,
  },
  eyebrow: {
    color: '#fcd34d',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  debugBadge: {
    alignSelf: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#1c1917',
    borderWidth: 1,
    borderColor: '#78716c',
  },
  debugBadgeText: {
    color: '#fde68a',
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    color: '#fff7ed',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  timeValue: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  bodyText: {
    color: '#fed7aa',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  restartButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 11,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
  },
  restartText: {
    color: '#1c1917',
    fontSize: 12,
    fontWeight: '800',
  },
  hideButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 11,
    backgroundColor: '#292524',
    borderWidth: 1,
    borderColor: '#57534e',
    alignItems: 'center',
  },
  hideText: {
    color: '#fafaf9',
    fontSize: 12,
    fontWeight: '800',
  },
});
