import { getExpoDrawOverAppsModule } from './ExpoDrawOverAppsModule';
import {
  FloatingWindowPreview,
  createFloatingWindowPreviewState,
  getNextFloatingWindowPreviewState,
} from './FloatingWindowPreview';
import {
  ExpoDrawOverAppsComposeBubbleRenderer,
  setComposeBubbleRenderer,
} from './ExpoDrawOverAppsComposeBubbleRenderer';
import {
  NativeWindowContainer,
  ReactNativeWindowContainer,
} from './ExpoDrawOverAppsWindowContainers';
import {
  getAllBubbleStates,
  refreshBubbleState,
  subscribeToBubbleState,
  useAllBubbleStates,
  useBubbleState,
} from './bubbleState';
import { setBubbleRenderer, setBubbleRendererForBubble } from './bubbleRenderer';
import {
  getAllOverlaySharedValueStates,
  getOverlaySharedValueState,
  refreshAllOverlaySharedValueStates,
  refreshOverlaySharedValueState,
  setOverlaySharedValue,
  subscribeToOverlaySharedValueState,
  useAllOverlaySharedValueStates,
  useOverlaySharedValueState,
} from './overlaySharedValue';
import { ensureBubbleSurfaceRegistered } from './registerBubbleSurface';
import { DEFAULT_BUBBLE_ID, normalizeBubbleId, type BubbleDisplayOptions } from './bubbleTypes';

ensureBubbleSurfaceRegistered();

/**
 * Returns whether Android currently allows this app to draw over other apps.
 */
export function canDrawOverlays(): boolean {
  const ExpoDrawOverAppsModule = getExpoDrawOverAppsModule();
  if (!ExpoDrawOverAppsModule) return false;
  return ExpoDrawOverAppsModule.canDrawOverlays();
}

/**
 * Opens the Android overlay permission screen when permission is missing.
 */
export async function requestPermission(): Promise<boolean> {
  const ExpoDrawOverAppsModule = getExpoDrawOverAppsModule();
  if (!ExpoDrawOverAppsModule) return false;
  return await ExpoDrawOverAppsModule.requestPermission();
}

/**
 * Enables or disables edge-hide behavior for one named bubble.
 */
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

/**
 * Shows a named floating bubble and optionally applies display options first.
 */
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

/**
 * @deprecated Use `closeBubble`. This compatibility alias closes the overlay
 * surface and releases the React root.
 */
export function hideBubble(bubbleId: string = DEFAULT_BUBBLE_ID): boolean {
  return closeBubble(bubbleId);
}

/**
 * Closes one named floating bubble and releases its overlay surface.
 */
export function closeBubble(bubbleId: string = DEFAULT_BUBBLE_ID): boolean {
  const ExpoDrawOverAppsModule = getExpoDrawOverAppsModule();
  if (!ExpoDrawOverAppsModule) return false;

  const normalizedBubbleId = normalizeBubbleId(bubbleId);
  const didClose =
    normalizedBubbleId === DEFAULT_BUBBLE_ID
      ? ExpoDrawOverAppsModule.closeBubble()
      : ExpoDrawOverAppsModule.closeBubbleInstance(normalizedBubbleId);
  refreshBubbleState(normalizedBubbleId);
  return didClose;
}

/**
 * @deprecated Use `closeAllBubbles`. This compatibility alias closes overlay
 * surfaces and releases their React roots.
 */
export function hideAllBubbles(): boolean {
  return closeAllBubbles();
}

/**
 * Closes every floating bubble known to the native overlay service.
 */
export function closeAllBubbles(): boolean {
  const ExpoDrawOverAppsModule = getExpoDrawOverAppsModule();
  if (!ExpoDrawOverAppsModule) return false;
  const didClose = ExpoDrawOverAppsModule.closeAllBubbles();
  getAllBubbleStates();
  return didClose;
}

/**
 * Returns the latest known visibility state for one named bubble.
 */
export function isBubbleVisible(bubbleId: string = DEFAULT_BUBBLE_ID): boolean {
  const normalizedBubbleId = normalizeBubbleId(bubbleId);
  return refreshBubbleState(normalizedBubbleId).isVisible;
}

/**
 * Brings the host app to the foreground from a bubble action.
 */
export async function openApp(): Promise<boolean> {
  const ExpoDrawOverAppsModule = getExpoDrawOverAppsModule();
  if (!ExpoDrawOverAppsModule) return false;
  return await ExpoDrawOverAppsModule.openApp();
}

export {
  createFloatingWindowPreviewState,
  FloatingWindowPreview,
  getNextFloatingWindowPreviewState,
  getAllBubbleStates,
  getAllOverlaySharedValueStates,
  getOverlaySharedValueState,
  ExpoDrawOverAppsComposeBubbleRenderer,
  NativeWindowContainer,
  ReactNativeWindowContainer,
  refreshAllOverlaySharedValueStates,
  refreshOverlaySharedValueState,
  refreshBubbleState,
  setOverlaySharedValue,
  setComposeBubbleRenderer,
  setBubbleRenderer,
  setBubbleRendererForBubble,
  subscribeToOverlaySharedValueState,
  subscribeToBubbleState,
  useAllOverlaySharedValueStates,
  useAllBubbleStates,
  useOverlaySharedValueState,
  useBubbleState,
};

export type { FloatingWindowPreviewProps, FloatingWindowPreviewRenderProps } from './FloatingWindowPreview';
export type { BubbleRenderer, BubbleRendererProps } from './bubbleRenderer';
export type {
  NativeWindowContainerProps,
  WindowAnimationConfig,
  WindowContainerProps,
} from './ExpoDrawOverAppsWindowContainers';
export type { OverlaySharedValueState } from './overlaySharedValue';
export {
  DEFAULT_OVERLAY_SHARED_VALUE_KEY,
  MAX_OVERLAY_SHARED_VALUE_KEY_LENGTH,
  normalizeOverlaySharedValueKey,
} from './overlaySharedValue';
export { DEFAULT_BUBBLE_ID, MAX_BUBBLE_ID_LENGTH, normalizeBubbleId } from './bubbleTypes';
export type { BubbleChangeSource, BubbleDisplayOptions, BubbleState } from './bubbleTypes';
