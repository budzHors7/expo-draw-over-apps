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
    <View style={styles.setupNotice}>
      <Text style={styles.guidance}>
        Register a bubble renderer with setBubbleRenderer or setBubbleRendererForBubble.
      </Text>
      <View style={styles.actions}>
        <Pressable
          onPress={() => {
            getExpoDrawOverAppsModule()?.openApp().catch(() => {});
          }}
          style={styles.action}
        >
          <Text>Open app</Text>
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
          <Text>Close</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  setupNotice: {
    width: 240,
    padding: 12,
    gap: 12,
    backgroundColor: '#ffffff',
  },
  guidance: {
    color: '#111827',
    fontSize: 12,
    lineHeight: 17,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  action: {
    padding: 8,
  },
});
