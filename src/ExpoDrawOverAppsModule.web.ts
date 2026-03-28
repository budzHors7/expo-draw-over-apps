import { registerWebModule, NativeModule } from 'expo';

import { ExpoDrawOverAppsModuleEvents } from './ExpoDrawOverApps.types';

class ExpoDrawOverAppsModule extends NativeModule<ExpoDrawOverAppsModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoDrawOverAppsModule, 'ExpoDrawOverAppsModule');
