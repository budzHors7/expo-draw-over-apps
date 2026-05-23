import {
  DEFAULT_BUBBLE_ID,
  getOverlaySharedValueState,
  normalizeBubbleId,
  refreshAllOverlaySharedValueStates,
  setOverlaySharedValue,
  subscribeToOverlaySharedValueState,
  useAllOverlaySharedValueStates,
  useOverlaySharedValueState,
  type BubbleChangeSource,
  type OverlaySharedValueState,
} from 'expo-draw-over-apps';

export type ExampleBubbleChangeSource = BubbleChangeSource;

export type ExampleBubbleState = {
  bubbleId: string;
  count: number;
  lastUpdatedAt: number;
  lastChangeSource: ExampleBubbleChangeSource;
};

export const WINDOW_CONTAINER_SHARED_VALUE_KEY = 'window-container-counter';

const RESIZE_WINDOW_BUBBLE_IDS = new Set([
  'react-native-resize-bubble',
  'expo-ui-resize-bubble',
]);

const observedBubbleIds = new Set<string>([
  DEFAULT_BUBBLE_ID,
  'react-native-counter',
  'jetpack-compose-counter',
  'countdown-timer',
  'react-native-resize-bubble',
  'expo-ui-resize-bubble',
]);

function normalizeCount(count: number) {
  return Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
}

function getExampleBubbleValueKey(bubbleId: string) {
  const normalizedBubbleId = normalizeBubbleId(bubbleId);
  return RESIZE_WINDOW_BUBBLE_IDS.has(normalizedBubbleId)
    ? WINDOW_CONTAINER_SHARED_VALUE_KEY
    : normalizedBubbleId;
}

function trackBubbleId(bubbleId: string) {
  const normalizedBubbleId = normalizeBubbleId(bubbleId);
  observedBubbleIds.add(normalizedBubbleId);
  return normalizedBubbleId;
}

function toExampleBubbleState(
  bubbleId: string,
  sharedValueState: OverlaySharedValueState
): ExampleBubbleState {
  return {
    bubbleId,
    count: normalizeCount(sharedValueState.value),
    lastUpdatedAt: sharedValueState.lastUpdatedAt,
    lastChangeSource: sharedValueState.lastChangeSource,
  };
}

export function getExampleBubbleState(bubbleId: string = DEFAULT_BUBBLE_ID): ExampleBubbleState {
  const normalizedBubbleId = trackBubbleId(bubbleId);
  return toExampleBubbleState(
    normalizedBubbleId,
    getOverlaySharedValueState(getExampleBubbleValueKey(normalizedBubbleId))
  );
}

export function getAllExampleBubbleStates(): ExampleBubbleState[] {
  return Array.from(observedBubbleIds)
    .sort((left, right) => left.localeCompare(right))
    .map((bubbleId) => getExampleBubbleState(bubbleId));
}

export function refreshAllExampleBubbleStates(): ExampleBubbleState[] {
  refreshAllOverlaySharedValueStates();
  return getAllExampleBubbleStates();
}

export function subscribeToExampleBubbleState(listener: () => void) {
  return subscribeToOverlaySharedValueState(listener);
}

export function useExampleBubbleState(bubbleId: string = DEFAULT_BUBBLE_ID): ExampleBubbleState {
  const normalizedBubbleId = trackBubbleId(bubbleId);
  const sharedValueState = useOverlaySharedValueState(getExampleBubbleValueKey(normalizedBubbleId));
  return toExampleBubbleState(normalizedBubbleId, sharedValueState);
}

export function useAllExampleBubbleStates(): ExampleBubbleState[] {
  useAllOverlaySharedValueStates();
  return getAllExampleBubbleStates();
}

export function setExampleBubbleCount(
  count: number,
  source: ExampleBubbleChangeSource = 'app',
  bubbleId: string = DEFAULT_BUBBLE_ID
) {
  const normalizedBubbleId = trackBubbleId(bubbleId);
  return normalizeCount(
    setOverlaySharedValue(getExampleBubbleValueKey(normalizedBubbleId), normalizeCount(count), source)
  );
}

export function incrementExampleBubbleCount(
  source: ExampleBubbleChangeSource = 'bubble',
  bubbleId: string = DEFAULT_BUBBLE_ID
) {
  return setExampleBubbleCount(getExampleBubbleState(bubbleId).count + 1, source, bubbleId);
}

export function decrementExampleBubbleCount(
  source: ExampleBubbleChangeSource = 'bubble',
  bubbleId: string = DEFAULT_BUBBLE_ID
) {
  return setExampleBubbleCount(getExampleBubbleState(bubbleId).count - 1, source, bubbleId);
}
