describe('bubble playground templates', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.doMock(
      'expo-draw-over-apps',
      () => ({
        NativeWindow: jest.fn(({ children }) => children),
        ReactNativeWindow: jest.fn(({ children }) => children),
      }),
      { virtual: true }
    );
    jest.doMock(
      '@expo/ui/jetpack-compose',
      () => ({
        Button: 'Button',
        Column: 'Column',
        Surface: 'Surface',
        Text: 'Text',
      }),
      { virtual: true }
    );
    jest.doMock(
      '@expo/ui/jetpack-compose/modifiers',
      () => ({
        Shapes: {
          RoundedCorner: (radius: number) => ({ type: 'roundedCorner', radius }),
        },
        animateContentSize: jest.fn(),
        fillMaxWidth: jest.fn(),
        paddingAll: jest.fn(),
        size: jest.fn(),
      }),
      { virtual: true }
    );
  });

  it('contains exactly the React Native and native SDK 58 windows', () => {
    const { BUBBLE_PLAYGROUND_TEMPLATES } = require('../../example/templates/bubblePlaygroundTemplate') as typeof import('../../example/templates/bubblePlaygroundTemplate');

    expect(BUBBLE_PLAYGROUND_TEMPLATES).toHaveLength(2);
    expect(BUBBLE_PLAYGROUND_TEMPLATES.map((template) => template.id)).toEqual([
      'react-native-window',
      'native-window',
    ]);
    expect(BUBBLE_PLAYGROUND_TEMPLATES.map((template) => template.title)).toEqual([
      'React Native Window',
      'Native Window',
    ]);
    BUBBLE_PLAYGROUND_TEMPLATES.forEach((template) => {
      expect(typeof template.renderer).toBe('function');
    });
  });
});
