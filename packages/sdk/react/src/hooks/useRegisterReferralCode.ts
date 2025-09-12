import { EchoClient } from '@merit-systems/echo-typescript-sdk';
import { useEffect } from 'react';

interface UseRegisterReferralCodeOptions {
  appId: string;
  client: EchoClient;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Custom hook to handle referral code registration from URL parameters.
 * Automatically checks for referralCode parameter in the URL and registers it for the given app.
 */
export function useRegisterReferralCode({
  appId,
  client,
  onSuccess,
  onError,
}: UseRegisterReferralCodeOptions) {
  useEffect(() => {
    const registerReferralCode = async () => {
      if (typeof window === 'undefined') return;

      const urlParams = new URLSearchParams(window.location.search);
      const referralCode = urlParams.get('referralCode');

      if (!referralCode) return;

      const result = await client.users.registerReferralCode(
        appId,
        referralCode
      );

      if (!result) return;

      // Clean up URL parameter
      urlParams.delete('referralCode');
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`
      );

      if (result.success) {
        onSuccess?.();
      } else {
        onError?.(result.message);
      }
    };

    registerReferralCode();
  }, [appId, client, onSuccess, onError]);
}
