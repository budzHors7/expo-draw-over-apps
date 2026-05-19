export const RESIZE_BUBBLE_STEPS = [
  {
    label: 'Small',
    shortLabel: 'S',
    dimension: 154,
    height: 172,
    radius: 28,
    orbSize: 48,
  },
  {
    label: 'Medium',
    shortLabel: 'M',
    dimension: 196,
    height: 214,
    radius: 36,
    orbSize: 70,
  },
  {
    label: 'Big',
    shortLabel: 'B',
    dimension: 238,
    height: 256,
    radius: 44,
    orbSize: 92,
  },
] as const;

export const RESIZE_BUBBLE_MIN_STEP = 0;
export const RESIZE_BUBBLE_INITIAL_STEP = 1;
export const RESIZE_BUBBLE_MAX_STEP = RESIZE_BUBBLE_STEPS.length - 1;

export function getResizeBubbleStep(count: number) {
  const roundedStep = Number.isFinite(count) ? Math.round(count) : RESIZE_BUBBLE_INITIAL_STEP;

  return Math.min(RESIZE_BUBBLE_MAX_STEP, Math.max(RESIZE_BUBBLE_MIN_STEP, roundedStep));
}

export function getResizeBubbleStepConfig(count: number) {
  return RESIZE_BUBBLE_STEPS[getResizeBubbleStep(count)];
}
