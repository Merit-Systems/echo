import { userOrRedirect } from '@/auth/user-or-redirect';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { Separator } from '@/components/ui/separator';
import { api } from '@/trpc/server';
import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { WelcomePageCoupon } from './_components/coupon';
import { formatCurrency } from '@/lib/utils';
import { env } from '@/env';

export const metadata: Metadata = {
  title: 'Welcome',
  description: 'User Pays AI SDK',
};

export default async function WelcomePage(props: PageProps<'/welcome'>) {
  const user = await userOrRedirect('/welcome', props);

  const searchParams = await props.searchParams;

  const callbackUrl =
    searchParams.callbackUrl && typeof searchParams.callbackUrl === 'string'
      ? searchParams.callbackUrl
      : `${env.NEXT_PUBLIC_APP_URL}/dashboard`;

  const redirectUrl = new URL(callbackUrl);
  if (redirectUrl.pathname === '/') {
    redirectUrl.pathname = '/dashboard';
  }
  redirectUrl.searchParams.set('new_user', 'true');

  const isAppAuthorize = callbackUrl.includes('/oauth/authorize');

  if (isAppAuthorize) {
    return redirect(redirectUrl.toString() as Route);
  }

  const isClaimCredits = callbackUrl.includes('/credits/claim');

  const hasClaimedFreeTier = await api.user.initialFreeTier.hasClaimed();

  if (!isClaimCredits) {
    if (hasClaimedFreeTier) {
      return redirect('/dashboard');
    }
  } else {
    redirectUrl.pathname = '/credits';
  }

  let couponAmount = 0;

  if (!hasClaimedFreeTier) {
    couponAmount += env.LATEST_FREE_TIER_CREDITS_ISSUANCE_AMOUNT;
  }

  let code: string | undefined = undefined;

  if (isClaimCredits) {
    // Extract the code from the callbackUrl, which should be in the format /credits/claim/{code}
    const match = /\/credits\/claim\/([^/?#]+)/.exec(callbackUrl);
    const creditGrantCode = match ? match[1] : undefined;
    if (creditGrantCode) {
      try {
        const coupon = await api.credits.grant.getWithUsages({
          code: creditGrantCode,
        });
        if (
          coupon.maxUsesPerUser &&
          coupon.maxUsesPerUser > coupon.usages.length
        ) {
          couponAmount += coupon.grantAmount;
          code = creditGrantCode;
          redirectUrl.pathname = '/credits';
        }
      } catch {}
    }
  }

  if (couponAmount === 0) {
    return redirect(redirectUrl.toString() as Route);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full">
      <div className="flex flex-col items-center gap-4 text-center">
        <Card className="size-20 p-2 border rounded-xl flex items-center justify-center bg-card">
          <Logo className="size-full" />
        </Card>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to Echo{user.name ? `, ${user.name.split(' ')[0]}!` : '!'}
          </h1>
          <h2 className="font-medium opacity-90 text-lg">
            {isAppAuthorize
              ? 'Your Global Account for AI Access'
              : 'User Pays AI SDK'}
          </h2>
        </div>
      </div>
      <Separator />
      <div className="flex flex-col items-center gap-4 w-full">
        <p className="text-center">
          {isClaimCredits ? (
            <span>
              You have been gifted{' '}
              {formatCurrency(couponAmount, { notation: 'standard' })} of free
              LLM credits.
            </span>
          ) : (
            <span>
              As a new Echo user, you get{' '}
              {formatCurrency(couponAmount, { notation: 'standard' })} of free
              LLM credits.
            </span>
          )}
          <br />
          <span className="font-bold">
            We look forward to seeing what you build!
          </span>
        </p>
        <WelcomePageCoupon
          amount={couponAmount}
          callbackUrl={redirectUrl.toString() as Route}
          code={code}
          hasClaimedFreeTier={hasClaimedFreeTier}
        />
        <p className="text-sm text-muted-foreground text-center">
          By claiming these credits, you agree to the
          <br />
          <Link
            href="/terms"
            target="_blank"
            className="underline font-semibold"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy"
            target="_blank"
            className="underline font-semibold"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
