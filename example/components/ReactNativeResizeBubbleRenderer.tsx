import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { ReactNativeWindowContainer, type BubbleRendererProps } from 'expo-draw-over-apps';
import { setExampleBubbleCount, useExampleBubbleState } from '../state/bubbleExampleState';
import {
  RESIZE_BUBBLE_MAX_STEP,
  RESIZE_BUBBLE_MIN_STEP,
  getResizeBubbleStep,
  getResizeBubbleStepConfig,
} from './resizeBubbleSizing';

export function ReactNativeResizeBubbleRenderer({ bubbleId, close }: BubbleRendererProps) {
  const state = useExampleBubbleState(bubbleId);
  const isDark = useColorScheme() === 'dark';
  const activeStep = getResizeBubbleStep(state.count);
  const activeConfig = getResizeBubbleStepConfig(state.count);

  return (
    <ReactNativeWindowContainer
      width={activeConfig.dimension}
      height={activeConfig.height}
      borderRadius={activeConfig.radius}
      animationConfig={{ duration: 220 }}
      style={styles.shell}
      contentContainerStyle={styles.content}
      testID="react-native-resize-window"
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>React Native</Text>
          <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}>Resize</Text>
        </View>
        <Pressable onPress={close} style={[styles.closeButton, isDark ? styles.closeButtonDark : styles.closeButtonLight]}>
          <Text style={[styles.closeText, isDark ? styles.closeTextDark : styles.closeTextLight]}>x</Text>
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
        <Text style={[styles.sizeLabel, isDark ? styles.sizeLabelDark : styles.sizeLabelLight]}>
          {activeConfig.label}
        </Text>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          onPress={() => setExampleBubbleCount(RESIZE_BUBBLE_MIN_STEP, 'bubble', bubbleId)}
          style={[
            styles.sizeButton,
            isDark ? styles.sizeButtonDark : styles.sizeButtonLight,
            activeStep === RESIZE_BUBBLE_MIN_STEP && styles.sizeButtonActive,
          ]}
        >
          <Text style={[
            styles.sizeButtonText,
            isDark ? styles.sizeButtonTextDark : styles.sizeButtonTextLight,
            activeStep === RESIZE_BUBBLE_MIN_STEP && styles.sizeButtonTextActive,
          ]}>
            Small
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setExampleBubbleCount(RESIZE_BUBBLE_MAX_STEP, 'bubble', bubbleId)}
          style={[
            styles.sizeButton,
            isDark ? styles.sizeButtonDark : styles.sizeButtonLight,
            activeStep === RESIZE_BUBBLE_MAX_STEP && styles.sizeButtonActive,
          ]}
        >
          <Text style={[
            styles.sizeButtonText,
            isDark ? styles.sizeButtonTextDark : styles.sizeButtonTextLight,
            activeStep === RESIZE_BUBBLE_MAX_STEP && styles.sizeButtonTextActive,
          ]}>
            Big
          </Text>
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
    fontSize: 18,
    fontWeight: '900',
  },
  titleDark: {
    color: '#fff1f2',
  },
  titleLight: {
    color: '#111827',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonDark: {
    backgroundColor: '#24303a',
  },
  closeButtonLight: {
    backgroundColor: '#ffe4e6',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: -1,
  },
  closeTextDark: {
    color: '#fff1f2',
  },
  closeTextLight: {
    color: '#9f1239',
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
    fontSize: 12,
    fontWeight: '800',
  },
  sizeLabelDark: {
    color: '#cbd5e1',
  },
  sizeLabelLight: {
    color: '#475569',
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
    borderWidth: 1,
  },
  sizeButtonDark: {
    backgroundColor: '#1f2937',
    borderColor: '#334155',
  },
  sizeButtonLight: {
    backgroundColor: '#e2e8f0',
    borderColor: '#cbd5e1',
  },
  sizeButtonActive: {
    backgroundColor: '#0f766e',
    borderColor: '#5eead4',
  },
  sizeButtonText: {
    fontSize: 12,
    fontWeight: '900',
  },
  sizeButtonTextDark: {
    color: '#f8fafc',
  },
  sizeButtonTextLight: {
    color: '#111827',
  },
  sizeButtonTextActive: {
    color: '#f8fafc',
  },
});
