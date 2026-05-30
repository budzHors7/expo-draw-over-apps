import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { NativeWindowContainer, type BubbleRendererProps } from 'expo-draw-over-apps';
import { setExampleBubbleCount, useExampleBubbleState } from '../state/bubbleExampleState';
import {
  RESIZE_BUBBLE_MAX_STEP,
  RESIZE_BUBBLE_MIN_STEP,
  getResizeBubbleStep,
  getResizeBubbleStepConfig,
} from './resizeBubbleSizing';

export function NativeExpoUiResizeBubbleRenderer({ bubbleId, close }: BubbleRendererProps) {
  const state = useExampleBubbleState(bubbleId);
  const isDark = useColorScheme() === 'dark';
  const activeStep = getResizeBubbleStep(state.count);
  const activeConfig = getResizeBubbleStepConfig(state.count);

  return (
    <NativeWindowContainer
      width={activeConfig.dimension}
      height={activeConfig.height}
      borderRadius={activeConfig.radius}
      seedColor="#0891b2"
      animationConfig={{ duration: 220 }}
      style={styles.shell}
      contentContainerStyle={styles.content}
      testID="native-expo-ui-resize-window"
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Native Expo UI</Text>
          <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}>Resize</Text>
        </View>
        <Pressable onPress={close} style={[styles.hideButton, isDark ? styles.hideButtonDark : styles.hideButtonLight]}>
          <Text style={[styles.hideText, isDark ? styles.hideTextDark : styles.hideTextLight]}>Close</Text>
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
            styles.actionButton,
            isDark ? styles.actionButtonDark : styles.actionButtonLight,
            activeStep === RESIZE_BUBBLE_MIN_STEP && styles.actionButtonActive,
          ]}
        >
          <Text style={[styles.actionText, isDark ? styles.actionTextDark : styles.actionTextLight, activeStep === RESIZE_BUBBLE_MIN_STEP && styles.actionTextActive]}>
            Small
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setExampleBubbleCount(RESIZE_BUBBLE_MAX_STEP, 'bubble', bubbleId)}
          style={[
            styles.actionButton,
            isDark ? styles.actionButtonDark : styles.actionButtonLight,
            activeStep === RESIZE_BUBBLE_MAX_STEP && styles.actionButtonActive,
          ]}
        >
          <Text style={[styles.actionText, isDark ? styles.actionTextDark : styles.actionTextLight, activeStep === RESIZE_BUBBLE_MAX_STEP && styles.actionTextActive]}>
            Big
          </Text>
        </Pressable>
      </View>
    </NativeWindowContainer>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#0891b2',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 18,
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
    color: '#0369a1',
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
    color: '#f8fafc',
  },
  titleLight: {
    color: '#0f172a',
  },
  hideButton: {
    minWidth: 44,
    minHeight: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hideButtonDark: {
    backgroundColor: '#164e63',
  },
  hideButtonLight: {
    backgroundColor: '#e0f2fe',
  },
  hideText: {
    fontSize: 11,
    fontWeight: '900',
  },
  hideTextDark: {
    color: '#ecfeff',
  },
  hideTextLight: {
    color: '#0c4a6e',
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
    backgroundColor: '#0891b2',
    borderWidth: 2,
    borderColor: '#cffafe',
  },
  orbLabel: {
    color: '#ecfeff',
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
    color: '#334155',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minHeight: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionButtonDark: {
    backgroundColor: '#1f2937',
    borderColor: '#334155',
  },
  actionButtonLight: {
    backgroundColor: '#e2e8f0',
    borderColor: '#cbd5e1',
  },
  actionButtonActive: {
    backgroundColor: '#155e75',
    borderColor: '#22d3ee',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '900',
  },
  actionTextDark: {
    color: '#f8fafc',
  },
  actionTextLight: {
    color: '#0f172a',
  },
  actionTextActive: {
    color: '#ecfeff',
  },
});
