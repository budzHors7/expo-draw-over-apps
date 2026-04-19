export const DEFAULT_BUBBLE_ID = 'default';

export type BubbleChangeSource = 'app' | 'bubble';

export type BubbleState = {
  bubbleId: string;
  count: number;
  isVisible: boolean;
  lastUpdatedAt: number;
  lastChangeSource: BubbleChangeSource;
};
