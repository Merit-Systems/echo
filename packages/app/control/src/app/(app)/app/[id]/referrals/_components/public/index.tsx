import React from 'react';

import { Body, Heading } from '@/app/(app)/_components/layout/page-utils';

import { Referrals } from '../lib/referrals';
import { ReferralBonus } from '../lib/referral-amount';

import { ReferralCode } from './code';

interface Props {
  appId: string;
  userId: string;
}

export const PublicReferralsPage: React.FC<Props> = async ({
  appId,
  userId,
}) => {
  return (
    <div>
      <Heading
        title="Referrals"
        description="Earn a percentage of this app's revenue by referring users to it."
      />
      <Body>
        <ReferralBonus
          appId={appId}
          title="Referral Bonus"
          description="This is the % of revenue that will be allocated to you when you refer new users to this app."
        />
        <ReferralCode appId={appId} />
        <Referrals
          appId={appId}
          referrerUserId={userId}
          title="Referrals"
          description="You referred these users to this app."
          hideReferrer
        />
      </Body>
    </div>
  );
};
