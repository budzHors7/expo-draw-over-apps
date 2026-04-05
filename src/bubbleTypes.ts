export type BubbleChangeSource = 'app' | 'bubble';

export type BubbleState = {
  count: number;
  isVisible: boolean;
  lastUpdatedAt: number;
  lastChangeSource: BubbleChangeSource;
};

