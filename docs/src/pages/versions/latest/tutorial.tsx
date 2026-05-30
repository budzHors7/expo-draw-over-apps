import React from 'react';
import VersionedContentPage from '@site/src/components/VersionedContentPage';

export default function LatestTutorial(): JSX.Element {
  return <VersionedContentPage pageKey="tutorial" routeSegment="latest" versionKey="56" />;
}
