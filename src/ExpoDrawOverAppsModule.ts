type ExpoDrawOverAppsNativeModule = {
  canDrawOverlays(): boolean;
  requestPermission(): Promise<boolean>;
  showBubble(): Promise<boolean>;
  hideBubble(): boolean;
  isBubbleVisible(): boolean;
  openApp(): Promise<boolean>;
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
