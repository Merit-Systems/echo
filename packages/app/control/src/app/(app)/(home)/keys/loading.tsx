import { Heading, Body } from '../../_components/layout/page-utils';

import { LoadingKeys } from './_components/keys';

export default async function LoadingKeysPage() {
  return (
    <div>
      <Heading title="API Keys" />
      <Body>
        <LoadingKeys />
      </Body>
    </div>
  );
}
