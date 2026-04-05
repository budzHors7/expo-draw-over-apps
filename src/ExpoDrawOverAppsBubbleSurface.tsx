import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  PanResponderGestureState,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { getExpoDrawOverAppsModule } from './ExpoDrawOverAppsModule';
import { incrementBubbleCount, useBubbleState } from './bubbleState';

const BUBBLE_WIDTH = 140;
const BUBBLE_HEIGHT = 112;
const EDGE_PADDING = 20;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export default function ExpoDrawOverAppsBubbleSurface() {
  const { width, height } = useWindowDimensions();
  const bubbleState = useBubbleState();
  const [bubbleSize, setBubbleSize] = useState({ width: BUBBLE_WIDTH, height: BUBBLE_HEIGHT });
  const dragStart = useRef({ x: Math.max(width - BUBBLE_WIDTH - EDGE_PADDING, EDGE_PADDING), y: 140 });
  const translate = useRef(new Animated.ValueXY(dragStart.current)).current;

  const clampPosition = (nextX: number, nextY: number) => {
    return {
      x: clamp(nextX, EDGE_PADDING, Math.max(EDGE_PADDING, width - bubbleSize.width - EDGE_PADDING)),
      y: clamp(nextY, EDGE_PADDING, Math.max(EDGE_PADDING, height - bubbleSize.height - EDGE_PADDING)),
    };
  };

  const syncToPoint = (gestureState: PanResponderGestureState) => {
    const nextPoint = clampPosition(
      dragStart.current.x + gestureState.dx,
      dragStart.current.y + gestureState.dy
    );
    translate.setValue(nextPoint);
    return nextPoint;
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3,
        onPanResponderGrant: () => {
          translate.stopAnimation((value: { x: number; y: number }) => {
            dragStart.current = value;
          });
        },
        onPanResponderMove: (_, gestureState) => {
          syncToPoint(gestureState);
        },
        onPanResponderRelease: (_, gestureState) => {
          dragStart.current = syncToPoint(gestureState);
        },
        onPanResponderTerminate: (_, gestureState) => {
          dragStart.current = syncToPoint(gestureState);
        },
      }),
    [bubbleSize.height, bubbleSize.width, height, translate, width]
  );

  if (!bubbleState.isVisible) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <Animated.View
        {...panResponder.panHandlers}
        onLayout={(event) => {
          setBubbleSize(event.nativeEvent.layout);
        }}
        style={[
          styles.bubble,
          {
            transform: [{ translateX: translate.x }, { translateY: translate.y }],
          },
        ]}
      >
        <Text style={styles.caption}>Bubble Counter</Text>
        <Pressable onPress={() => incrementBubbleCount('bubble')} style={styles.counterButton}>
          <Text style={styles.counterValue}>{bubbleState.count}</Text>
          <Text style={styles.counterHint}>Tap to add</Text>
        </Pressable>
        <Pressable onPress={() => void getExpoDrawOverAppsModule()?.openApp()} style={styles.openAppButton}>
          <Text style={styles.openAppText}>Open app</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  bubble: {
    position: 'absolute',
    width: BUBBLE_WIDTH,
    minHeight: BUBBLE_HEIGHT,
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
  counterButton: {
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    gap: 2,
  },
  counterValue: {
    color: '#eff6ff',
    fontSize: 26,
    fontWeight: '800',
  },
  counterHint: {
    color: '#dbeafe',
    fontSize: 11,
    fontWeight: '600',
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
});
