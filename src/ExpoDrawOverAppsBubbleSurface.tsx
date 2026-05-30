import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getExpoDrawOverAppsModule } from './ExpoDrawOverAppsModule';
import { useBubbleState } from './bubbleState';
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
    const close = () =>
      (bubbleId === DEFAULT_BUBBLE_ID
        ? getExpoDrawOverAppsModule()?.closeBubble()
        : getExpoDrawOverAppsModule()?.closeBubbleInstance(bubbleId)) ?? false;

    return (
      <BubbleRenderer
        bubbleId={bubbleId}
        state={bubbleState}
        close={close}
        hide={close}
        openApp={() => getExpoDrawOverAppsModule()?.openApp() ?? Promise.resolve(false)}
      />
    );
  }

  return (
    <View style={styles.bubble}>
      <Text style={styles.caption}>Floating Bubble</Text>
      <View style={styles.debugBadge}>
        <Text style={styles.debugBadgeText}>ID: {bubbleId}</Text>
      </View>
      <Text style={styles.bodyText}>Register a custom renderer to add your own controls.</Text>
      <Pressable
        onPress={() => {
          getExpoDrawOverAppsModule()?.openApp().catch(() => {});
        }}
        style={styles.openAppButton}
      >
        <Text style={styles.openAppText}>Open app</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          if (bubbleId === DEFAULT_BUBBLE_ID) {
            getExpoDrawOverAppsModule()?.closeBubble();
          } else {
            getExpoDrawOverAppsModule()?.closeBubbleInstance(bubbleId);
          }
        }}
        style={styles.closeButton}
      >
        <Text style={styles.closeText}>Close</Text>
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
  bodyText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    textAlign: 'center',
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
  closeButton: {
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  closeText: {
    color: '#f8fafc',
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
