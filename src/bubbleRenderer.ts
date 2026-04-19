import type { ComponentType } from 'react';
import { useSyncExternalStore } from 'react';

import { DEFAULT_BUBBLE_ID, type BubbleState } from './bubbleTypes';

export type BubbleRendererProps = {
  bubbleId: string;
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
const bubbleRenderers = new Map<string, BubbleRenderer | null>();

function emitBubbleRendererChange() {
  for (const listener of rendererListeners) {
    listener();
  }
}

function normalizeBubbleId(bubbleId?: string): string {
  return bubbleId && bubbleId.trim().length > 0 ? bubbleId : DEFAULT_BUBBLE_ID;
}

export function getBubbleRenderer(bubbleId: string = DEFAULT_BUBBLE_ID): BubbleRenderer | null {
  return bubbleRenderers.get(normalizeBubbleId(bubbleId)) ?? bubbleRenderer;
}

export function setBubbleRenderer(renderer: BubbleRenderer | null) {
  bubbleRenderer = renderer;
  emitBubbleRendererChange();
}

export function setBubbleRendererForBubble(bubbleId: string, renderer: BubbleRenderer | null) {
  const normalizedBubbleId = normalizeBubbleId(bubbleId);

  if (renderer) {
    bubbleRenderers.set(normalizedBubbleId, renderer);
  } else {
    bubbleRenderers.delete(normalizedBubbleId);
  }

  emitBubbleRendererChange();
}

export function subscribeToBubbleRenderer(listener: () => void): () => void {
  rendererListeners.add(listener);
  return () => {
    rendererListeners.delete(listener);
  };
}

export function useBubbleRenderer(bubbleId: string = DEFAULT_BUBBLE_ID): BubbleRenderer | null {
  return useSyncExternalStore(
    subscribeToBubbleRenderer,
    () => getBubbleRenderer(bubbleId),
    () => getBubbleRenderer(bubbleId)
  );
}
