import React from 'react';
import VersionedContentPage from '@site/src/components/VersionedContentPage';

export default function LatestDemo(): JSX.Element {
  return <VersionedContentPage pageKey="demo" routeSegment="latest" versionKey="56-beta" />;
}
