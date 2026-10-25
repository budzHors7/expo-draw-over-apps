import React from 'react';

const TestRenderer = require('react-test-renderer');
const { StyleSheet } = require('react-native');

jest.mock('@expo/ui/jetpack-compose', () => ({
  Host: 'ComposeHost',
}));

jest.mock('../ExpoDrawOverAppsModule', () => ({
  getExpoDrawOverAppsModule: () => ({
    closeBubble: jest.fn(() => true),
    closeBubbleInstance: jest.fn(() => true),
    openApp: jest.fn(async () => true),
  }),
}));

jest.mock('../bubbleState', () => ({
  useBubbleState: () => ({
    bubbleId: 'default',
    isVisible: true,
    lastUpdatedAt: 0,
    lastChangeSource: 'app',
  }),
}));

jest.mock('../bubbleRenderer', () => ({
  useBubbleRenderer: () => null,
}));

import { NativeWindow, ReactNativeWindow } from '../ExpoDrawOverAppsWindows';
import ExpoDrawOverAppsBubbleSurface from '../ExpoDrawOverAppsBubbleSurface';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('window containers', () => {
  it('defaults NativeWindow to content-sized Compose and forwards Host props', () => {
    let renderer: any;

    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <NativeWindow colorScheme="dark" layoutDirection="rightToLeft" pointerEvents="box-none">
          <span>Compose content</span>
        </NativeWindow>
      );
    });

    const host = renderer!.root.findByType('ComposeHost');
    expect(host.props).toMatchObject({
      matchContents: true,
      colorScheme: 'dark',
      layoutDirection: 'rightToLeft',
      pointerEvents: 'box-none',
    });
    expect(host.findByType('span').children).toEqual(['Compose content']);
  });

  it('preserves an explicit false matchContents value', () => {
    let renderer: any;

    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <NativeWindow matchContents={false}>
          <span>Fixed host</span>
        </NativeWindow>
      );
    });

    expect(renderer!.root.findByType('ComposeHost').props.matchContents).toBe(false);
  });

  it('renders React Native children without applying non-finite animation targets', () => {
    let renderer: any;

    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <ReactNativeWindow width={Number.POSITIVE_INFINITY} height={Number.NaN} borderRadius={Number.NEGATIVE_INFINITY}>
          <span>React Native content</span>
        </ReactNativeWindow>
      );
    });

    const surface = renderer!.root.findByType('View');
    const renderedStyle = StyleSheet.flatten(surface.props.style);
    expect(renderedStyle).not.toHaveProperty('width');
    expect(renderedStyle).not.toHaveProperty('height');
    expect(renderedStyle.borderRadius).toBe(24);
    expect(renderer!.root.findByType('span').children).toEqual(['React Native content']);
  });

  it('removes non-finite dimensions supplied through the surface style', () => {
    let renderer: any;

    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <ReactNativeWindow
          style={{
            width: Number.POSITIVE_INFINITY,
            height: Number.NaN,
            borderRadius: Number.NEGATIVE_INFINITY,
            opacity: 0.75,
          }}
        >
          <span>Sanitized content</span>
        </ReactNativeWindow>
      );
    });

    const surface = renderer!.root.findByType('View');
    const renderedStyle = StyleSheet.flatten(surface.props.style);
    expect(renderedStyle).not.toHaveProperty('width');
    expect(renderedStyle).not.toHaveProperty('height');
    expect(renderedStyle.borderRadius).toBe(24);
    expect(renderedStyle.opacity).toBe(0.75);
  });

  it('keeps the unregistered surface to setup guidance and recovery actions', () => {
    let renderer: any;

    TestRenderer.act(() => {
      renderer = TestRenderer.create(<ExpoDrawOverAppsBubbleSurface />);
    });

    const text = renderer!.root
      .findAllByType('Text')
      .map((node: any) => node.children.join(''));
    expect(text).toEqual([
      'Register a bubble renderer with setBubbleRenderer or setBubbleRendererForBubble.',
      'Open app',
      'Close',
    ]);
  });
});
