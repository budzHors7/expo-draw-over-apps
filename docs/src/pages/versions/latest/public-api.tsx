import React from 'react';
import VersionedContentPage from '@site/src/components/VersionedContentPage';

export default function LatestPublicApi(): JSX.Element {
  return <VersionedContentPage pageKey="public-api" routeSegment="latest" versionKey="56-beta" />;
}
