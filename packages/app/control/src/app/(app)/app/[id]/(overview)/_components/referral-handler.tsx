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

  const { mutateAsync: registerReferral } =
    api.apps.app.registerReferral.useMutation();

  useEffect(() => {
    if (!referralCode || processed) return;

    const processReferralCode = async () => {
      await registerReferral({
        appId,
        code: referralCode,
      }).catch(() => {
        // Silently fail - referral code may be invalid, expired, or user may already have a referrer
      });

      setProcessed(true);
    };

    void processReferralCode();
  }, [referralCode, appId, registerReferral, processed]);

  return null;
};
