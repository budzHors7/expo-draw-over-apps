import { AppRegistry } from 'react-native';

import ExpoDrawOverAppsBubbleSurface from './ExpoDrawOverAppsBubbleSurface';

const BUBBLE_COMPONENT_NAME = 'ExpoDrawOverAppsBubble';

let isBubbleSurfaceRegistered = false;

export function ensureBubbleSurfaceRegistered() {
  if (isBubbleSurfaceRegistered) {
    return;
  }

  AppRegistry.registerComponent(BUBBLE_COMPONENT_NAME, () => ExpoDrawOverAppsBubbleSurface);
  isBubbleSurfaceRegistered = true;
}
