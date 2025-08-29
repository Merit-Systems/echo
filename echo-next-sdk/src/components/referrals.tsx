'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { EchoConfig } from 'types';

export function EchoReferrals(config: EchoConfig) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const referralCode = searchParams.get('referral_code');
    if (referralCode && typeof window !== 'undefined') {
      const key = `echo_referral_${config.appId}`;
      localStorage.setItem(key, referralCode);

      // Remove referral code from URL
      const url = new URL(window.location.href);
      if (url.searchParams.has('referral_code')) {
        url.searchParams.delete('referral_code');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [searchParams, config.appId]);

  return null;
}
