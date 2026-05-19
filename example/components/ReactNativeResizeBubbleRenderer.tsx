import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ReactNativeWindowContainer, type BubbleRendererProps } from 'expo-draw-over-apps';
import {
  RESIZE_BUBBLE_MAX_STEP,
  RESIZE_BUBBLE_MIN_STEP,
  getResizeBubbleStep,
  getResizeBubbleStepConfig,
} from './resizeBubbleSizing';

export function ReactNativeResizeBubbleRenderer({ state, setCount, hide }: BubbleRendererProps) {
  const activeStep = getResizeBubbleStep(state.count);
  const activeConfig = getResizeBubbleStepConfig(state.count);

  return (
    <ReactNativeWindowContainer
      width={activeConfig.dimension}
      height={activeConfig.height}
      borderRadius={activeConfig.radius}
      backgroundColor="#101820"
      animationConfig={{ duration: 220 }}
      style={styles.shell}
      contentContainerStyle={styles.content}
      testID="react-native-resize-window"
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>React Native</Text>
          <Text style={styles.title}>Resize</Text>
        </View>
        <Pressable onPress={hide} style={styles.closeButton}>
          <Text style={styles.closeText}>x</Text>
        </Pressable>
      </View>

      <View style={styles.stage}>
        <View
          style={[
            styles.orb,
            {
              width: activeConfig.orbSize,
              height: activeConfig.orbSize,
              borderRadius: activeConfig.orbSize / 2,
            },
          ]}
        >
          <Text style={styles.orbLabel}>{activeConfig.shortLabel}</Text>
        </View>
        <Text style={styles.sizeLabel}>{activeConfig.label}</Text>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          onPress={() => setCount(RESIZE_BUBBLE_MIN_STEP)}
          style={[styles.sizeButton, activeStep === RESIZE_BUBBLE_MIN_STEP && styles.sizeButtonActive]}
        >
          <Text style={styles.sizeButtonText}>Small</Text>
        </Pressable>
        <Pressable
          onPress={() => setCount(RESIZE_BUBBLE_MAX_STEP)}
          style={[styles.sizeButton, activeStep === RESIZE_BUBBLE_MAX_STEP && styles.sizeButtonActive]}
        >
          <Text style={styles.sizeButtonText}>Big</Text>
        </Pressable>
      </View>
    </ReactNativeWindowContainer>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#fb7185',
    shadowColor: '#030712',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.32,
    shadowRadius: 26,
    elevation: 20,
  },
  content: {
    flex: 1,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  eyebrow: {
    color: '#5eead4',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#fff1f2',
    fontSize: 18,
    fontWeight: '900',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#24303a',
  },
  closeText: {
    color: '#fff1f2',
    fontSize: 14,
    fontWeight: '900',
    marginTop: -1,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  orb: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fb7185',
    borderWidth: 2,
    borderColor: '#fecdd3',
  },
  orbLabel: {
    color: '#101820',
    fontSize: 22,
    fontWeight: '900',
  },
  sizeLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeButton: {
    flex: 1,
    minHeight: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#334155',
  },
  sizeButtonActive: {
    backgroundColor: '#0f766e',
    borderColor: '#5eead4',
  },
  sizeButtonText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '900',
  },
});
