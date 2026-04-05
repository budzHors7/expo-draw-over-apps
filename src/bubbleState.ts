import { useSyncExternalStore } from 'react';

export type BubbleChangeSource = 'app' | 'bubble';

export type BubbleState = {
  count: number;
  isVisible: boolean;
  lastUpdatedAt: number;
  lastChangeSource: BubbleChangeSource;
};

type BubbleListener = (state: BubbleState) => void;

const listeners = new Set<BubbleListener>();

let bubbleState: BubbleState = {
  count: 0,
  isVisible: false,
  lastUpdatedAt: Date.now(),
  lastChangeSource: 'app',
};

function emitBubbleState() {
  for (const listener of listeners) {
    listener(bubbleState);
  }
}

function updateBubbleState(partial: Partial<BubbleState>) {
  bubbleState = {
    ...bubbleState,
    ...partial,
    lastUpdatedAt: Date.now(),
  };
  emitBubbleState();
}

export function getBubbleState(): BubbleState {
  return bubbleState;
}

export function subscribeToBubbleState(listener: BubbleListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useBubbleState(): BubbleState {
  return useSyncExternalStore(subscribeToBubbleState, getBubbleState, getBubbleState);
}

export function setBubbleVisible(isVisible: boolean, source: BubbleChangeSource = 'app') {
  updateBubbleState({
    isVisible,
    lastChangeSource: source,
  });
}

export function setBubbleCount(count: number, source: BubbleChangeSource = 'app') {
  updateBubbleState({
    count: Math.max(0, Math.floor(count)),
    lastChangeSource: source,
  });
}

export function incrementBubbleCount(source: BubbleChangeSource = 'bubble'): number {
  const nextCount = bubbleState.count + 1;
  setBubbleCount(nextCount, source);
  return nextCount;
}

export function decrementBubbleCount(source: BubbleChangeSource = 'bubble'): number {
  const nextCount = Math.max(0, bubbleState.count - 1);
  setBubbleCount(nextCount, source);
  return nextCount;
}
