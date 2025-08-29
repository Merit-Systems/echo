'use client';

export { EchoReferrals } from './components/referrals';

export interface EchoClientConfig {
  basePath?: string;
  appId: string;
}

/**
 * Sign in to Echo (client-side only)
 * Automatically includes stored referral code if available
 */
export function signIn(config?: EchoClientConfig) {
  if (typeof window === 'undefined') {
    console.warn('signIn() can only be called in client components');
    return;
  }

  const basePath = config?.basePath || '/api/echo';
  let signInUrl = `${window.location.origin}${basePath}/signin`;

  // Add referral code if available
  if (config?.appId) {
    const referralCode = getReferralCode(config.appId);
    if (referralCode) {
      signInUrl += `?referral_code=${encodeURIComponent(referralCode)}`;
    }
  }

  window.location.href = signInUrl;
}

/**
 * Get stored referral code for an app
 */
export function getReferralCode(appId: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`echo_referral_${appId}`);
}
