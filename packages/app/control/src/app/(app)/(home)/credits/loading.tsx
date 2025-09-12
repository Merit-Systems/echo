import { Heading, Body } from '../../_components/layout/page-utils';

import { LoadingBalance } from './_components/balance';
import { LoadingPayments } from './_components/payments';

export default async function CreditsPageLoading() {
  return (
    <div>
      <Heading
        title="Credits"
        description="These credits can be used to make LLM requests on any Echo app."
      />
      <Body>
        <LoadingBalance />
        <LoadingPayments />
      </Body>
    </div>
  );
}
