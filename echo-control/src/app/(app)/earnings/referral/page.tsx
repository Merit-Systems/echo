import { api, HydrateClient } from '@/trpc/server';

import { UserPayoutRecipient } from './_components/recipient';
import { PendingPayouts } from './_components/pending-payouts';
import { userOrRedirect } from '@/auth/user-or-redirect';
import { ClaimablePayouts } from './_components/claimable-payouts';
import { Body, Heading } from '@/app/(app)/_components/layout/page-utils';

export default async function ReferralEarningsPage(
  props: PageProps<'/earnings/referral'>
) {
  await userOrRedirect('/earnings/referral', props);

  void api.user.payout.referral.get.prefetch();
  void api.user.payout.referral.pending.prefetch();
  void api.user.githubLink.get.prefetch();

  return (
    <HydrateClient>
      <Heading
        title="Referral Rewards"
        description="View and claim your referral rewards across all apps."
      />
      <Body>
        <UserPayoutRecipient />

        <ClaimablePayouts />

        <PendingPayouts />
      </Body>
    </HydrateClient>
  );
}
