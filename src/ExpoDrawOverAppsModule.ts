import type { EventSubscription, NativeModule } from 'expo-modules-core';

import type { BubbleState } from './bubbleTypes';
import type { OverlaySharedValueState } from './overlaySharedValue';

type BubbleStateChangedEvent = BubbleState;
type BubbleStatesChangedEvent = {
  states: BubbleState[];
};
type OverlaySharedValueChangedEvent = OverlaySharedValueState;
type OverlaySharedValuesChangedEvent = {
  values: OverlaySharedValueState[];
};

type ExpoDrawOverAppsNativeModule = NativeModule<{
  onBubbleStateChanged(event: BubbleStateChangedEvent): void;
  onBubbleStatesChanged(event: BubbleStatesChangedEvent): void;
  onOverlaySharedValueChanged(event: OverlaySharedValueChangedEvent): void;
  onOverlaySharedValuesChanged(event: OverlaySharedValuesChangedEvent): void;
}> & {
  canDrawOverlays(): boolean;
  requestPermission(): Promise<boolean>;
  getBubbleState(): BubbleState;
  getBubbleStateById(bubbleId: string): BubbleState;
  getAllBubbleStates(): BubbleState[];
  getOverlaySharedValue(valueKey: string): OverlaySharedValueState;
  getAllOverlaySharedValues(): OverlaySharedValueState[];
  setOverlaySharedValue(valueKey: string, value: number, source?: string): number;
  showBubble(): Promise<boolean>;
  showBubbleInstance(bubbleId: string): Promise<boolean>;
  setEdgeHideEnabled(enabled: boolean): boolean;
  setEdgeHideEnabledForBubble(bubbleId: string, enabled: boolean): boolean;
  hideBubble(): boolean;
  hideBubbleInstance(bubbleId: string): boolean;
  hideAllBubbles(): boolean;
  closeBubble(): boolean;
  closeBubbleInstance(bubbleId: string): boolean;
  closeAllBubbles(): boolean;
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
  addListener(
    eventName: 'onOverlaySharedValueChanged',
    listener: (event: OverlaySharedValueChangedEvent) => void
  ): EventSubscription;
  addListener(
    eventName: 'onOverlaySharedValuesChanged',
    listener: (event: OverlaySharedValuesChangedEvent) => void
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
