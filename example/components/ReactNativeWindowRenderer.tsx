import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ReactNativeWindow, type BubbleRendererProps } from 'expo-draw-over-apps';
import { setExampleBubbleCount, useExampleBubbleState } from '../state/bubbleExampleState';
import {
  RESIZE_BUBBLE_MAX_STEP,
  RESIZE_BUBBLE_MIN_STEP,
  getResizeBubbleStepConfig,
} from './resizeBubbleSizing';

export function ReactNativeWindowRenderer({ bubbleId, close, openApp }: BubbleRendererProps) {
  const state = useExampleBubbleState(bubbleId);
  const size = getResizeBubbleStepConfig(state.count);

  return (
    <ReactNativeWindow
      width={size.dimension}
      height={size.height}
      borderRadius={size.radius}
      backgroundColor="#111827"
      animationConfig={{ duration: 220 }}
      contentContainerStyle={styles.content}
      testID="react-native-window"
    >
      <Text style={styles.eyebrow}>React Native Window</Text>
      <Text style={styles.title}>{size.label}</Text>
      <View style={styles.actions}>
        <Pressable
          onPress={() => setExampleBubbleCount(RESIZE_BUBBLE_MIN_STEP, 'bubble', bubbleId)}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Small</Text>
        </Pressable>
        <Pressable
          onPress={() => setExampleBubbleCount(RESIZE_BUBBLE_MAX_STEP, 'bubble', bubbleId)}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Big</Text>
        </Pressable>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={() => void openApp()} style={styles.secondaryButton}>
          <Text style={styles.buttonText}>Open app</Text>
        </Pressable>
        <Pressable onPress={close} style={styles.secondaryButton}>
          <Text style={styles.buttonText}>Close</Text>
        </Pressable>
      </View>
    </ReactNativeWindow>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  },
  eyebrow: {
    color: '#5eead4',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '900',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    padding: 10,
    backgroundColor: '#0f766e',
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    padding: 10,
    backgroundColor: '#334155',
  },
  buttonText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '800',
  },
});
