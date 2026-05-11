import { EchoClient } from '@merit-systems/echo-typescript-sdk';
import { useEffect } from 'react';

interface UseRegisterReferralCodeOptions {
  appId: string;
  client: EchoClient;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

function readPublicEnv(name: string): string | undefined {
  const maybeGlobal = globalThis as unknown as {
    import?: { meta?: { env?: Record<string, string | undefined> } };
    process?: { env?: Record<string, string | undefined> };
  };

  return maybeGlobal.import?.meta?.env?.[name] || maybeGlobal.process?.env?.[name];
}

function getConfiguredReferralCode(): string | null {
  if (typeof window === 'undefined') return null;

  const urlParams = new URLSearchParams(window.location.search);
  return (
    urlParams.get('referral_code') ||
    urlParams.get('referralCode') ||
    readPublicEnv('VITE_ECHO_REFERRAL_CODE') ||
    readPublicEnv('NEXT_PUBLIC_ECHO_REFERRAL_CODE') ||
    readPublicEnv('REACT_APP_ECHO_REFERRAL_CODE') ||
    null
  );
}

function removeReferralParamsFromUrl(): void {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.delete('referral_code');
  urlParams.delete('referralCode');
  window.history.replaceState(
    {},
    '',
    `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`
  );
}

/**
 * Custom hook to handle referral code registration from URL parameters or
 * framework-public environment variables injected by echo-start external templates.
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

      const referralCode = getConfiguredReferralCode();

      if (!referralCode) return;

      const result = await client.users.registerReferralCode(
        appId,
        referralCode
      );

      if (!result) return;

      // Clean up URL parameters while leaving env-provided referral codes intact.
      removeReferralParamsFromUrl();

      if (result.success) {
        onSuccess?.();
      } else {
        onError?.(result.message);
      }
    };

    registerReferralCode();
  }, [appId, client, onSuccess, onError]);
}
