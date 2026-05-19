type NativeModuleMock = {
  addListener: jest.Mock;
  canDrawOverlays: jest.Mock;
  getAllBubbleStates: jest.Mock;
  getBubbleState: jest.Mock;
  getBubbleStateById: jest.Mock;
  showBubble: jest.Mock;
  showBubbleInstance: jest.Mock;
};

function loadModule(nativeOverrides: Partial<NativeModuleMock> = {}) {
  jest.resetModules();

  const nativeModule: NativeModuleMock = {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    canDrawOverlays: jest.fn(() => true),
    getAllBubbleStates: jest.fn(() => []),
    getBubbleState: jest.fn(),
    getBubbleStateById: jest.fn(),
    showBubble: jest.fn(async () => true),
    showBubbleInstance: jest.fn(async () => true),
    ...nativeOverrides,
  };

  jest.doMock('expo-modules-core', () => ({
    requireOptionalNativeModule: jest.fn(() => nativeModule),
  }));

  return {
    api: require('../index') as typeof import('../index'),
    nativeModule,
  };
}

describe('bubble id safety', () => {
  it('normalizes free-form bubble ids before sending them to native APIs', async () => {
    const { api, nativeModule } = loadModule();

    await api.showBubble('  alerts/user@example.com  ');

    expect(nativeModule.showBubbleInstance).toHaveBeenCalledWith('alerts-user-example.com');
  });

  it('uses the default bubble for ids that normalize to empty values', async () => {
    const { api, nativeModule } = loadModule();

    await api.showBubble('   ');

    expect(nativeModule.showBubble).toHaveBeenCalledTimes(1);
    expect(nativeModule.showBubbleInstance).not.toHaveBeenCalled();
  });
});
