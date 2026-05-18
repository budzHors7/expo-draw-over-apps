import { Platform, Pressable, StyleSheet, Text as ReactNativeText, View } from 'react-native';
import { Box, Button, Column, Host, Row, Shape, Slider, Surface, Text } from '@expo/ui/jetpack-compose';
import {
  Shapes,
  align,
  animated,
  animateContentSize,
  background,
  clip,
  fillMaxWidth,
  graphicsLayer,
  height,
  paddingAll,
  size,
  spring,
  testID,
  weight,
} from '@expo/ui/jetpack-compose/modifiers';

import type { BubbleRendererProps } from 'expo-draw-over-apps';
import {
  RESIZE_BUBBLE_MAX_STEP,
  RESIZE_BUBBLE_MIN_STEP,
  getResizeBubbleStep,
  getResizeBubbleStepConfig,
} from './resizeBubbleSizing';

function NativeExpoUiResizeFallback({ state, setCount, hide }: BubbleRendererProps) {
  const activeStep = getResizeBubbleStep(state.count);
  const activeConfig = getResizeBubbleStepConfig(state.count);

  return (
    <View style={fallbackStyles.shell}>
      <View style={fallbackStyles.headerRow}>
        <ReactNativeText style={fallbackStyles.eyebrow}>Expo UI</ReactNativeText>
        <Pressable onPress={hide} style={fallbackStyles.hideButton}>
          <ReactNativeText style={fallbackStyles.hideText}>Hide</ReactNativeText>
        </Pressable>
      </View>
      <ReactNativeText style={fallbackStyles.title}>{activeConfig.label}</ReactNativeText>
      <ReactNativeText style={fallbackStyles.body}>Native Jetpack Compose UI is available on Android builds.</ReactNativeText>
      <View style={fallbackStyles.actionRow}>
        <Pressable
          onPress={() => setCount(RESIZE_BUBBLE_MIN_STEP)}
          style={[fallbackStyles.actionButton, activeStep === RESIZE_BUBBLE_MIN_STEP && fallbackStyles.actionButtonActive]}
        >
          <ReactNativeText
            style={[fallbackStyles.actionText, activeStep === RESIZE_BUBBLE_MIN_STEP && fallbackStyles.actionTextActive]}
          >
            Small
          </ReactNativeText>
        </Pressable>
        <Pressable
          onPress={() => setCount(RESIZE_BUBBLE_MAX_STEP)}
          style={[fallbackStyles.actionButton, activeStep === RESIZE_BUBBLE_MAX_STEP && fallbackStyles.actionButtonActive]}
        >
          <ReactNativeText
            style={[fallbackStyles.actionText, activeStep === RESIZE_BUBBLE_MAX_STEP && fallbackStyles.actionTextActive]}
          >
            Big
          </ReactNativeText>
        </Pressable>
      </View>
    </View>
  );
}

export function NativeExpoUiResizeBubbleRenderer(props: BubbleRendererProps) {
  const { state, setCount, hide } = props;
  const activeStep = getResizeBubbleStep(state.count);
  const activeConfig = getResizeBubbleStepConfig(state.count);
  const orbScale = 0.86 + activeStep * 0.1;
  const orbSize = Math.max(54, activeConfig.orbSize);

  if (Platform.OS !== 'android') {
    return <NativeExpoUiResizeFallback {...props} />;
  }

  return (
    <Host matchContents={{ horizontal: true, vertical: true }} colorScheme="dark" seedColor="#0891b2">
      <Surface
        color="#f8fafc"
        contentColor="#0f172a"
        shadowElevation={18}
        tonalElevation={4}
        shape={Shape.RoundedCorner({
          cornerRadii: {
            topStart: 34,
            topEnd: 14,
            bottomStart: 14,
            bottomEnd: 34,
          },
        })}
        modifiers={[
          size(activeConfig.dimension, activeConfig.height),
          animateContentSize(0.72, 520),
          testID('native-expo-ui-resize-bubble'),
        ]}
      >
        <Column horizontalAlignment="center" verticalArrangement={{ spacedBy: 8 }} modifiers={[paddingAll(14)]}>
          <Row horizontalArrangement="spaceBetween" verticalAlignment="center" modifiers={[fillMaxWidth()]}>
            <Column>
              <Text color="#0369a1" style={{ typography: 'labelSmall', fontWeight: '900' }}>
                Native Expo UI
              </Text>
              <Text color="#0f172a" style={{ typography: 'titleMedium', fontWeight: '900' }}>
                Resize
              </Text>
            </Column>
            <Button
              onClick={hide}
              colors={{ containerColor: '#e0f2fe', contentColor: '#0c4a6e' }}
              contentPadding={{ start: 12, top: 4, end: 12, bottom: 4 }}
            >
              <Text color="#0c4a6e" style={{ typography: 'labelSmall', fontWeight: '900' }}>
                Hide
              </Text>
            </Button>
          </Row>

          <Box
            contentAlignment="center"
            modifiers={[
              size(orbSize, orbSize),
              align('centerHorizontally'),
              clip(Shapes.Circle),
              background('#0891b2'),
              graphicsLayer({
                scaleX: animated(orbScale, spring({ dampingRatio: 0.72, stiffness: 520 })),
                scaleY: animated(orbScale, spring({ dampingRatio: 0.72, stiffness: 520 })),
                shadowElevation: animated(8 + activeStep * 4, spring({ dampingRatio: 0.72, stiffness: 520 })),
                clip: true,
                shape: Shapes.Circle,
              }),
            ]}
          >
            <Text color="#ecfeff" style={{ typography: 'headlineMedium', fontWeight: '900' }}>
              {activeConfig.shortLabel}
            </Text>
          </Box>

          <Text color="#334155" style={{ typography: 'labelMedium', fontWeight: '800' }}>
            {activeConfig.label}
          </Text>

          <Slider
            value={activeStep}
            min={RESIZE_BUBBLE_MIN_STEP}
            max={RESIZE_BUBBLE_MAX_STEP}
            steps={1}
            onValueChange={(nextValue) => setCount(getResizeBubbleStep(nextValue))}
            colors={{
              thumbColor: '#0891b2',
              activeTrackColor: '#0e7490',
              inactiveTrackColor: '#cbd5e1',
            }}
            modifiers={[fillMaxWidth(), height(40)]}
          />

          <Row horizontalArrangement={{ spacedBy: 8 }} verticalAlignment="center" modifiers={[fillMaxWidth()]}>
            <Button
              onClick={() => setCount(RESIZE_BUBBLE_MIN_STEP)}
              colors={{ containerColor: activeStep === RESIZE_BUBBLE_MIN_STEP ? '#155e75' : '#e2e8f0' }}
              contentPadding={{ start: 10, top: 6, end: 10, bottom: 6 }}
              modifiers={[weight(1)]}
            >
              <Text
                color={activeStep === RESIZE_BUBBLE_MIN_STEP ? '#ecfeff' : '#0f172a'}
                style={{ typography: 'labelSmall', fontWeight: '900' }}
              >
                Small
              </Text>
            </Button>
            <Button
              onClick={() => setCount(RESIZE_BUBBLE_MAX_STEP)}
              colors={{ containerColor: activeStep === RESIZE_BUBBLE_MAX_STEP ? '#155e75' : '#e2e8f0' }}
              contentPadding={{ start: 10, top: 6, end: 10, bottom: 6 }}
              modifiers={[weight(1)]}
            >
              <Text
                color={activeStep === RESIZE_BUBBLE_MAX_STEP ? '#ecfeff' : '#0f172a'}
                style={{ typography: 'labelSmall', fontWeight: '900' }}
              >
                Big
              </Text>
            </Button>
          </Row>
        </Column>
      </Surface>
    </Host>
  );
}

const fallbackStyles = StyleSheet.create({
  shell: {
    width: 196,
    minHeight: 186,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#0891b2',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  eyebrow: {
    color: '#0369a1',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  hideButton: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#e0f2fe',
  },
  hideText: {
    color: '#0c4a6e',
    fontSize: 11,
    fontWeight: '900',
  },
  title: {
    color: '#0f172a',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  body: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
  },
  actionButtonActive: {
    backgroundColor: '#155e75',
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
