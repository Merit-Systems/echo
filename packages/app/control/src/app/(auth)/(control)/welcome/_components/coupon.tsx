'use client';

import { Route } from 'next';
import { WelcomeCoupon } from '../../../_components/welcome-coupon';
import { useRouter } from 'next/navigation';

interface Props {
  amount: number;
  callbackUrl: Route;
  hasClaimedFreeTier?: boolean;
  code?: string;
}

export const WelcomePageCoupon = ({
  amount,
  callbackUrl,
  code,
  hasClaimedFreeTier,
}: Props) => {
  const router = useRouter();

  return (
    <WelcomeCoupon
      amount={amount}
      onSuccess={() => router.push(code ? '/credits' : callbackUrl)}
      code={code}
      hasClaimedFreeTier={hasClaimedFreeTier}
    />
  );
};
