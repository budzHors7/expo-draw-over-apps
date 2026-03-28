import { NativeModule, requireNativeModule } from 'expo';

import { ExpoDrawOverAppsModuleEvents } from './ExpoDrawOverApps.types';

declare class ExpoDrawOverAppsModule extends NativeModule<ExpoDrawOverAppsModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoDrawOverAppsModule>('ExpoDrawOverApps');
