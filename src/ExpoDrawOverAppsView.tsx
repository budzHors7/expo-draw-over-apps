import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoDrawOverAppsViewProps } from './ExpoDrawOverApps.types';

const NativeView: React.ComponentType<ExpoDrawOverAppsViewProps> =
  requireNativeView('ExpoDrawOverApps');

export default function ExpoDrawOverAppsView(props: ExpoDrawOverAppsViewProps) {
  return <NativeView {...props} />;
}
