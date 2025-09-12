import { Body, Heading } from '../../../_components/layout/page-utils';

import { LoadingBalance } from './_components/balance';
import { LoadingFreeTierDetails } from './_components/details';
import { LoadingPayments } from './_components/payments';
import { LoadingFreeTierUsersTable } from './_components/users';

export default function FreeTierLoading() {
  return (
    <div>
      <Heading
        title="Free Tier"
        description="Allow your users to test out your app for free before they have to buy credits and spend their echo balance."
      />
      <Body>
        <div className="flex flex-col gap-2">
          <LoadingBalance />
          <LoadingFreeTierDetails />
          <LoadingFreeTierUsersTable />
        </div>
        <LoadingPayments />
      </Body>
    </div>
  );
}
