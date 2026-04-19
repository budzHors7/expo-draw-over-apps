import type { EventSubscription, NativeModule } from 'expo-modules-core';

import type { BubbleChangeSource, BubbleState } from './bubbleTypes';

type BubbleStateChangedEvent = BubbleState;
type BubbleStatesChangedEvent = {
  states: BubbleState[];
};

type ExpoDrawOverAppsNativeModule = NativeModule<{
  onBubbleStateChanged(event: BubbleStateChangedEvent): void;
  onBubbleStatesChanged(event: BubbleStatesChangedEvent): void;
}> & {
  canDrawOverlays(): boolean;
  requestPermission(): Promise<boolean>;
  getBubbleState(): BubbleState;
  getBubbleStateById(bubbleId: string): BubbleState;
  getAllBubbleStates(): BubbleState[];
  setBubbleCount(count: number, source?: BubbleChangeSource): number;
  setBubbleCountForBubble(bubbleId: string, count: number, source?: BubbleChangeSource): number;
  incrementBubbleCount(source?: BubbleChangeSource): number;
  incrementBubbleCountForBubble(bubbleId: string, source?: BubbleChangeSource): number;
  decrementBubbleCount(source?: BubbleChangeSource): number;
  decrementBubbleCountForBubble(bubbleId: string, source?: BubbleChangeSource): number;
  showBubble(): Promise<boolean>;
  showBubbleInstance(bubbleId: string): Promise<boolean>;
  setEdgeHideEnabled(enabled: boolean): boolean;
  setEdgeHideEnabledForBubble(bubbleId: string, enabled: boolean): boolean;
  hideBubble(): boolean;
  hideBubbleInstance(bubbleId: string): boolean;
  hideAllBubbles(): boolean;
  isBubbleVisible(): boolean;
  isBubbleVisibleForBubble(bubbleId: string): boolean;
  openApp(): Promise<boolean>;
  addListener(
    eventName: 'onBubbleStateChanged',
    listener: (event: BubbleStateChangedEvent) => void
  ): EventSubscription;
  addListener(
    eventName: 'onBubbleStatesChanged',
    listener: (event: BubbleStatesChangedEvent) => void
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
