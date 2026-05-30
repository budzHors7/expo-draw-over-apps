import { useSyncExternalStore } from 'react';

import { getExpoDrawOverAppsModule } from './ExpoDrawOverAppsModule';
import { DEFAULT_BUBBLE_ID, normalizeBubbleId, type BubbleChangeSource, type BubbleState } from './bubbleTypes';

type BubbleListener = () => void;

const listeners = new Set<BubbleListener>();

let bubbleStates: Record<string, BubbleState> = {
  [DEFAULT_BUBBLE_ID]: createDefaultBubbleState(DEFAULT_BUBBLE_ID),
};
let allBubbleStatesSnapshot = createAllBubbleStatesSnapshot(bubbleStates);

let hasBoundNativeState = false;

function createDefaultBubbleState(bubbleId: string): BubbleState {
  return {
    bubbleId,
    isVisible: false,
    lastUpdatedAt: Date.now(),
    lastChangeSource: 'app',
  };
}

function createAllBubbleStatesSnapshot(states: Record<string, BubbleState>): BubbleState[] {
  return Object.values(states).sort((left, right) => left.bubbleId.localeCompare(right.bubbleId));
}

function commitBubbleStates(nextStates: Record<string, BubbleState>) {
  bubbleStates = nextStates;
  allBubbleStatesSnapshot = createAllBubbleStatesSnapshot(nextStates);
}

function emitBubbleState() {
  for (const listener of listeners) {
    listener();
  }
}

function normalizeChangeSource(source: BubbleState['lastChangeSource'] | string | undefined): BubbleChangeSource {
  return source === 'bubble' ? 'bubble' : 'app';
}

function normalizeBubbleState(nextState: Partial<BubbleState>, bubbleId?: string): BubbleState {
  const normalizedBubbleId = normalizeBubbleId(nextState.bubbleId ?? bubbleId);
  const previousState = bubbleStates[normalizedBubbleId] ?? createDefaultBubbleState(normalizedBubbleId);

  return {
    bubbleId: normalizedBubbleId,
    isVisible: Boolean(nextState.isVisible ?? previousState.isVisible),
    lastUpdatedAt: Number(nextState.lastUpdatedAt ?? Date.now()),
    lastChangeSource: normalizeChangeSource(nextState.lastChangeSource ?? previousState.lastChangeSource),
  };
}

function updateBubbleStates(nextStates: Partial<BubbleState>[]) {
  let nextBubbleStates: Record<string, BubbleState> | null = null;

  for (const nextState of nextStates) {
    const normalizedState = normalizeBubbleState(nextState);
    const currentStates = nextBubbleStates ?? bubbleStates;
    const previousState = currentStates[normalizedState.bubbleId];

    if (
      !previousState ||
      previousState.isVisible !== normalizedState.isVisible ||
      previousState.lastUpdatedAt !== normalizedState.lastUpdatedAt ||
      previousState.lastChangeSource !== normalizedState.lastChangeSource
    ) {
      nextBubbleStates ??= { ...bubbleStates };
      nextBubbleStates[normalizedState.bubbleId] = normalizedState;
    }
  }

  if (nextBubbleStates) {
    commitBubbleStates(nextBubbleStates);
    emitBubbleState();
  }
}

function bindNativeBubbleState() {
  if (hasBoundNativeState) {
    return;
  }

  const nativeModule = getExpoDrawOverAppsModule();
  if (!nativeModule) {
    return;
  }

  hasBoundNativeState = true;
  updateBubbleStates(nativeModule.getAllBubbleStates());

  nativeModule.addListener('onBubbleStateChanged', (nextState) => {
    updateBubbleStates([nextState]);
  });

  nativeModule.addListener('onBubbleStatesChanged', (event) => {
    updateBubbleStates(event.states);
  });
}

function syncBubbleStatesFromNative() {
  const nativeModule = getExpoDrawOverAppsModule();
  if (!nativeModule) {
    return getAllBubbleStates();
  }

  const nextStates = nativeModule.getAllBubbleStates();
  updateBubbleStates(nextStates);
  return nextStates;
}

export function getBubbleState(bubbleId: string = DEFAULT_BUBBLE_ID): BubbleState {
  bindNativeBubbleState();
  const normalizedBubbleId = normalizeBubbleId(bubbleId);
  const existingState = bubbleStates[normalizedBubbleId];
  if (existingState) {
    return existingState;
  }

  const defaultState = createDefaultBubbleState(normalizedBubbleId);
  commitBubbleStates({
    ...bubbleStates,
    [normalizedBubbleId]: defaultState,
  });
  return defaultState;
}

/**
 * Returns the latest known state for every named bubble.
 */
export function getAllBubbleStates(): BubbleState[] {
  bindNativeBubbleState();
  return allBubbleStatesSnapshot;
}

/**
 * Subscribes to bubble state changes and returns an unsubscribe function.
 */
export function subscribeToBubbleState(listener: BubbleListener): () => void {
  bindNativeBubbleState();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * React hook for the latest state of one named bubble.
 */
export function useBubbleState(bubbleId: string = DEFAULT_BUBBLE_ID): BubbleState {
  return useSyncExternalStore(
    subscribeToBubbleState,
    () => getBubbleState(bubbleId),
    () => getBubbleState(bubbleId)
  );
}

/**
 * React hook for the latest state of all named bubbles.
 */
export function useAllBubbleStates(): BubbleState[] {
  return useSyncExternalStore(subscribeToBubbleState, getAllBubbleStates, getAllBubbleStates);
}

export function setBubbleVisible(
  isVisible: boolean,
  source: BubbleChangeSource = 'app',
  bubbleId: string = DEFAULT_BUBBLE_ID
) {
  updateBubbleStates([
    {
      ...getBubbleState(bubbleId),
      bubbleId,
      isVisible,
      lastChangeSource: source,
      lastUpdatedAt: Date.now(),
    },
  ]);
}

/**
 * Reads native state and returns the latest state for one named bubble.
 */
export function refreshBubbleState(bubbleId: string = DEFAULT_BUBBLE_ID): BubbleState {
  bindNativeBubbleState();
  syncBubbleStatesFromNative();
  return getBubbleState(bubbleId);
}
