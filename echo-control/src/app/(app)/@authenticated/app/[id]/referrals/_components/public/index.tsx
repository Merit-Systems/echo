import React from 'react';

import { unauthorized } from 'next/navigation';

import {
  Body,
  Heading,
} from '@/app/(app)/@authenticated/_components/layout/page-utils';

import { Referrals } from '../lib/referrals';
import { ReferralBonus } from '../lib/referral-amount';

import { ReferralCode } from './code';

import { auth } from '@/auth';

interface Props {
  appId: string;
}

export const PublicReferralsPage: React.FC<Props> = async ({ appId }) => {
  const session = await auth();

  if (!session?.user?.id) {
    return unauthorized();
  }

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
          referrerUserId={session.user.id}
          title="Referrals"
          description="You referred these users to this app."
          hideReferrer
        />
      </Body>
    </div>
  );
};
