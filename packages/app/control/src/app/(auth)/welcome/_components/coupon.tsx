'use client';

import { Route } from 'next';
import { WelcomeCoupon } from '../../_components/welcome-coupon';
import { useRouter } from 'next/navigation';

interface Props {
  amount: number;
  callbackUrl: Route;
}

export const WelcomePageCoupon = ({ amount, callbackUrl }: Props) => {
  const router = useRouter();
  return (
    <WelcomeCoupon amount={amount} onSuccess={() => router.push(callbackUrl)} />
  );
};
