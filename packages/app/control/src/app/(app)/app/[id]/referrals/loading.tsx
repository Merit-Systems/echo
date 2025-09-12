import { Body, Heading } from '../../../_components/layout/page-utils';

import { LoadingReferralBonus } from './_components/lib/referral-amount';

export default async function LoadingAppReferralsPage() {
  return (
    <div>
      <Heading title="Referrals" description={'\u00A0'} />
      <Body>
        <LoadingReferralBonus title="Referral Bonus" description={'\u00A0'} />
      </Body>
    </div>
  );
}
