import {
  Button,
  Column,
  Shape,
  Surface,
  Text,
} from '@expo/ui/jetpack-compose';
import {
  animateContentSize,
  fillMaxWidth,
  paddingAll,
  size,
} from '@expo/ui/jetpack-compose/modifiers';

import { NativeWindow, showBubble, type BubbleRendererProps } from 'expo-draw-over-apps';
import { setExampleBubbleCount, useExampleBubbleState } from '../state/bubbleExampleState';
import {
  RESIZE_BUBBLE_MAX_STEP,
  RESIZE_BUBBLE_MIN_STEP,
  getResizeBubbleStep,
  getResizeBubbleStepConfig,
} from './resizeBubbleSizing';

const REPOSITION_X = 240;
const REPOSITION_Y = 120;

export function NativeWindowRenderer({ bubbleId, close }: BubbleRendererProps) {
  const state = useExampleBubbleState(bubbleId);
  const activeStep = getResizeBubbleStep(state.count);
  const activeConfig = getResizeBubbleStepConfig(state.count);
  const nextStep =
    activeStep === RESIZE_BUBBLE_MAX_STEP
      ? RESIZE_BUBBLE_MIN_STEP
      : RESIZE_BUBBLE_MAX_STEP;

  return (
    <NativeWindow seedColor="#7c3aed">
      <Surface
        tonalElevation={4}
        shadowElevation={12}
        shape={Shape.RoundedCorner({
          cornerRadii: {
            topStart: activeConfig.radius,
            topEnd: activeConfig.radius,
            bottomStart: activeConfig.radius,
            bottomEnd: activeConfig.radius,
          },
        })}
        modifiers={[
          animateContentSize(),
          size(activeConfig.dimension + 36, activeConfig.height + 72),
        ]}
      >
        <Column
          horizontalAlignment="center"
          verticalArrangement={{ spacedBy: 8 }}
          modifiers={[fillMaxWidth(), paddingAll(12)]}
        >
          <Text style={{ typography: 'titleMedium', fontWeight: '800' }}>Native Window</Text>
          <Text style={{ typography: 'headlineMedium', fontWeight: '900' }}>
            {activeConfig.shortLabel}
          </Text>
          <Button onClick={() => setExampleBubbleCount(nextStep, 'bubble', bubbleId)}>
            <Text>Resize</Text>
          </Button>
          <Button
            onClick={() => {
              void showBubble(bubbleId, { x: REPOSITION_X, y: REPOSITION_Y });
            }}
          >
            <Text>Move</Text>
          </Button>
          <Button onClick={close}>
            <Text>Close</Text>
          </Button>
        </Column>
      </Surface>
    </NativeWindow>
  );
}
