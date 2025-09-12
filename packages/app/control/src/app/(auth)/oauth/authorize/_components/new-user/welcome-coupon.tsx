'use client';

import { WelcomeCoupon } from '@/app/(auth)/_components/welcome-coupon';
import { AuthorizeParams } from '@/app/(auth)/_lib/authorize';
import { authorize } from '../../_actions/authorize';

interface Props {
  amount: number;
  appName: string;
  authorizeParams: AuthorizeParams;
}

export const WelcomePageCoupon = ({
  amount,
  appName,
  authorizeParams,
}: Props) => {
  return (
    <WelcomeCoupon
      amount={amount}
      onSuccess={() => authorize(authorizeParams)}
      states={{
        idle: 'Claim and Continue',
        processing: 'Claiming...',
        success: 'Continuing to App...',
      }}
      subText={
        <p className="text-sm">
          You can use these credits to make LLM requests on{' '}
          <strong>{appName}</strong> or
          <br />
          <strong>any other Echo app</strong>.
        </p>
      }
    />
  );
};
