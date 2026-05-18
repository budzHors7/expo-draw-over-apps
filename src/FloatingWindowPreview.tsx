import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { BubbleRendererProps } from './bubbleRenderer';
import { DEFAULT_BUBBLE_ID, normalizeBubbleId, type BubbleChangeSource, type BubbleState } from './bubbleTypes';

/**
 * Renderer props used by `FloatingWindowPreview`.
 */
export type FloatingWindowPreviewRenderProps = BubbleRendererProps & {
  /** Fixed preview frame size supplied by the preview component. */
  preview: {
    width: number;
    height: number;
  };
};

/**
 * Props for rendering a bubble fixture inside the app without starting the native overlay service.
 */
export type FloatingWindowPreviewProps = {
  /** Renders the bubble UI with preview-backed renderer props. */
  renderBubble: (props: FloatingWindowPreviewRenderProps) => React.ReactNode;
  /** Preview frame width in density-independent pixels. */
  width: number;
  /** Preview frame height in density-independent pixels. */
  height: number;
  /** Bubble ID used for preview state. */
  bubbleId?: string;
  /** Initial uncontrolled preview state. */
  initialState?: Partial<BubbleState>;
  /** Controlled preview state. */
  state?: Partial<BubbleState>;
  /** Shows a dashed preview boundary when true. */
  showBorder?: boolean;
  /** Shows a hidden-state placeholder after the preview renderer calls `hide()`. */
  showHiddenState?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Called after local preview state changes. */
  onStateChange?: (state: BubbleState) => void;
  /** Called when the preview renderer asks to hide itself. */
  onHide?: (state: BubbleState) => boolean | void;
  /** Called when the preview renderer asks to open the app. */
  onOpenApp?: (state: BubbleState) => Promise<boolean> | boolean | void;
};

function normalizePreviewCount(count: number | undefined) {
  return typeof count === 'number' && Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
}

function normalizePreviewChangeSource(source: BubbleState['lastChangeSource'] | string | undefined): BubbleChangeSource {
  return source === 'bubble' ? 'bubble' : 'app';
}

/**
 * Creates normalized preview state for a named bubble.
 */
export function createFloatingWindowPreviewState(
  bubbleId: string = DEFAULT_BUBBLE_ID,
  state: Partial<BubbleState> = {}
): BubbleState {
  return {
    bubbleId: normalizeBubbleId(state.bubbleId ?? bubbleId),
    count: normalizePreviewCount(state.count),
    isVisible: state.isVisible ?? true,
    lastUpdatedAt: Number.isFinite(state.lastUpdatedAt) ? Number(state.lastUpdatedAt) : Date.now(),
    lastChangeSource: normalizePreviewChangeSource(state.lastChangeSource),
  };
}

/**
 * Applies a state patch to preview state while keeping preview counts non-negative.
 */
export function getNextFloatingWindowPreviewState(
  currentState: BubbleState,
  patch: Partial<BubbleState>,
  source: BubbleChangeSource = 'bubble'
): BubbleState {
  return createFloatingWindowPreviewState(currentState.bubbleId, {
    ...currentState,
    ...patch,
    lastChangeSource: source,
    lastUpdatedAt: Date.now(),
  });
}

/**
 * Renders a bubble renderer inside the app for design and fixture testing.
 */
export function FloatingWindowPreview({
  renderBubble,
  width,
  height,
  bubbleId = DEFAULT_BUBBLE_ID,
  initialState,
  state,
  showBorder = true,
  showHiddenState = true,
  style,
  contentContainerStyle,
  onStateChange,
  onHide,
  onOpenApp,
}: FloatingWindowPreviewProps) {
  const [localState, setLocalState] = useState(() => createFloatingWindowPreviewState(bubbleId, initialState));
  const previewState = useMemo(
    () => createFloatingWindowPreviewState(bubbleId, state ?? localState),
    [bubbleId, localState, state]
  );

  function commitPreviewState(nextState: BubbleState) {
    setLocalState(nextState);
    onStateChange?.(nextState);
    return nextState.count;
  }

  const rendererProps = useMemo<FloatingWindowPreviewRenderProps>(
    () => ({
      bubbleId: previewState.bubbleId,
      state: previewState,
      increment: () =>
        commitPreviewState(
          getNextFloatingWindowPreviewState(previewState, { count: previewState.count + 1 }, 'bubble')
        ),
      decrement: () =>
        commitPreviewState(
          getNextFloatingWindowPreviewState(previewState, { count: previewState.count - 1 }, 'bubble')
        ),
      setCount: (count) => commitPreviewState(getNextFloatingWindowPreviewState(previewState, { count }, 'bubble')),
      hide: () => {
        const nextState = getNextFloatingWindowPreviewState(previewState, { isVisible: false }, 'bubble');
        commitPreviewState(nextState);
        const didHide = onHide?.(nextState);
        return typeof didHide === 'boolean' ? didHide : true;
      },
      openApp: async () => {
        const didOpen = await onOpenApp?.(previewState);
        return typeof didOpen === 'boolean' ? didOpen : false;
      },
      preview: {
        width,
        height,
      },
    }),
    [height, onHide, onOpenApp, previewState, width]
  );

  return (
    <View style={[styles.previewFrame, { width, height }, showBorder && styles.previewFrameBorder, style]}>
      <View style={[styles.previewContent, contentContainerStyle]}>
        {previewState.isVisible || !showHiddenState ? (
          renderBubble(rendererProps)
        ) : (
          <View style={styles.hiddenState}>
            <Text style={styles.hiddenStateText}>Floating window hidden</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  previewFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
  previewFrameBorder: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#94a3b8',
    borderRadius: 18,
  },
  previewContent: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  hiddenState: {
    minWidth: 160,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#e2e8f0',
  },
  hiddenStateText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});
