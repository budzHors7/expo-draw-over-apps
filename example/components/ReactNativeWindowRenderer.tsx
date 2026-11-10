import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  ReactNativeWindow,
  showBubble,
  type BubbleRendererProps,
} from 'expo-draw-over-apps';
import { setExampleBubbleCount, useExampleBubbleState } from '../state/bubbleExampleState';
import {
  RESIZE_BUBBLE_MAX_STEP,
  RESIZE_BUBBLE_MIN_STEP,
  getResizeBubbleStep,
  getResizeBubbleStepConfig,
} from './resizeBubbleSizing';

const REPOSITION_X = 240;
const REPOSITION_Y = 120;

export function ReactNativeWindowRenderer({ bubbleId, close }: BubbleRendererProps) {
  const state = useExampleBubbleState(bubbleId);
  const activeStep = getResizeBubbleStep(state.count);
  const activeConfig = getResizeBubbleStepConfig(state.count);
  const nextStep =
    activeStep === RESIZE_BUBBLE_MAX_STEP
      ? RESIZE_BUBBLE_MIN_STEP
      : RESIZE_BUBBLE_MAX_STEP;

  return (
    <ReactNativeWindow
      width={activeConfig.dimension}
      height={activeConfig.height}
      borderRadius={activeConfig.radius}
      animationConfig={{ duration: 220 }}
      backgroundColor="#0f172a"
      style={styles.window}
      contentContainerStyle={styles.content}
      testID="react-native-window"
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>React Native Window</Text>
        <Pressable onPress={close} style={styles.closeButton}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>

      <View style={styles.valueStage}>
        <Text style={styles.value}>{activeConfig.shortLabel}</Text>
        <Text style={styles.valueCaption}>{activeConfig.label} size</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => setExampleBubbleCount(nextStep, 'bubble', bubbleId)}
          style={styles.actionButton}
        >
          <Text style={styles.actionText}>Resize</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            void showBubble(bubbleId, { x: REPOSITION_X, y: REPOSITION_Y });
          }}
          style={styles.actionButton}
        >
          <Text style={styles.actionText}>Move</Text>
        </Pressable>
      </View>
    </ReactNativeWindow>
  );
}

const styles = StyleSheet.create({
  window: {
    borderWidth: 2,
    borderColor: '#38bdf8',
    padding: 14,
    elevation: 18,
  },
  content: {
    flex: 1,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  eyebrow: {
    flex: 1,
    color: '#7dd3fc',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  closeButton: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
    backgroundColor: '#1e293b',
  },
  closeText: {
    color: '#f8fafc',
    fontSize: 10,
    fontWeight: '800',
  },
  valueStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    color: '#f8fafc',
    fontSize: 36,
    fontWeight: '900',
  },
  valueCaption: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#0369a1',
  },
  actionText: {
    color: '#f8fafc',
    fontSize: 11,
    fontWeight: '900',
  },
});
