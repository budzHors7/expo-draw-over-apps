type OverlaySharedValueState = {
  valueKey: string;
  value: number;
  lastUpdatedAt: number;
  lastChangeSource: 'app' | 'bubble';
};

function createState(valueKey: string, value = 0): OverlaySharedValueState {
  return {
    valueKey,
    value,
    lastUpdatedAt: Date.now(),
    lastChangeSource: 'app',
  };
}

function loadModule(initialStates: OverlaySharedValueState[] = []) {
  jest.resetModules();

  const values = new Map<string, OverlaySharedValueState>(
    initialStates.map((state) => [state.valueKey, state])
  );

  const nativeModule = {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    getAllOverlaySharedValues: jest.fn(() => Array.from(values.values())),
    getOverlaySharedValue: jest.fn((valueKey: string) => values.get(valueKey) ?? createState(valueKey)),
    setOverlaySharedValue: jest.fn((valueKey: string, value: number, source = 'app') => {
      values.set(valueKey, {
        valueKey,
        value,
        lastUpdatedAt: Date.now(),
        lastChangeSource: source === 'bubble' ? 'bubble' : 'app',
      });
      return value;
    }),
  };

  jest.doMock('expo-modules-core', () => ({
    requireOptionalNativeModule: jest.fn(() => nativeModule),
  }));

  return {
    api: require('../index') as typeof import('../index'),
    nativeModule,
    values,
  };
}

describe('overlay shared values', () => {
  it('normalizes keys and commits numeric values through native state', () => {
    const { api, nativeModule } = loadModule();

    const value = api.setOverlaySharedValue(' resize/window @ user ', 3.6, 'bubble');

    expect(value).toBe(3.6);
    expect(nativeModule.setOverlaySharedValue).toHaveBeenCalledWith(
      'resize-window-user',
      3.6,
      'bubble'
    );
    expect(api.getOverlaySharedValueState('resize-window-user')).toMatchObject({
      valueKey: 'resize-window-user',
      value: 3.6,
      lastChangeSource: 'bubble',
    });
  });

  it('refreshes all shared values from native after background updates', () => {
    const { api, values } = loadModule([createState('window-container-counter', 1)]);

    values.set('window-container-counter', {
      valueKey: 'window-container-counter',
      value: 4,
      lastUpdatedAt: Date.now(),
      lastChangeSource: 'bubble',
    });

    expect(api.refreshAllOverlaySharedValueStates()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        valueKey: 'window-container-counter',
        value: 4,
        lastChangeSource: 'bubble',
      }),
    ]));
  });
});
