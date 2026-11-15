type NativeModuleMock = {
  addListener: jest.Mock;
  getAllBubbleStates: jest.Mock;
  getBubbleState: jest.Mock;
  getBubbleStateById: jest.Mock;
  showBubble: jest.Mock;
  showBubbleInstance: jest.Mock;
};

function loadModule() {
  jest.resetModules();

  const nativeModule: NativeModuleMock = {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    getAllBubbleStates: jest.fn(() => []),
    getBubbleState: jest.fn(() => ({
      bubbleId: 'default',
      isVisible: true,
      lastUpdatedAt: 0,
      lastChangeSource: 'app',
    })),
    getBubbleStateById: jest.fn((bubbleId: string) => ({
      bubbleId,
      isVisible: true,
      lastUpdatedAt: 0,
      lastChangeSource: 'app',
    })),
    showBubble: jest.fn(async () => true),
    showBubbleInstance: jest.fn(async () => true),
  };

  jest.doMock('expo', () => ({
    requireOptionalNativeModule: jest.fn(() => nativeModule),
  }));

  return {
    api: require('../index') as typeof import('../index'),
    nativeModule,
  };
}

describe('bubble spawn coordinates', () => {
  it('forwards rounded x and y coordinates for a named bubble', async () => {
    const { api, nativeModule } = loadModule();

    await api.showBubble('alerts', { x: 24.4, y: 180.6 });

    expect(nativeModule.showBubbleInstance).toHaveBeenCalledWith('alerts', 24, 181);
  });

  it('supports one coordinate without replacing the other axis', async () => {
    const { api, nativeModule } = loadModule();

    await api.showBubble('horizontal', { x: 49.5 });
    await api.showBubble('vertical', { y: 320.2 });

    expect(nativeModule.showBubbleInstance).toHaveBeenNthCalledWith(
      1,
      'horizontal',
      50,
      undefined
    );
    expect(nativeModule.showBubbleInstance).toHaveBeenNthCalledWith(
      2,
      'vertical',
      undefined,
      320
    );
  });

  it('omits non-finite coordinates', async () => {
    const { api, nativeModule } = loadModule();

    await api.showBubble('invalid-position', { x: Number.NaN, y: Number.POSITIVE_INFINITY });

    expect(nativeModule.showBubbleInstance).toHaveBeenCalledWith(
      'invalid-position',
      undefined,
      undefined
    );
  });

  it('keeps the existing no-options calls', async () => {
    const { api, nativeModule } = loadModule();

    await api.showBubble();
    await api.showBubble('named');

    expect(nativeModule.showBubble).toHaveBeenCalledWith();
    expect(nativeModule.showBubbleInstance).toHaveBeenCalledWith('named');
  });

  it('forwards predefined locations to default and named bubbles', async () => {
    const { api, nativeModule } = loadModule();

    await api.showBubble(undefined, { location: 'bottom-center' });
    await api.showBubble('alerts', { location: 'center-right' });

    expect(nativeModule.showBubble).toHaveBeenCalledWith(
      undefined,
      undefined,
      'bottom-center'
    );
    expect(nativeModule.showBubbleInstance).toHaveBeenCalledWith(
      'alerts',
      undefined,
      undefined,
      'center-right'
    );
  });

  it('allows an explicit coordinate to override one predefined location axis', async () => {
    const { api, nativeModule } = loadModule();

    await api.showBubble('player', { location: 'bottom-left', x: 120.6 });

    expect(nativeModule.showBubbleInstance).toHaveBeenCalledWith(
      'player',
      121,
      undefined,
      'bottom-left'
    );
  });
});
