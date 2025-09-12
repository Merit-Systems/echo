'use client';

import { Coupon } from '@/components/coupon';
import { STATES } from '@/components/coupon/multi-state-button';
import { api } from '@/trpc/client';
import { toast } from 'sonner';

interface Props {
  amount: number;
  onSuccess: () => void;
  states?: STATES;
  subText?: React.ReactNode;
}

export const WelcomeCoupon: React.FC<Props> = ({
  amount,
  onSuccess,
  states,
  subText,
}) => {
  const utils = api.useUtils();

  const {
    mutate: claimCoupon,
    isPending: isClaimingCoupon,
    isSuccess: isClaimedCoupon,
  } = api.user.initialFreeTier.issue.useMutation({
    onSuccess: () => {
      utils.user.initialFreeTier.hasClaimed.invalidate();
      setTimeout(() => {
        toast.success('Credits Claimed!');
        onSuccess();
      }, 500);
    },
    onError: () => {
      toast.error('Failed to claim credits');
    },
  });

  const {
    mutate: signPrivacy,
    isPending: isSigningPrivacy,
    isSuccess: isSignedPrivacy,
  } = api.user.termsAgreement.accept.privacy.useMutation({
    onSuccess: () => {
      utils.user.termsAgreement.needs.privacy.invalidate();
    },
    onError: () => {
      toast.error('Failed to accept privacy policy');
    },
  });

  const {
    mutate: signTerms,
    isPending: isSigningTerms,
    isSuccess: isSignedTerms,
  } = api.user.termsAgreement.accept.terms.useMutation({
    onSuccess: () => {
      utils.user.termsAgreement.needs.terms.invalidate();
    },
    onError: () => {
      toast.error('Failed to accept terms');
    },
  });

  return (
    <Coupon
      value={amount}
      onClaim={() =>
        signTerms(void 0, {
          onSuccess: () => {
            signPrivacy(void 0, { onSuccess: () => claimCoupon() });
          },
        })
      }
      isClaiming={isClaimingCoupon || isSigningTerms || isSigningPrivacy}
      isClaimed={isClaimedCoupon && isSignedTerms && isSignedPrivacy}
      states={states}
      subText={subText}
    />
  );
};
