import { useSyncExternalStore } from 'react';

import { getExpoDrawOverAppsModule } from './ExpoDrawOverAppsModule';
import type { BubbleChangeSource, BubbleState } from './bubbleTypes';

type BubbleListener = (state: BubbleState) => void;

const listeners = new Set<BubbleListener>();

let bubbleState: BubbleState = {
  count: 0,
  isVisible: false,
  lastUpdatedAt: Date.now(),
  lastChangeSource: 'app',
};

let hasBoundNativeState = false;

function emitBubbleState() {
  for (const listener of listeners) {
    listener(bubbleState);
  }
}

function normalizeChangeSource(source: BubbleState['lastChangeSource'] | string | undefined): BubbleChangeSource {
  return source === 'bubble' ? 'bubble' : 'app';
}

function normalizeBubbleState(nextState: Partial<BubbleState>): BubbleState {
  return {
    count: Math.max(0, Math.floor(nextState.count ?? bubbleState.count)),
    isVisible: Boolean(nextState.isVisible ?? bubbleState.isVisible),
    lastUpdatedAt: Number(nextState.lastUpdatedAt ?? Date.now()),
    lastChangeSource: normalizeChangeSource(nextState.lastChangeSource),
  };
}

function updateBubbleState(nextState: Partial<BubbleState>) {
  bubbleState = normalizeBubbleState(nextState);
  emitBubbleState();
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
  updateBubbleState(nativeModule.getBubbleState());

  nativeModule.addListener('onBubbleStateChanged', (nextState) => {
    updateBubbleState(nextState);
  });
}

function syncBubbleStateFromNative() {
  const nativeModule = getExpoDrawOverAppsModule();
  if (!nativeModule) {
    return bubbleState;
  }

  const nextState = nativeModule.getBubbleState();
  updateBubbleState(nextState);
  return nextState;
}

export function getBubbleState(): BubbleState {
  bindNativeBubbleState();
  return bubbleState;
}

export function subscribeToBubbleState(listener: BubbleListener): () => void {
  bindNativeBubbleState();
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
    ...bubbleState,
    isVisible,
    lastChangeSource: source,
    lastUpdatedAt: Date.now(),
  });
}

export function setBubbleCount(count: number, source: BubbleChangeSource = 'app') {
  bindNativeBubbleState();

  const nativeModule = getExpoDrawOverAppsModule();
  if (!nativeModule) {
    updateBubbleState({
      ...bubbleState,
      count,
      lastChangeSource: source,
      lastUpdatedAt: Date.now(),
    });
    return bubbleState.count;
  }

  const nextCount = nativeModule.setBubbleCount(Math.max(0, Math.floor(count)), source);
  syncBubbleStateFromNative();
  return nextCount;
}

export function incrementBubbleCount(source: BubbleChangeSource = 'bubble'): number {
  bindNativeBubbleState();

  const nativeModule = getExpoDrawOverAppsModule();
  if (!nativeModule) {
    const nextCount = bubbleState.count + 1;
    setBubbleCount(nextCount, source);
    return nextCount;
  }

  const nextCount = nativeModule.incrementBubbleCount(source);
  syncBubbleStateFromNative();
  return nextCount;
}

export function decrementBubbleCount(source: BubbleChangeSource = 'bubble'): number {
  bindNativeBubbleState();

  const nativeModule = getExpoDrawOverAppsModule();
  if (!nativeModule) {
    const nextCount = Math.max(0, bubbleState.count - 1);
    setBubbleCount(nextCount, source);
    return nextCount;
  }

  const nextCount = nativeModule.decrementBubbleCount(source);
  syncBubbleStateFromNative();
  return nextCount;
}

export function refreshBubbleState(): BubbleState {
  bindNativeBubbleState();
  return syncBubbleStateFromNative();
}
