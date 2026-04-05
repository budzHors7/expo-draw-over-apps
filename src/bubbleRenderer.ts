import type { ComponentType } from 'react';
import { useSyncExternalStore } from 'react';

import type { BubbleState } from './bubbleTypes';

export type BubbleRendererProps = {
  state: BubbleState;
  increment(): number;
  decrement(): number;
  setCount(count: number): number;
  hide(): boolean;
  openApp(): Promise<boolean>;
};

export type BubbleRenderer = ComponentType<BubbleRendererProps>;

const rendererListeners = new Set<() => void>();

let bubbleRenderer: BubbleRenderer | null = null;

function emitBubbleRendererChange() {
  for (const listener of rendererListeners) {
    listener();
  }
}

export function getBubbleRenderer(): BubbleRenderer | null {
  return bubbleRenderer;
}

export function setBubbleRenderer(renderer: BubbleRenderer | null) {
  bubbleRenderer = renderer;
  emitBubbleRendererChange();
}

export function subscribeToBubbleRenderer(listener: () => void): () => void {
  rendererListeners.add(listener);
  return () => {
    rendererListeners.delete(listener);
  };
}

export function useBubbleRenderer(): BubbleRenderer | null {
  return useSyncExternalStore(subscribeToBubbleRenderer, getBubbleRenderer, getBubbleRenderer);
}

