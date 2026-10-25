import type { BubbleRenderer } from 'expo-draw-over-apps';

import {
  NativeWindowRenderer,
  ReactNativeWindowRenderer,
  RESIZE_BUBBLE_INITIAL_STEP,
} from '../components';

export type BubbleExampleId = 'react-native-window' | 'native-window';
export type BubbleTemplateTone = 'reactNative' | 'native';

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
    id: 'react-native-window',
    title: 'React Native Window',
    description: 'Application-owned React Native children in an animated overlay window.',
    initialCount: RESIZE_BUBBLE_INITIAL_STEP,
    renderer: ReactNativeWindowRenderer,
    tone: 'reactNative',
  },
  {
    id: 'native-window',
    title: 'Native Window',
    description: 'Application-owned Expo UI components rendered directly by Jetpack Compose.',
    initialCount: RESIZE_BUBBLE_INITIAL_STEP,
    renderer: NativeWindowRenderer,
    tone: 'native',
  },
];

export const BUBBLE_EXAMPLE_IDS = BUBBLE_PLAYGROUND_TEMPLATES.map((template) => template.id);

export function getBubbleTemplate(id: BubbleExampleId): BubblePlaygroundTemplate {
  return BUBBLE_PLAYGROUND_TEMPLATES.find((template) => template.id === id) ?? BUBBLE_PLAYGROUND_TEMPLATES[0];
}
