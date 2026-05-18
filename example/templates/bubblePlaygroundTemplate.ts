import type { BubbleRenderer, BubbleState } from 'expo-draw-over-apps';

import {
  CountdownTimerBubbleRenderer,
  JetpackComposeBubbleRenderer,
  NativeExpoUiResizeBubbleRenderer,
  ReactNativeResizeBubbleRenderer,
  ReactNativeBubbleRenderer,
  RESIZE_BUBBLE_INITIAL_STEP,
  TIMER_DURATION_SECONDS,
} from '../components';

export type BubbleExampleId =
  | 'react-native-counter'
  | 'jetpack-compose-counter'
  | 'countdown-timer'
  | 'react-native-resize-bubble'
  | 'expo-ui-resize-bubble';
export type BubbleTemplateTone = 'reactNative' | 'compose' | 'timer' | 'resizeReactNative' | 'resizeExpoUi';

export type BubblePlaygroundTemplate = {
  id: BubbleExampleId;
  title: string;
  description: string;
  initialCount: number;
  renderer: BubbleRenderer;
  tone: BubbleTemplateTone;
};

// Template IDs are static and non-sensitive because they cross the JS/native overlay boundary.
export const BUBBLE_PLAYGROUND_TEMPLATES: BubblePlaygroundTemplate[] = [
  {
    id: 'react-native-counter',
    title: 'React Native Counter Bubble',
    description: 'Counter bubble rendered with React Native views and Pressables.',
    initialCount: 0,
    renderer: ReactNativeBubbleRenderer,
    tone: 'reactNative',
  },
  {
    id: 'jetpack-compose-counter',
    title: 'Jetpack Compose Counter Bubble',
    description: 'Counter bubble rendered with the packaged Compose-flavored API.',
    initialCount: 0,
    renderer: JetpackComposeBubbleRenderer,
    tone: 'compose',
  },
  {
    id: 'countdown-timer',
    title: 'Countdown Timer Bubble',
    description: 'A timer example that refreshes every second without moving the bubble.',
    initialCount: TIMER_DURATION_SECONDS,
    renderer: CountdownTimerBubbleRenderer,
    tone: 'timer',
  },
  {
    id: 'react-native-resize-bubble',
    title: 'React Native Resize Bubble',
    description: 'Animated React Native bubble that smoothly resizes between small and big.',
    initialCount: RESIZE_BUBBLE_INITIAL_STEP,
    renderer: ReactNativeResizeBubbleRenderer,
    tone: 'resizeReactNative',
  },
  {
    id: 'expo-ui-resize-bubble',
    title: 'Native Expo UI Resize Bubble',
    description: 'Native Expo UI surface with Reanimated resize and React Native children.',
    initialCount: RESIZE_BUBBLE_INITIAL_STEP,
    renderer: NativeExpoUiResizeBubbleRenderer,
    tone: 'resizeExpoUi',
  },
];

export const BUBBLE_EXAMPLE_IDS = BUBBLE_PLAYGROUND_TEMPLATES.map((template) => template.id);

export function getBubbleTemplate(id: BubbleExampleId): BubblePlaygroundTemplate {
  return BUBBLE_PLAYGROUND_TEMPLATES.find((template) => template.id === id) ?? BUBBLE_PLAYGROUND_TEMPLATES[0];
}

export function createTemplateBubbleState(template: BubblePlaygroundTemplate): BubbleState {
  return {
    bubbleId: template.id,
    count: template.initialCount,
    isVisible: false,
    lastUpdatedAt: 0,
    lastChangeSource: 'app',
  };
}
