import type { ComponentType } from 'react';
import { useSyncExternalStore } from 'react';

import { DEFAULT_BUBBLE_ID, normalizeBubbleId, type BubbleState } from './bubbleTypes';

/**
 * Props passed to every custom bubble renderer.
 */
export type BubbleRendererProps = {
  /** Normalized ID for the bubble currently being rendered. */
  bubbleId: string;
  /** Current shared state for this bubble. */
  state: BubbleState;
  /** Adds one to the shared counter and marks the bubble as the source. */
  increment(): number;
  /** Subtracts one from the shared counter without going below zero. */
  decrement(): number;
  /** Sets the shared counter to a non-negative integer. */
  setCount(count: number): number;
  /** Hides this bubble. */
  hide(): boolean;
  /** Brings the host app to the foreground. */
  openApp(): Promise<boolean>;
};

/**
 * React component used to draw a floating bubble.
 */
export type BubbleRenderer = ComponentType<BubbleRendererProps>;

const rendererListeners = new Set<() => void>();

let bubbleRenderer: BubbleRenderer | null = null;
const bubbleRenderers = new Map<string, BubbleRenderer | null>();

function emitBubbleRendererChange() {
  for (const listener of rendererListeners) {
    listener();
  }
}

export function getBubbleRenderer(bubbleId: string = DEFAULT_BUBBLE_ID): BubbleRenderer | null {
  return bubbleRenderers.get(normalizeBubbleId(bubbleId)) ?? bubbleRenderer;
}

/**
 * Registers a global renderer used by bubbles without a per-bubble override.
 *
 * Pass `null` to restore the default renderer.
 */
export function setBubbleRenderer(renderer: BubbleRenderer | null) {
  bubbleRenderer = renderer;
  emitBubbleRendererChange();
}

/**
 * Registers or clears a renderer for one named bubble.
 */
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
