import { Body, Heading } from '../../_components/layout/page-utils';

import { LoadingApps } from './_components/apps';

export default function MyAppsLoadingPage() {
  return (
    <div>
      <Heading
        title="My Apps"
        description="Applications that you own and manage"
      />
      <Body>
        <LoadingApps />
      </Body>
    </div>
  );
}
