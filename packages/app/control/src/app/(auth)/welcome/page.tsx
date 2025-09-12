import { userOrRedirect } from '@/auth/user-or-redirect';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { Separator } from '@/components/ui/separator';
import { api } from '@/trpc/server';
import { Metadata, Route } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { WelcomePageCoupon } from './_components/coupon';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Welcome',
  description: 'The Easiest Way to Monetize AI Apps',
};

export default async function WelcomePage(props: PageProps<'/welcome'>) {
  const user = await userOrRedirect('/welcome', props);

  const searchParams = await props.searchParams;

  const callbackUrl =
    searchParams.callbackUrl && typeof searchParams.callbackUrl === 'string'
      ? searchParams.callbackUrl
      : '/';

  const redirectUrl = new URL(callbackUrl);
  if (redirectUrl.pathname === '/') {
    redirectUrl.pathname = '/dashboard';
  }
  redirectUrl.searchParams.set('new_user', 'true');

  const isAppAuthorize = callbackUrl.includes('/oauth/authorize');

  if (isAppAuthorize) {
    return redirect(redirectUrl.toString() as Route);
  }

  const hasClaimed = await api.user.initialFreeTier.hasClaimed();

  if (hasClaimed) {
    return redirect('/dashboard');
  }

  const couponAmount = Number.parseFloat(
    process.env.LATEST_FREE_TIER_CREDITS_ISSUANCE_AMOUNT ?? '0'
  );
  if (!Number.isFinite(couponAmount) || couponAmount <= 0) {
    throw new Error('LATEST_FREE_TIER_CREDITS_ISSUANCE_AMOUNT is not set');
  }

  const couponVersion = process.env.LATEST_FREE_TIER_CREDITS_ISSUANCE_VERSION;
  if (!couponVersion) {
    throw new Error('LATEST_FREE_TIER_CREDITS_ISSUANCE_VERSION is not set');
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full">
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
              : 'The Easiest Way to Monetize AI Apps'}
          </h2>
        </div>
      </div>
      <Separator />
      <div className="flex flex-col items-center gap-4 w-full">
        <p className="text-center">
          As a new Echo user, you get{' '}
          {formatCurrency(couponAmount, { notation: 'standard' })} of free LLM
          credits. <br />{' '}
          <span className="font-bold">
            We look forward to seeing what you build!
          </span>
        </p>
        <WelcomePageCoupon
          amount={couponAmount}
          callbackUrl={redirectUrl.toString() as Route}
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
