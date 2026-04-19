import { getExpoDrawOverAppsModule } from './ExpoDrawOverAppsModule';
import {
  ExpoDrawOverAppsComposeBubbleRenderer,
  setComposeBubbleRenderer,
} from './ExpoDrawOverAppsComposeBubbleRenderer';
import {
  getAllBubbleStates,
  decrementBubbleCount,
  incrementBubbleCount,
  refreshBubbleState,
  setBubbleCount,
  subscribeToBubbleState,
  useAllBubbleStates,
  useBubbleState,
} from './bubbleState';
import { setBubbleRenderer, setBubbleRendererForBubble } from './bubbleRenderer';
import { ensureBubbleSurfaceRegistered } from './registerBubbleSurface';
import { DEFAULT_BUBBLE_ID, type BubbleDisplayOptions } from './bubbleTypes';

ensureBubbleSurfaceRegistered();

function normalizeBubbleId(bubbleId?: string): string {
  return bubbleId && bubbleId.trim().length > 0 ? bubbleId : DEFAULT_BUBBLE_ID;
}

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

export function setEdgeHideEnabled(
  enabled: boolean,
  bubbleId: string = DEFAULT_BUBBLE_ID
): boolean {
  const ExpoDrawOverAppsModule = getExpoDrawOverAppsModule();
  if (!ExpoDrawOverAppsModule) return false;

  const normalizedBubbleId = normalizeBubbleId(bubbleId);
  return normalizedBubbleId === DEFAULT_BUBBLE_ID
    ? ExpoDrawOverAppsModule.setEdgeHideEnabled(enabled)
    : ExpoDrawOverAppsModule.setEdgeHideEnabledForBubble(normalizedBubbleId, enabled);
}

export async function showBubble(
  bubbleId: string = DEFAULT_BUBBLE_ID,
  options?: BubbleDisplayOptions
): Promise<boolean> {
  const ExpoDrawOverAppsModule = getExpoDrawOverAppsModule();
  if (!ExpoDrawOverAppsModule) return false;

  const normalizedBubbleId = normalizeBubbleId(bubbleId);
  if (options?.edgeHideEnabled != null) {
    setEdgeHideEnabled(options.edgeHideEnabled, normalizedBubbleId);
  }
  const didShow =
    normalizedBubbleId === DEFAULT_BUBBLE_ID
      ? await ExpoDrawOverAppsModule.showBubble()
      : await ExpoDrawOverAppsModule.showBubbleInstance(normalizedBubbleId);
  refreshBubbleState(normalizedBubbleId);
  return didShow;
}

export function hideBubble(bubbleId: string = DEFAULT_BUBBLE_ID): boolean {
  const ExpoDrawOverAppsModule = getExpoDrawOverAppsModule();
  if (!ExpoDrawOverAppsModule) return false;

  const normalizedBubbleId = normalizeBubbleId(bubbleId);
  const didHide =
    normalizedBubbleId === DEFAULT_BUBBLE_ID
      ? ExpoDrawOverAppsModule.hideBubble()
      : ExpoDrawOverAppsModule.hideBubbleInstance(normalizedBubbleId);
  refreshBubbleState(normalizedBubbleId);
  return didHide;
}

export function hideAllBubbles(): boolean {
  const ExpoDrawOverAppsModule = getExpoDrawOverAppsModule();
  if (!ExpoDrawOverAppsModule) return false;
  const didHide = ExpoDrawOverAppsModule.hideAllBubbles();
  getAllBubbleStates();
  return didHide;
}

export function isBubbleVisible(bubbleId: string = DEFAULT_BUBBLE_ID): boolean {
  const normalizedBubbleId = normalizeBubbleId(bubbleId);
  return refreshBubbleState(normalizedBubbleId).isVisible;
}

export async function openApp(): Promise<boolean> {
  const ExpoDrawOverAppsModule = getExpoDrawOverAppsModule();
  if (!ExpoDrawOverAppsModule) return false;
  return await ExpoDrawOverAppsModule.openApp();
}

export {
  getAllBubbleStates,
  decrementBubbleCount,
  ExpoDrawOverAppsComposeBubbleRenderer,
  incrementBubbleCount,
  refreshBubbleState,
  setComposeBubbleRenderer,
  setBubbleCount,
  setBubbleRenderer,
  setBubbleRendererForBubble,
  subscribeToBubbleState,
  useAllBubbleStates,
  useBubbleState,
};

export type { BubbleRenderer, BubbleRendererProps } from './bubbleRenderer';
export { DEFAULT_BUBBLE_ID } from './bubbleTypes';
export type { BubbleChangeSource, BubbleDisplayOptions, BubbleState } from './bubbleTypes';
