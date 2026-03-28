import * as React from 'react';

import { ExpoDrawOverAppsViewProps } from './ExpoDrawOverApps.types';

export default function ExpoDrawOverAppsView(props: ExpoDrawOverAppsViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
