import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ExpoDrawOverAppsNativeWindowContainer, type BubbleRendererProps } from 'expo-draw-over-apps';
import {
  RESIZE_BUBBLE_MAX_STEP,
  RESIZE_BUBBLE_MIN_STEP,
  getResizeBubbleStep,
  getResizeBubbleStepConfig,
} from './resizeBubbleSizing';

export function NativeExpoUiResizeBubbleRenderer({ state, setCount, hide }: BubbleRendererProps) {
  const activeStep = getResizeBubbleStep(state.count);
  const activeConfig = getResizeBubbleStepConfig(state.count);

  return (
    <ExpoDrawOverAppsNativeWindowContainer
      width={activeConfig.dimension}
      height={activeConfig.height}
      borderRadius={activeConfig.radius}
      backgroundColor="#f8fafc"
      surfaceColor="#f8fafc"
      colorScheme="light"
      seedColor="#0891b2"
      animationConfig={{ duration: 220 }}
      style={styles.shell}
      contentContainerStyle={styles.content}
      testID="native-expo-ui-resize-window"
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Native Expo UI</Text>
          <Text style={styles.title}>Resize</Text>
        </View>
        <Pressable onPress={hide} style={styles.hideButton}>
          <Text style={styles.hideText}>Hide</Text>
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
          style={[styles.actionButton, activeStep === RESIZE_BUBBLE_MIN_STEP && styles.actionButtonActive]}
        >
          <Text style={[styles.actionText, activeStep === RESIZE_BUBBLE_MIN_STEP && styles.actionTextActive]}>
            Small
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setCount(RESIZE_BUBBLE_MAX_STEP)}
          style={[styles.actionButton, activeStep === RESIZE_BUBBLE_MAX_STEP && styles.actionButtonActive]}
        >
          <Text style={[styles.actionText, activeStep === RESIZE_BUBBLE_MAX_STEP && styles.actionTextActive]}>
            Big
          </Text>
        </Pressable>
      </View>
    </ExpoDrawOverAppsNativeWindowContainer>
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
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '900',
  },
  hideButton: {
    minWidth: 44,
    minHeight: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0f2fe',
  },
  hideText: {
    color: '#0c4a6e',
    fontSize: 11,
    fontWeight: '900',
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
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
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
    backgroundColor: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  actionButtonActive: {
    backgroundColor: '#155e75',
    borderColor: '#22d3ee',
  },
  actionText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '900',
  },
  actionTextActive: {
    color: '#ecfeff',
  },
});
