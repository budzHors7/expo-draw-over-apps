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
      <View
        collapsable={false}
        testID="expo-draw-over-apps-window-content"
        style={styles.contentBoundary}
      >
        <BubbleRenderer
          bubbleId={bubbleId}
          state={bubbleState}
          close={close}
          hide={close}
          openApp={() => getExpoDrawOverAppsModule()?.openApp() ?? Promise.resolve(false)}
        />
      </View>
    );
  }

  return (
    <View
      collapsable={false}
      testID="expo-draw-over-apps-window-content"
      style={styles.contentBoundary}
    >
      <View style={styles.bubble}>
        <Text style={styles.guidance}>Register a bubble renderer to supply your window UI.</Text>
        <View style={styles.actions}>
          <Pressable
            onPress={() => {
              getExpoDrawOverAppsModule()?.openApp().catch(() => {});
            }}
            style={styles.action}
          >
            <Text style={styles.actionText}>Open app</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              if (bubbleId === DEFAULT_BUBBLE_ID) {
                getExpoDrawOverAppsModule()?.closeBubble();
              } else {
                getExpoDrawOverAppsModule()?.closeBubbleInstance(bubbleId);
              }
            }}
            style={styles.action}
          >
            <Text style={styles.actionText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentBoundary: {
    alignSelf: 'flex-start',
  },
  bubble: {
    maxWidth: 260,
    borderRadius: 16,
    padding: 12,
    gap: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  guidance: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  action: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  actionText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700',
  },
});
