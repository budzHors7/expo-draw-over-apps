import { Button, Column, Shape, Surface, Text } from '@expo/ui/jetpack-compose';
import {
  animateContentSize,
  paddingAll,
  size as composeSize,
} from '@expo/ui/jetpack-compose/modifiers';

import { NativeWindow, type BubbleRendererProps } from 'expo-draw-over-apps';
import { setExampleBubbleCount, useExampleBubbleState } from '../state/bubbleExampleState';
import {
  RESIZE_BUBBLE_MAX_STEP,
  RESIZE_BUBBLE_MIN_STEP,
  getResizeBubbleStepConfig,
} from './resizeBubbleSizing';

export function NativeWindowRenderer({ bubbleId, close, openApp }: BubbleRendererProps) {
  const state = useExampleBubbleState(bubbleId);
  const windowSize = getResizeBubbleStepConfig(state.count);

  return (
    <NativeWindow seedColor="#2563eb">
      <Surface
        color="#eff6ff"
        contentColor="#172554"
        shadowElevation={12}
        shape={Shape.RoundedCorner({
          cornerRadii: {
            topStart: windowSize.radius,
            topEnd: windowSize.radius,
            bottomStart: windowSize.radius,
            bottomEnd: windowSize.radius,
          },
        })}
        modifiers={[
          animateContentSize(),
          composeSize(windowSize.dimension, windowSize.height),
        ]}
      >
        <Column
          verticalArrangement="center"
          horizontalAlignment="center"
          modifiers={[paddingAll(16)]}
        >
          <Text style={{ typography: 'labelLarge' }}>Native Window</Text>
          <Text style={{ typography: 'headlineSmall' }}>{windowSize.label}</Text>
          <Button
            onClick={() => setExampleBubbleCount(RESIZE_BUBBLE_MIN_STEP, 'bubble', bubbleId)}
          >
            <Text>Small</Text>
          </Button>
          <Button
            onClick={() => setExampleBubbleCount(RESIZE_BUBBLE_MAX_STEP, 'bubble', bubbleId)}
          >
            <Text>Big</Text>
          </Button>
          <Button onClick={() => void openApp()}>
            <Text>Open app</Text>
          </Button>
          <Button onClick={close}>
            <Text>Close</Text>
          </Button>
        </Column>
      </Surface>
    </NativeWindow>
  );
}
