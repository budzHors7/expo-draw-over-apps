import type { ReactElement, ReactNode } from 'react';

jest.mock('react', () => {
  const actual = jest.requireActual<typeof import('react')>('react');
  return {
    ...actual,
    useEffect: (effect: () => void) => effect(),
  };
});

jest.mock('@expo/ui/jetpack-compose', () => ({
  Host: 'ExpoUiHost',
}));

jest.mock('expo', () => ({
  requireOptionalNativeModule: jest.fn(() => null),
}));

function collectText(node: ReactNode): string[] {
  if (typeof node === 'string') return [node];
  if (Array.isArray(node)) return node.flatMap(collectText);
  if (node == null || typeof node !== 'object' || !('props' in node)) return [];
  return collectText((node as ReactElement<{ children?: ReactNode }>).props.children);
}

describe('window APIs', () => {
  it('exports only the two hard-cut window component names', () => {
    const api = require('../index') as Record<string, unknown>;

    expect(api.ReactNativeWindow).toEqual(expect.any(Function));
    expect(api.NativeWindow).toEqual(expect.any(Function));
    expect(api.ReactNativeWindowContainer).toBeUndefined();
    expect(api.NativeWindowContainer).toBeUndefined();
    expect(api.ExpoDrawOverAppsComposeBubbleRenderer).toBeUndefined();
    expect(api.setComposeBubbleRenderer).toBeUndefined();
  });

  it('defaults NativeWindow matchContents and preserves an explicit false value', () => {
    const { NativeWindow } = require('../ExpoDrawOverAppsWindows') as typeof import('../ExpoDrawOverAppsWindows');

    const defaultWindow = NativeWindow({ children: 'Native content', colorScheme: 'dark' });
    const fixedWindow = NativeWindow({ children: 'Fixed content', matchContents: false });

    expect(defaultWindow.type).toBe('ExpoUiHost');
    expect(defaultWindow.props).toMatchObject({
      children: 'Native content',
      colorScheme: 'dark',
      matchContents: true,
    });
    expect(fixedWindow.props.matchContents).toBe(false);
  });

  it('renders React Native children and ignores non-finite size targets', () => {
    const { ReactNativeWindow } = require('../ExpoDrawOverAppsWindows') as typeof import('../ExpoDrawOverAppsWindows');

    const window = ReactNativeWindow({
      children: 'React Native content',
      width: Number.POSITIVE_INFINITY,
      height: Number.NaN,
    });
    const animatedStyle = window.props.style.at(-1);
    const content = window.props.children as ReactElement<{ children?: ReactNode }>;

    expect(animatedStyle).toMatchObject({ width: undefined, height: undefined });
    expect(content.props.children).toBe('React Native content');
  });

  it('keeps the unregistered surface to setup guidance and recovery actions', () => {
    jest.resetModules();
    (globalThis as typeof globalThis & { React: typeof import('react') }).React = require('react');
    jest.doMock('../bubbleState', () => ({
      useBubbleState: () => ({
        bubbleId: 'default',
        isVisible: true,
        lastUpdatedAt: 0,
        lastChangeSource: 'app',
      }),
    }));
    jest.doMock('../bubbleRenderer', () => ({ useBubbleRenderer: () => null }));
    jest.doMock('../ExpoDrawOverAppsModule', () => ({
      getExpoDrawOverAppsModule: () => ({
        closeBubble: jest.fn(() => true),
        openApp: jest.fn(async () => true),
      }),
    }));

    const BubbleSurface = require('../ExpoDrawOverAppsBubbleSurface').default as (
      props: { bubbleId?: string }
    ) => ReactElement;
    const surface = BubbleSurface({});

    expect(collectText(surface)).toEqual([
      'Register a bubble renderer to supply your window UI.',
      'Open app',
      'Close',
    ]);
  });
});
