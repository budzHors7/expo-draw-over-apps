import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, AppStateStatus, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import {
  canDrawOverlays,
  decrementBubbleCount,
  hideBubble,
  incrementBubbleCount,
  isBubbleVisible,
  requestPermission,
  setBubbleCount,
  setEdgeHideEnabled as setBubbleEdgeHideEnabled,
  setBubbleRenderer,
  setBubbleRendererForBubble,
  showBubble,
  useAllBubbleStates,
  useBubbleState,
} from 'expo-draw-over-apps';
import {
  CountdownTimerBubbleRenderer,
  JetpackComposeBubbleRenderer,
  ReactNativeBubbleRenderer,
  TIMER_DURATION_SECONDS,
} from './components';
import { hideAsync, preventAutoHideAsync, setOptions } from 'expo-splash-screen';

// Set the animation options. This is optional.
setOptions({
  duration: 200,
  fade: true,
});

// Keep the splash screen visible while we fetch resources
preventAutoHideAsync();

type BubbleExampleId = 'react-native-counter' | 'jetpack-compose-counter' | 'countdown-timer';

const EXAMPLE_BUBBLE_IDS: BubbleExampleId[] = ['react-native-counter', 'jetpack-compose-counter', 'countdown-timer'];

const BUBBLE_EXAMPLE_LABELS: Record<BubbleExampleId, { title: string; description: string }> = {
  'react-native-counter': {
    title: 'React Native Counter Bubble',
    description: 'Counter bubble rendered with React Native views and Pressables.',
  },
  'jetpack-compose-counter': {
    title: 'Jetpack Compose Counter Bubble',
    description: 'Counter bubble rendered with native Android Compose UI via expo-ui.',
  },
  'countdown-timer': {
    title: 'Countdown Timer Bubble',
    description: 'A timer example that refreshes every second without moving the bubble.',
  },
};

export default function App() {
  const [granted, setGranted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeExample, setActiveExample] = useState<BubbleExampleId>('react-native-counter');
  const [edgeHideEnabled, setEdgeHideEnabledState] = useState(true);
  const activeBubbleState = useBubbleState(activeExample);
  const allBubbleStates = useAllBubbleStates();

  const refreshState = useCallback(() => {
    setGranted(canDrawOverlays());
    EXAMPLE_BUBBLE_IDS.forEach((bubbleId) => {
      isBubbleVisible(bubbleId);
    });
  }, []);

  useEffect(() => {
    setBubbleRendererForBubble('react-native-counter', ReactNativeBubbleRenderer);
    setBubbleRendererForBubble('jetpack-compose-counter', JetpackComposeBubbleRenderer);
    setBubbleRendererForBubble('countdown-timer', CountdownTimerBubbleRenderer);
    refreshState();
    void hideAsync().catch(() => {
      // Ignore splash hide races during fast refresh/dev reloads.
    });

    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        refreshState();
      }
    });

    return () => {
      sub.remove();
      EXAMPLE_BUBBLE_IDS.forEach((bubbleId) => {
        setBubbleRendererForBubble(bubbleId, null);
      });
      setBubbleRenderer(null);
    };
  }, [refreshState]);

  const visibleStates = useMemo(
    () =>
      EXAMPLE_BUBBLE_IDS.map((bubbleId) => {
        const state = allBubbleStates.find((entry) => entry.bubbleId === bubbleId) ?? {
          bubbleId,
          count: bubbleId === 'countdown-timer' ? TIMER_DURATION_SECONDS : 0,
          isVisible: false,
          lastUpdatedAt: Date.now(),
          lastChangeSource: 'app' as const,
        };

        return {
          bubbleId,
          state,
          meta: BUBBLE_EXAMPLE_LABELS[bubbleId],
        };
      }),
    [allBubbleStates]
  );

  const handleRequestPermission = async () => {
    setLoading(true);
    try {
      await requestPermission();
      refreshState();
    } finally {
      setLoading(false);
    }
  };

  const handleShowExample = async (exampleId: BubbleExampleId) => {
    setLoading(true);
    try {
      setActiveExample(exampleId);
      if (exampleId === 'countdown-timer') {
        setBubbleCount(TIMER_DURATION_SECONDS, 'bubble', exampleId);
      }
      await showBubble(exampleId, { edgeHideEnabled });
    } finally {
      setLoading(false);
    }
  };

  const handleHideBubble = () => {
    hideBubble(activeExample);
  };

  const isGranted = granted === true;
  const activeExampleMeta = BUBBLE_EXAMPLE_LABELS[activeExample];
  const visibleBubbleCount = visibleStates.filter(({ state }) => state.isVisible).length;
  const activeControls =
    activeExample === 'countdown-timer'
      ? [
          {
            label: 'Restart',
            onPress: () => setBubbleCount(TIMER_DURATION_SECONDS, 'app', activeExample),
            style: styles.blueButton,
          },
          {
            label: '10 Seconds',
            onPress: () => setBubbleCount(10, 'app', activeExample),
            style: styles.amberButton,
          },
          {
            label: 'Stop',
            onPress: () => setBubbleCount(0, 'app', activeExample),
            style: styles.slateButton,
          },
        ]
      : [
          {
            label: '+1 In App',
            onPress: () => incrementBubbleCount('app', activeExample),
            style: styles.blueButton,
          },
          {
            label: '-1 In App',
            onPress: () => decrementBubbleCount('app', activeExample),
            style: styles.amberButton,
          },
          {
            label: 'Reset',
            onPress: () => setBubbleCount(0, 'app', activeExample),
            style: styles.slateButton,
          },
        ];

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <Text style={styles.eyebrow}>Expo Draw Over Apps</Text>
            <Text style={styles.title}>Bubble Playground</Text>
            <Text style={styles.subtitle}>
              Test overlay permission, launch different bubble renderers, and control the active bubble without the UI
              collapsing on smaller screens.
            </Text>
          </View>

          <View style={[styles.badge, isGranted ? styles.badgeGranted : styles.badgeDenied]}>
            <Text style={styles.badgeText}>
              {granted === null ? 'Checking permission' : isGranted ? 'Overlay permission granted' : 'Overlay permission needed'}
            </Text>
          </View>

          <Pressable
            style={[styles.primaryButton, isGranted && styles.secondaryButton, (isGranted || loading) && styles.disabledButton]}
            disabled={isGranted || loading}
            onPress={() => void handleRequestPermission()}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Working...' : isGranted ? 'Permission Granted' : 'Request Permission'}
            </Text>
          </Pressable>

          {!isGranted && granted !== null && (
            <Text style={styles.hint}>
              Grant the overlay permission first, then launch one of the examples below.
            </Text>
          )}
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Visible bubbles</Text>
            <Text style={styles.metricValue}>{visibleBubbleCount}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Active bubble</Text>
            <Text style={styles.metricValueSmall}>{activeBubbleState.isVisible ? 'Visible' : 'Hidden'}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Active value</Text>
            <Text style={styles.metricValue}>{activeBubbleState.count}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Examples</Text>
          <Text style={styles.sectionText}>
            Tap a card to make it active. Use the launch button inside each card to show that bubble.
          </Text>

          <View style={styles.exampleGrid}>
            {visibleStates.map(({ bubbleId, meta, state }) => {
              const isActiveCard = bubbleId === activeExample;
              const toneStyle =
                bubbleId === 'react-native-counter'
                  ? styles.reactNativeExampleButton
                  : bubbleId === 'jetpack-compose-counter'
                    ? styles.composeExampleButton
                    : styles.timerExampleButton;

              return (
                <Pressable
                  key={bubbleId}
                  onPress={() => setActiveExample(bubbleId)}
                  style={[styles.exampleCard, isActiveCard && styles.exampleCardActive]}
                >
                  <View style={styles.exampleCardHeader}>
                    <View style={[styles.exampleAccent, toneStyle]} />
                    <View style={styles.exampleCardCopy}>
                      <Text style={styles.exampleCardTitle}>{meta.title}</Text>
                      <Text style={styles.exampleCardDescription}>{meta.description}</Text>
                    </View>
                  </View>

                  <View style={styles.statusPillsRow}>
                    <View style={[styles.statusPill, state.isVisible ? styles.statusPillVisible : styles.statusPillHidden]}>
                      <Text style={styles.statusPillText}>{state.isVisible ? 'Visible' : 'Hidden'}</Text>
                    </View>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusPillText}>Value {state.count}</Text>
                    </View>
                  </View>

                  <Pressable
                    disabled={!isGranted || loading}
                    onPress={() => void handleShowExample(bubbleId)}
                    style={[styles.launchButton, toneStyle, (!isGranted || loading) && styles.disabledButton]}
                  >
                    <Text style={styles.launchButtonText}>Show Bubble</Text>
                  </Pressable>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Bubble</Text>
          <Text style={styles.activeTitle}>{activeExampleMeta.title}</Text>
          <Text style={styles.sectionText}>{activeExampleMeta.description}</Text>
          <Text style={styles.helperText}>Hold any visible bubble to open the remove menu.</Text>
          <Text style={styles.helperText}>
            Edge hide is currently {edgeHideEnabled ? 'enabled' : 'disabled'} for newly shown bubbles.
          </Text>

          <View style={styles.activeSummaryCard}>
            <Text style={styles.activeSummaryLabel}>Bubble ID</Text>
            <Text style={styles.activeSummaryValue}>{activeBubbleState.bubbleId}</Text>
            <Text style={styles.activeSummaryMeta}>
              {activeBubbleState.isVisible ? 'Visible on screen' : 'Currently hidden'} | Last source:{' '}
              {activeBubbleState.lastChangeSource}
            </Text>
          </View>

          <Pressable
            disabled={!activeBubbleState.isVisible || loading}
            onPress={handleHideBubble}
            style={[styles.primaryButton, styles.hideBubbleButton, (!activeBubbleState.isVisible || loading) && styles.disabledButton]}
          >
            <Text style={styles.primaryButtonText}>Hide Active Bubble</Text>
          </Pressable>

          <View style={styles.controlsWrap}>
            <Pressable
              onPress={() => {
                const nextValue = !edgeHideEnabled;
                setBubbleEdgeHideEnabled(nextValue, activeExample);
                setEdgeHideEnabledState(nextValue);
              }}
              style={[styles.controlButton, edgeHideEnabled ? styles.tealButton : styles.slateButton]}
            >
              <Text style={styles.smallButtonText}>{edgeHideEnabled ? 'Disable Edge Hide' : 'Enable Edge Hide'}</Text>
            </Pressable>
            {activeControls.map((control) => (
              <Pressable key={control.label} onPress={control.onPress} style={[styles.controlButton, control.style]}>
                <Text style={styles.smallButtonText}>{control.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eef2ff',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 18) : 18,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 32,
    gap: 18,
  },
  heroCard: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: '#0f172a',
    gap: 16,
    shadowColor: '#020617',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 10,
  },
  heroHeader: {
    gap: 8,
  },
  eyebrow: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#cbd5e1',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  badgeGranted: {
    backgroundColor: '#d1fae5',
  },
  badgeDenied: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  primaryButton: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 20,
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
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minHeight: 92,
    borderRadius: 22,
    padding: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  metricLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    color: '#0f172a',
    fontSize: 28,
    fontWeight: '800',
  },
  metricValueSmall: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '800',
  },
  section: {
    borderRadius: 26,
    padding: 18,
    gap: 14,
    backgroundColor: '#ffffff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#334155',
  },
  helperText: {
    fontSize: 13,
    color: '#64748b',
  },
  exampleGrid: {
    gap: 12,
  },
  exampleCard: {
    borderRadius: 22,
    padding: 16,
    gap: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  exampleCardActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  exampleCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  exampleAccent: {
    width: 12,
    height: 48,
    borderRadius: 999,
  },
  exampleCardCopy: {
    flex: 1,
    gap: 6,
  },
  exampleCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  exampleCardDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
  statusPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#e2e8f0',
  },
  statusPillVisible: {
    backgroundColor: '#dcfce7',
  },
  statusPillHidden: {
    backgroundColor: '#fee2e2',
  },
  statusPillText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700',
  },
  launchButton: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  launchButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  activeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  activeSummaryCard: {
    borderRadius: 20,
    padding: 16,
    gap: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeSummaryLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeSummaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  activeSummaryMeta: {
    fontSize: 13,
    color: '#475569',
  },
  hideBubbleButton: {
    backgroundColor: '#475569',
  },
  controlsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  controlButton: {
    minWidth: '30%',
    flexGrow: 1,
    alignItems: 'center',
    borderRadius: 16,
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
  tealButton: {
    backgroundColor: '#0f766e',
  },
  smallButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  hint: {
    fontSize: 13,
    lineHeight: 20,
    color: '#cbd5e1',
  },
  reactNativeExampleButton: {
    backgroundColor: '#0f766e',
  },
  composeExampleButton: {
    backgroundColor: '#0369a1',
  },
  timerExampleButton: {
    backgroundColor: '#b45309',
  },
});
