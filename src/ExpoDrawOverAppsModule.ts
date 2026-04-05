import type { EventSubscription, NativeModule } from 'expo-modules-core';

import type { BubbleChangeSource, BubbleState } from './bubbleTypes';

type BubbleStateChangedEvent = BubbleState;

type ExpoDrawOverAppsNativeModule = NativeModule<{
  onBubbleStateChanged(event: BubbleStateChangedEvent): void;
}> & {
  canDrawOverlays(): boolean;
  requestPermission(): Promise<boolean>;
  getBubbleState(): BubbleState;
  setBubbleCount(count: number, source?: BubbleChangeSource): number;
  incrementBubbleCount(source?: BubbleChangeSource): number;
  decrementBubbleCount(source?: BubbleChangeSource): number;
  showBubble(): Promise<boolean>;
  hideBubble(): boolean;
  isBubbleVisible(): boolean;
  openApp(): Promise<boolean>;
  addListener(
    eventName: 'onBubbleStateChanged',
    listener: (event: BubbleStateChangedEvent) => void
  ): EventSubscription;
};

export function getExpoDrawOverAppsModule(): ExpoDrawOverAppsNativeModule | null {
  try {
    const { requireOptionalNativeModule } = require('expo-modules-core') as typeof import('expo-modules-core');
    return requireOptionalNativeModule<ExpoDrawOverAppsNativeModule>('ExpoDrawOverApps');
  } catch (error) {
    console.warn(
      `ExpoDrawOverApps native module is unavailable: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return null;
  }
}
