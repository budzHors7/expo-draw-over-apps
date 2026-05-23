import { useSyncExternalStore } from 'react';

import { getExpoDrawOverAppsModule } from './ExpoDrawOverAppsModule';
import type { BubbleChangeSource } from './bubbleTypes';

/**
 * Default key used when an overlay shared value key is empty or omitted.
 */
export const DEFAULT_OVERLAY_SHARED_VALUE_KEY = 'default';

/**
 * Maximum normalized length for overlay shared value keys.
 */
export const MAX_OVERLAY_SHARED_VALUE_KEY_LENGTH = 80;

const UNSAFE_SHARED_VALUE_KEY_PATTERN = /[^A-Za-z0-9._:-]+/g;
const REPEATED_DASH_PATTERN = /-+/g;

/**
 * Native-backed numeric value shared between the app and overlay renderers.
 */
export type OverlaySharedValueState = {
  /** Normalized key used by JavaScript and native Android code. */
  valueKey: string;
  /** Stored numeric value. Non-finite values are normalized to `0`. */
  value: number;
  /** Epoch timestamp for the last value change. */
  lastUpdatedAt: number;
  /** Side that last changed the value. */
  lastChangeSource: BubbleChangeSource;
};

type OverlaySharedValueListener = () => void;

const listeners = new Set<OverlaySharedValueListener>();

let hasBoundNativeSharedValueState = false;
let overlaySharedValues: Record<string, OverlaySharedValueState> = {
  [DEFAULT_OVERLAY_SHARED_VALUE_KEY]: createDefaultOverlaySharedValueState(
    DEFAULT_OVERLAY_SHARED_VALUE_KEY
  ),
};
let allOverlaySharedValuesSnapshot = createAllOverlaySharedValuesSnapshot(overlaySharedValues);

/**
 * Normalizes a shared value key before it is read from or written to native state.
 *
 * Unsupported characters become `-`, repeated dashes collapse, and empty values use
 * `DEFAULT_OVERLAY_SHARED_VALUE_KEY`.
 */
export function normalizeOverlaySharedValueKey(valueKey?: string): string {
  const normalizedValueKey = (valueKey ?? '')
    .trim()
    .replace(UNSAFE_SHARED_VALUE_KEY_PATTERN, '-')
    .replace(REPEATED_DASH_PATTERN, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_OVERLAY_SHARED_VALUE_KEY_LENGTH)
    .replace(/-+$/g, '');

  return normalizedValueKey.length > 0 ? normalizedValueKey : DEFAULT_OVERLAY_SHARED_VALUE_KEY;
}

function normalizeValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function normalizeChangeSource(source: BubbleChangeSource | string | undefined): BubbleChangeSource {
  return source === 'bubble' ? 'bubble' : 'app';
}

function createDefaultOverlaySharedValueState(valueKey: string): OverlaySharedValueState {
  return {
    valueKey,
    value: 0,
    lastUpdatedAt: Date.now(),
    lastChangeSource: 'app',
  };
}

function createAllOverlaySharedValuesSnapshot(states: Record<string, OverlaySharedValueState>) {
  return Object.values(states).sort((left, right) => left.valueKey.localeCompare(right.valueKey));
}

function emitOverlaySharedValueState() {
  for (const listener of listeners) {
    listener();
  }
}

function commitOverlaySharedValues(nextStates: Record<string, OverlaySharedValueState>) {
  overlaySharedValues = nextStates;
  allOverlaySharedValuesSnapshot = createAllOverlaySharedValuesSnapshot(nextStates);
}

function normalizeOverlaySharedValueState(
  nextState: Partial<OverlaySharedValueState>,
  valueKey?: string
): OverlaySharedValueState {
  const normalizedValueKey = normalizeOverlaySharedValueKey(nextState.valueKey ?? valueKey);
  const previousState =
    overlaySharedValues[normalizedValueKey] ?? createDefaultOverlaySharedValueState(normalizedValueKey);

  return {
    valueKey: normalizedValueKey,
    value: normalizeValue(nextState.value ?? previousState.value),
    lastUpdatedAt: Number(nextState.lastUpdatedAt ?? Date.now()),
    lastChangeSource: normalizeChangeSource(nextState.lastChangeSource ?? previousState.lastChangeSource),
  };
}

function updateOverlaySharedValues(nextStates: Partial<OverlaySharedValueState>[]) {
  let nextSharedValues: Record<string, OverlaySharedValueState> | null = null;

  for (const nextState of nextStates) {
    const normalizedState = normalizeOverlaySharedValueState(nextState);
    const currentStates = nextSharedValues ?? overlaySharedValues;
    const previousState = currentStates[normalizedState.valueKey];

    if (
      !previousState ||
      previousState.value !== normalizedState.value ||
      previousState.lastUpdatedAt !== normalizedState.lastUpdatedAt ||
      previousState.lastChangeSource !== normalizedState.lastChangeSource
    ) {
      nextSharedValues ??= { ...overlaySharedValues };
      nextSharedValues[normalizedState.valueKey] = normalizedState;
    }
  }

  if (nextSharedValues) {
    commitOverlaySharedValues(nextSharedValues);
    emitOverlaySharedValueState();
  }
}

function bindNativeOverlaySharedValueState() {
  if (hasBoundNativeSharedValueState) {
    return;
  }

  const nativeModule = getExpoDrawOverAppsModule();
  if (!nativeModule) {
    return;
  }

  hasBoundNativeSharedValueState = true;
  updateOverlaySharedValues(nativeModule.getAllOverlaySharedValues());

  nativeModule.addListener('onOverlaySharedValueChanged', (nextState) => {
    updateOverlaySharedValues([nextState]);
  });

  nativeModule.addListener('onOverlaySharedValuesChanged', (event) => {
    updateOverlaySharedValues(event.values);
  });
}

function syncOverlaySharedValuesFromNative() {
  const nativeModule = getExpoDrawOverAppsModule();
  if (!nativeModule) {
    return getAllOverlaySharedValueStates();
  }

  const nextStates = nativeModule.getAllOverlaySharedValues();
  updateOverlaySharedValues(nextStates);
  return allOverlaySharedValuesSnapshot;
}

/**
 * Returns the latest known shared value state for one key.
 */
export function getOverlaySharedValueState(
  valueKey: string = DEFAULT_OVERLAY_SHARED_VALUE_KEY
): OverlaySharedValueState {
  bindNativeOverlaySharedValueState();
  const normalizedValueKey = normalizeOverlaySharedValueKey(valueKey);
  const existingState = overlaySharedValues[normalizedValueKey];
  if (existingState) {
    return existingState;
  }

  const defaultState = createDefaultOverlaySharedValueState(normalizedValueKey);
  commitOverlaySharedValues({
    ...overlaySharedValues,
    [normalizedValueKey]: defaultState,
  });
  return defaultState;
}

/**
 * Returns the latest known shared value state for every key.
 */
export function getAllOverlaySharedValueStates(): OverlaySharedValueState[] {
  bindNativeOverlaySharedValueState();
  return allOverlaySharedValuesSnapshot;
}

/**
 * Reads native state and returns the latest shared value state for one key.
 */
export function refreshOverlaySharedValueState(
  valueKey: string = DEFAULT_OVERLAY_SHARED_VALUE_KEY
): OverlaySharedValueState {
  bindNativeOverlaySharedValueState();
  syncOverlaySharedValuesFromNative();
  return getOverlaySharedValueState(valueKey);
}

/**
 * Reads native state and returns the latest shared value state for every key.
 */
export function refreshAllOverlaySharedValueStates(): OverlaySharedValueState[] {
  bindNativeOverlaySharedValueState();
  return syncOverlaySharedValuesFromNative();
}

/**
 * Subscribes to shared value changes and returns an unsubscribe function.
 */
export function subscribeToOverlaySharedValueState(
  listener: OverlaySharedValueListener
): () => void {
  bindNativeOverlaySharedValueState();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * React hook for the latest shared value state of one key.
 */
export function useOverlaySharedValueState(
  valueKey: string = DEFAULT_OVERLAY_SHARED_VALUE_KEY
): OverlaySharedValueState {
  return useSyncExternalStore(
    subscribeToOverlaySharedValueState,
    () => getOverlaySharedValueState(valueKey),
    () => getOverlaySharedValueState(valueKey)
  );
}

/**
 * React hook for the latest shared value state of every key.
 */
export function useAllOverlaySharedValueStates(): OverlaySharedValueState[] {
  return useSyncExternalStore(
    subscribeToOverlaySharedValueState,
    getAllOverlaySharedValueStates,
    getAllOverlaySharedValueStates
  );
}

/**
 * Stores a numeric shared value in native state and returns the committed value.
 */
export function setOverlaySharedValue(
  valueKey: string,
  value: number,
  source: BubbleChangeSource = 'app'
): number {
  bindNativeOverlaySharedValueState();
  const normalizedValueKey = normalizeOverlaySharedValueKey(valueKey);
  const nextValue = normalizeValue(value);
  const nativeModule = getExpoDrawOverAppsModule();

  if (!nativeModule) {
    updateOverlaySharedValues([
      {
        valueKey: normalizedValueKey,
        value: nextValue,
        lastChangeSource: source,
        lastUpdatedAt: Date.now(),
      },
    ]);
    return getOverlaySharedValueState(normalizedValueKey).value;
  }

  const committedValue = nativeModule.setOverlaySharedValue(normalizedValueKey, nextValue, source);
  syncOverlaySharedValuesFromNative();
  return committedValue;
}
