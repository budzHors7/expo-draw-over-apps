export const DEFAULT_BUBBLE_ID = 'default';
export const MAX_BUBBLE_ID_LENGTH = 80;

const UNSAFE_BUBBLE_ID_PATTERN = /[^A-Za-z0-9._:-]+/g;
const REPEATED_DASH_PATTERN = /-+/g;

/**
 * Normalizes a JavaScript bubble ID before it is sent to the native overlay service.
 *
 * Unsupported characters become `-`, repeated dashes collapse, and empty values use
 * `DEFAULT_BUBBLE_ID`.
 */
export function normalizeBubbleId(bubbleId?: string): string {
  const normalizedBubbleId = (bubbleId ?? '')
    .trim()
    .replace(UNSAFE_BUBBLE_ID_PATTERN, '-')
    .replace(REPEATED_DASH_PATTERN, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_BUBBLE_ID_LENGTH)
    .replace(/-+$/g, '');

  return normalizedBubbleId.length > 0 ? normalizedBubbleId : DEFAULT_BUBBLE_ID;
}

export type BubbleChangeSource = 'app' | 'bubble';

/**
 * Shared state for a named floating bubble.
 */
export type BubbleState = {
  /** Normalized bubble ID used by JavaScript and native Android code. */
  bubbleId: string;
  /** Whether the native overlay service currently reports the bubble as visible. */
  isVisible: boolean;
  /** Epoch timestamp for the last state change. */
  lastUpdatedAt: number;
  /** Side that last changed the state. */
  lastChangeSource: BubbleChangeSource;
};

/**
 * Options applied when a bubble is shown.
 */
export type BubbleDisplayOptions = {
  /** Allows the bubble to tuck into the left or right screen edge while leaving a clickable sliver. */
  edgeHideEnabled?: boolean;
};
