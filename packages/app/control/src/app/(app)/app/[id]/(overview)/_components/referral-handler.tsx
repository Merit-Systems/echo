'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/trpc/client';

interface Props {
  appId: string;
}

export const ReferralHandler: React.FC<Props> = ({ appId }) => {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('referral_code');
  const [processed, setProcessed] = useState(false);

  const utils = api.useUtils();
  const { mutateAsync: createMembership } =
    api.apps.app.memberships.create.useMutation();
  const { mutateAsync: updateReferrer } =
    api.apps.app.memberships.update.referrer.useMutation();

  useEffect(() => {
    if (!referralCode || processed) return;

    const processReferralCode = async () => {
      const referralCodeData = await utils.apps.app.referralCode.get.byCode
        .fetch(referralCode)
        .catch(() => null);

      if (!referralCodeData) {
        setProcessed(true);
        return;
      }

      const membership = await utils.apps.app.memberships.get
        .fetch({ appId })
        .catch(() => null);

      // Only update if user has no referrer yet
      if (membership?.referrerId === null) {
        await updateReferrer({
          appId,
          referrerId: referralCodeData.id,
        }).catch(() => {
          // Silently fail - user might already have a referrer from a race condition
        });
      }

      // Create membership if it doesn't exist
      if (!membership) {
        await createMembership({
          appId,
          referrerId: referralCodeData.id,
        }).catch(() => {
          // Silently fail - membership might have been created in the meantime
        });
      }

      setProcessed(true);
    };

    void processReferralCode();
  }, [referralCode, appId, createMembership, updateReferrer, processed, utils]);

  return null;
};
