import { getExpoDrawOverAppsModule } from './ExpoDrawOverAppsModule';
import {
  decrementBubbleCount,
  incrementBubbleCount,
  refreshBubbleState,
  setBubbleCount,
  subscribeToBubbleState,
  useBubbleState,
} from './bubbleState';
import { setBubbleRenderer } from './bubbleRenderer';
import { ensureBubbleSurfaceRegistered } from './registerBubbleSurface';

ensureBubbleSurfaceRegistered();

export function canDrawOverlays(): boolean {
  const ExpoDrawOverAppsModule = getExpoDrawOverAppsModule();
  if (!ExpoDrawOverAppsModule) return false;
  return ExpoDrawOverAppsModule.canDrawOverlays();
}

export async function requestPermission(): Promise<boolean> {
  const ExpoDrawOverAppsModule = getExpoDrawOverAppsModule();
  if (!ExpoDrawOverAppsModule) return false;
  return await ExpoDrawOverAppsModule.requestPermission();
}

export async function showBubble(): Promise<boolean> {
  const ExpoDrawOverAppsModule = getExpoDrawOverAppsModule();
  if (!ExpoDrawOverAppsModule) return false;

  const didShow = await ExpoDrawOverAppsModule.showBubble();
  refreshBubbleState();
  return didShow;
}

export function hideBubble(): boolean {
  const ExpoDrawOverAppsModule = getExpoDrawOverAppsModule();
  if (!ExpoDrawOverAppsModule) return false;
  const didHide = ExpoDrawOverAppsModule.hideBubble();
  refreshBubbleState();
  return didHide;
}

export function isBubbleVisible(): boolean {
  const ExpoDrawOverAppsModule = getExpoDrawOverAppsModule();
  if (!ExpoDrawOverAppsModule) {
    return refreshBubbleState().isVisible;
  }
  return refreshBubbleState().isVisible;
}

export async function openApp(): Promise<boolean> {
  const ExpoDrawOverAppsModule = getExpoDrawOverAppsModule();
  if (!ExpoDrawOverAppsModule) return false;
  return await ExpoDrawOverAppsModule.openApp();
}

export {
  decrementBubbleCount,
  incrementBubbleCount,
  refreshBubbleState,
  setBubbleCount,
  setBubbleRenderer,
  subscribeToBubbleState,
  useBubbleState,
};

export type { BubbleRenderer, BubbleRendererProps } from './bubbleRenderer';
export type { BubbleChangeSource, BubbleState } from './bubbleTypes';
