describe('bubble playground templates', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.doMock(
      'expo-draw-over-apps',
      () => ({
        ExpoDrawOverAppsComposeBubbleRenderer: jest.fn(() => null),
        ExpoDrawOverAppsNativeWindowContainer: jest.fn(({ children }) => children),
        ExpoDrawOverAppsReactNativeWindowContainer: jest.fn(({ children }) => children),
      }),
      { virtual: true }
    );
    jest.doMock(
      '@expo/ui/jetpack-compose',
      () => ({
        Box: 'Box',
        Button: 'Button',
        Column: 'Column',
        Host: 'Host',
        Row: 'Row',
        Shape: {
          RoundedCorner: 'Shape.RoundedCorner',
        },
        Slider: 'Slider',
        Surface: 'Surface',
        Text: 'Text',
      }),
      { virtual: true }
    );
    jest.doMock(
      '@expo/ui/jetpack-compose/modifiers',
      () => ({
        Shapes: {
          Circle: { type: 'circle' },
          RoundedCorner: (radius: number) => ({ type: 'roundedCorner', radius }),
        },
        align: jest.fn(),
        animateContentSize: jest.fn(),
        background: jest.fn(),
        border: jest.fn(),
        clip: jest.fn(),
        clickable: jest.fn(),
        fillMaxWidth: jest.fn(),
        graphicsLayer: jest.fn(),
        height: jest.fn(),
        padding: jest.fn(),
        paddingAll: jest.fn(),
        shadow: jest.fn(),
        size: jest.fn(),
        testID: jest.fn(),
        weight: jest.fn(),
        width: jest.fn(),
      }),
      { virtual: true }
    );
  });

  it('adds React Native and native Expo UI resize bubble examples', () => {
    const { BUBBLE_PLAYGROUND_TEMPLATES } = require('../../example/templates/bubblePlaygroundTemplate') as typeof import('../../example/templates/bubblePlaygroundTemplate');

    const resizeTemplates = BUBBLE_PLAYGROUND_TEMPLATES.filter((template) => template.id.includes('resize-bubble'));

    expect(resizeTemplates.map((template) => template.id)).toEqual([
      'react-native-resize-bubble',
      'expo-ui-resize-bubble',
    ]);
    expect(resizeTemplates.map((template) => template.title)).toEqual([
      'React Native Resize Bubble',
      'Native Expo UI Resize Bubble',
    ]);
    expect(resizeTemplates.map((template) => template.initialCount)).toEqual([1, 1]);
    expect(resizeTemplates.map((template) => template.tone)).toEqual(['resizeReactNative', 'resizeExpoUi']);
    resizeTemplates.forEach((template) => {
      expect(typeof template.renderer).toBe('function');
    });
  });
});
