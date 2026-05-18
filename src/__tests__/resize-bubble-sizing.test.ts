import {
  RESIZE_BUBBLE_INITIAL_STEP,
  RESIZE_BUBBLE_MAX_STEP,
  RESIZE_BUBBLE_MIN_STEP,
  getResizeBubbleStep,
  getResizeBubbleStepConfig,
} from '../../example/components/resizeBubbleSizing';

describe('resize bubble sizing', () => {
  it('normalizes free-form count values into the supported size steps', () => {
    expect(RESIZE_BUBBLE_MIN_STEP).toBe(0);
    expect(RESIZE_BUBBLE_INITIAL_STEP).toBe(1);
    expect(RESIZE_BUBBLE_MAX_STEP).toBe(2);
    expect(getResizeBubbleStep(-4)).toBe(0);
    expect(getResizeBubbleStep(1.49)).toBe(1);
    expect(getResizeBubbleStep(1.5)).toBe(2);
    expect(getResizeBubbleStep(8)).toBe(2);
  });

  it('keeps each resize step larger than the previous step', () => {
    const small = getResizeBubbleStepConfig(0);
    const medium = getResizeBubbleStepConfig(1);
    const large = getResizeBubbleStepConfig(2);

    expect(small.dimension).toBeLessThan(medium.dimension);
    expect(medium.dimension).toBeLessThan(large.dimension);
    expect(small.label).toBe('Small');
    expect(large.label).toBe('Big');
  });
});
