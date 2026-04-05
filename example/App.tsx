import { useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  canDrawOverlays,
  hideBubble,
  incrementBubbleCount,
  isBubbleVisible,
  requestPermission,
  setBubbleCount,
  showBubble,
  useBubbleState,
} from 'expo-draw-over-apps';

export default function App() {
  const [granted, setGranted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [bubbleVisible, setBubbleVisibleState] = useState(false);
  const bubbleState = useBubbleState();

  const refreshState = useCallback(() => {
    setGranted(canDrawOverlays());
    setBubbleVisibleState(isBubbleVisible());
  }, []);

  useEffect(() => {
    refreshState();
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        refreshState();
      }
    });
    return () => sub.remove();
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
      if (bubbleVisible) {
        hideBubble();
        setBubbleVisibleState(false);
        return;
      }

      const didShow = await showBubble();
      setBubbleVisibleState(didShow);
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
        <Text style={styles.panelText}>Visible: {bubbleVisible ? 'Yes' : 'No'}</Text>
        <Text style={styles.panelText}>Counter: {bubbleState.count}</Text>
        <Text style={styles.panelText}>Last changed by: {bubbleState.lastChangeSource}</Text>

        <Pressable
          disabled={!isGranted || loading}
          onPress={() => void handleToggleBubble()}
          style={[styles.primaryButton, (!isGranted || loading) && styles.disabledButton]}
        >
          <Text style={styles.primaryButtonText}>{bubbleVisible ? 'Hide Bubble' : 'Show Bubble'}</Text>
        </Pressable>

        <View style={styles.row}>
          <Pressable onPress={() => incrementBubbleCount('app')} style={[styles.smallButton, styles.blueButton]}>
            <Text style={styles.smallButtonText}>+1 In App</Text>
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
