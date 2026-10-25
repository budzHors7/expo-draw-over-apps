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
        Shape: { RoundedCorner: 'Shape.RoundedCorner' },
        Surface: 'Surface',
        Text: 'Text',
      }),
      { virtual: true }
    );
    jest.doMock(
      '@expo/ui/jetpack-compose/modifiers',
      () => ({
        animateContentSize: jest.fn(),
        paddingAll: jest.fn(),
        size: jest.fn(),
      }),
      { virtual: true }
    );
  });

  it('offers only one React Native window and one native Compose window', () => {
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
