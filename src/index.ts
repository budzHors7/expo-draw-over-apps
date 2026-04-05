import { getExpoDrawOverAppsModule } from './ExpoDrawOverAppsModule';
import {
  getBubbleState,
  incrementBubbleCount,
  setBubbleCount,
  setBubbleVisible,
  subscribeToBubbleState,
  useBubbleState,
} from './bubbleState';
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

  setBubbleVisible(true);
  const didShow = await ExpoDrawOverAppsModule.showBubble();
  if (!didShow) {
    setBubbleVisible(false);
  }
  return didShow;
}

export function hideBubble(): boolean {
  const ExpoDrawOverAppsModule = getExpoDrawOverAppsModule();
  setBubbleVisible(false);
  if (!ExpoDrawOverAppsModule) return false;
  return ExpoDrawOverAppsModule.hideBubble();
}

export function isBubbleVisible(): boolean {
  const ExpoDrawOverAppsModule = getExpoDrawOverAppsModule();
  if (!ExpoDrawOverAppsModule) {
    return getBubbleState().isVisible;
  }
  const nativeVisibility = ExpoDrawOverAppsModule.isBubbleVisible();
  if (nativeVisibility !== getBubbleState().isVisible) {
    setBubbleVisible(nativeVisibility);
  }
  return nativeVisibility;
}

export async function openApp(): Promise<boolean> {
  const ExpoDrawOverAppsModule = getExpoDrawOverAppsModule();
  if (!ExpoDrawOverAppsModule) return false;
  return await ExpoDrawOverAppsModule.openApp();
}

export {
  incrementBubbleCount,
  setBubbleCount,
  subscribeToBubbleState,
  useBubbleState,
};
