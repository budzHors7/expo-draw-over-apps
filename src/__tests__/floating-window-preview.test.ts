import {
  createFloatingWindowPreviewState,
  getNextFloatingWindowPreviewState,
} from '../FloatingWindowPreview';

describe('floating window preview state', () => {
  it('normalizes preview state with a visible floating window by default', () => {
    const state = createFloatingWindowPreviewState(' alerts/user@example.com ', {
      lastChangeSource: 'bubble',
    });

    expect(state).toMatchObject({
      bubbleId: 'alerts-user-example.com',
      isVisible: true,
      lastChangeSource: 'bubble',
    });
    expect(typeof state.lastUpdatedAt).toBe('number');
  });

  it('creates the next preview state without calling native APIs', () => {
    const state = createFloatingWindowPreviewState('preview-bubble');

    expect(getNextFloatingWindowPreviewState(state, { isVisible: true }, 'bubble')).toMatchObject({
      bubbleId: 'preview-bubble',
      isVisible: true,
      lastChangeSource: 'bubble',
    });
    expect(getNextFloatingWindowPreviewState(state, { isVisible: false }, 'bubble')).toMatchObject({
      isVisible: false,
      lastChangeSource: 'bubble',
    });
  });
});
