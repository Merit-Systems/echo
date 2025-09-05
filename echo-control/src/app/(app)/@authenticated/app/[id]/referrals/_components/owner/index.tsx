import React from 'react';

import { Body, Heading } from '../../../../../_components/layout/page-utils';

import { ReferralBonus } from '../lib/referral-amount';
import { Referrals } from '../lib/referrals';
import { UpdateReferralBonusDialog } from './update-dialog';

interface Props {
  appId: string;
}

export const OwnerReferralsPage: React.FC<Props> = ({ appId }) => {
  return (
    <div>
      <Heading
        title="Referrals"
        description="Incentivize users to share your app by allocating a percentage of the revenue to them."
      />
      <Body>
        <ReferralBonus
          appId={appId}
          title="Referral Bonus"
          description="This is the % of revenue that will be allocated to users who refer new users."
        >
          <UpdateReferralBonusDialog appId={appId} />
        </ReferralBonus>
        <Referrals
          appId={appId}
          referrerUserId="any"
          title="Referrals"
          description="These users were referred to your app by other users."
        />
      </Body>
    </div>
  );
};
