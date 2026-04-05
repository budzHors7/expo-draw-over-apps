import { useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  type BubbleRendererProps,
  canDrawOverlays,
  decrementBubbleCount,
  hideBubble,
  incrementBubbleCount,
  isBubbleVisible,
  setBubbleRenderer,
  requestPermission,
  setBubbleCount,
  showBubble,
  useBubbleState,
} from 'expo-draw-over-apps';

function StyledBubbleRenderer({ state, decrement, increment, hide, openApp }: BubbleRendererProps) {
  return (
    <View style={bubbleStyles.shell}>
      <Text style={bubbleStyles.eyebrow}>Custom Bubble</Text>
      <Text style={bubbleStyles.count}>{state.count}</Text>

      <View style={bubbleStyles.actions}>
        <Pressable onPress={decrement} style={[bubbleStyles.actionButton, bubbleStyles.negativeButton]}>
          <Text style={bubbleStyles.actionText}>-</Text>
        </Pressable>

        <Pressable onPress={increment} style={[bubbleStyles.actionButton, bubbleStyles.positiveButton]}>
          <Text style={bubbleStyles.actionText}>+</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => void openApp()} style={bubbleStyles.openButton}>
        <Text style={bubbleStyles.openText}>Open app</Text>
      </Pressable>

      <Pressable onPress={hide} style={bubbleStyles.hideButton}>
        <Text style={bubbleStyles.hideText}>Hide bubble</Text>
      </Pressable>
    </View>
  );
}

export default function App() {
  const [granted, setGranted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const bubbleState = useBubbleState();

  const refreshState = useCallback(() => {
    setGranted(canDrawOverlays());
    isBubbleVisible();
  }, []);

  useEffect(() => {
    setBubbleRenderer(StyledBubbleRenderer);
    refreshState();
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        refreshState();
      }
    });
    return () => {
      sub.remove();
      setBubbleRenderer(null);
    };
  }, [refreshState]);

  const handleRequestPermission = async () => {
    setLoading(true);
    try {
      await requestPermission();
      refreshState();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBubble = async () => {
    setLoading(true);
    try {
      if (bubbleState.isVisible) {
        hideBubble();
        return;
      }

      await showBubble();
    } finally {
      setLoading(false);
    }
  };

  const isGranted = granted === true;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Draw Over Apps Bubble</Text>

      <View style={[styles.badge, isGranted ? styles.badgeGranted : styles.badgeDenied]}>
        <Text style={styles.badgeText}>
          {granted === null ? 'Checking...' : isGranted ? 'Overlay permission granted' : 'Overlay permission needed'}
        </Text>
      </View>

      <Pressable
        style={[styles.primaryButton, isGranted && styles.secondaryButton]}
        disabled={isGranted || loading}
        onPress={() => void handleRequestPermission()}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? 'Working...' : isGranted ? 'Permission Granted' : 'Request Permission'}
        </Text>
      </Pressable>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Realtime Bubble Listener</Text>
        <Text style={styles.panelText}>Visible: {bubbleState.isVisible ? 'Yes' : 'No'}</Text>
        <Text style={styles.panelText}>Counter: {bubbleState.count}</Text>
        <Text style={styles.panelText}>Last changed by: {bubbleState.lastChangeSource}</Text>
        <Text style={styles.panelText}>Hold the bubble to remove it from the floating menu.</Text>

        <Pressable
          disabled={!isGranted || loading}
          onPress={() => void handleToggleBubble()}
          style={[styles.primaryButton, (!isGranted || loading) && styles.disabledButton]}
        >
          <Text style={styles.primaryButtonText}>{bubbleState.isVisible ? 'Hide Bubble' : 'Show Bubble'}</Text>
        </Pressable>

        <View style={styles.row}>
          <Pressable onPress={() => incrementBubbleCount('app')} style={[styles.smallButton, styles.blueButton]}>
            <Text style={styles.smallButtonText}>+1 In App</Text>
          </Pressable>

          <Pressable onPress={() => decrementBubbleCount('app')} style={[styles.smallButton, styles.amberButton]}>
            <Text style={styles.smallButtonText}>-1 In App</Text>
          </Pressable>

          <Pressable onPress={() => setBubbleCount(0)} style={[styles.smallButton, styles.slateButton]}>
            <Text style={styles.smallButtonText}>Reset</Text>
          </Pressable>
        </View>
      </View>

      {!isGranted && granted !== null && (
        <Text style={styles.hint}>
          Grant the overlay permission first, then show the bubble and drag it over other apps.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 22,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  badge: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  badgeGranted: {
    backgroundColor: '#d1fae5',
  },
  badgeDenied: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  primaryButton: {
    minWidth: 240,
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: '#2563eb',
  },
  secondaryButton: {
    backgroundColor: '#10b981',
  },
  disabledButton: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  panel: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    gap: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  panelTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0f172a',
  },
  panelText: {
    fontSize: 14,
    color: '#334155',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  smallButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  blueButton: {
    backgroundColor: '#2563eb',
  },
  amberButton: {
    backgroundColor: '#d97706',
  },
  slateButton: {
    backgroundColor: '#475569',
  },
  smallButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  hint: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 13,
    lineHeight: 20,
    maxWidth: 320,
  },
});

const bubbleStyles = StyleSheet.create({
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
