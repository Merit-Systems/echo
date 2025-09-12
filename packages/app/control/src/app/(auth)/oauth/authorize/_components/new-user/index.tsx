import type { AuthorizeParams } from '@/app/(auth)/_lib/authorize';
import Link from 'next/link';
import { WelcomePageCoupon } from './welcome-coupon';
import { ConnectionBeam } from '../connection-beam';

interface Props {
  name: string;
  profilePictureUrl: string | null;
  userImage: string | null;
  authParams: AuthorizeParams;
}

export const NewUserAuthorize: React.FC<Props> = async ({
  name,
  profilePictureUrl,
  authParams,
  userImage,
}) => {
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
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Sign In to {name}
          </h1>
          <h2 className="">
            As a new Echo user, you receive ${couponAmount.toFixed(2)} of free
            LLM credits
          </h2>
        </div>
      </div>
      <ConnectionBeam appImage={profilePictureUrl} userImage={userImage} />
      <div className="flex flex-col items-center gap-4 w-full">
        <WelcomePageCoupon
          amount={couponAmount}
          appName={name}
          authorizeParams={authParams}
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
          </Link>
          .
        </p>
      </div>
    </div>
  );
};
