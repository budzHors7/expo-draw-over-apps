import {
  createFloatingWindowPreviewState,
  getNextFloatingWindowPreviewState,
} from '../FloatingWindowPreview';

describe('floating window preview state', () => {
  it('normalizes preview state with a visible floating window by default', () => {
    const state = createFloatingWindowPreviewState(' alerts/user@example.com ', {
      count: 4.9,
      lastChangeSource: 'bubble',
    });

    expect(state).toMatchObject({
      bubbleId: 'alerts-user-example.com',
      count: 4,
      isVisible: true,
      lastChangeSource: 'bubble',
    });
    expect(typeof state.lastUpdatedAt).toBe('number');
  });

  it('creates the next preview state without calling native APIs', () => {
    const state = createFloatingWindowPreviewState('preview-bubble', {
      count: 2,
    });

    expect(getNextFloatingWindowPreviewState(state, { count: 3 }, 'bubble')).toMatchObject({
      bubbleId: 'preview-bubble',
      count: 3,
      isVisible: true,
      lastChangeSource: 'bubble',
    });
    expect(getNextFloatingWindowPreviewState(state, { count: -2 }, 'app').count).toBe(0);
    expect(getNextFloatingWindowPreviewState(state, { isVisible: false }, 'bubble')).toMatchObject({
      isVisible: false,
      lastChangeSource: 'bubble',
    });
  });
});
