'use client';

import { api } from '@/trpc/client';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

export default function TermsAgreement() {
  const session = useSession();

  const { data: needsTerms } = api.user.termsAgreement.needs.terms.useQuery(
    undefined,
    {
      enabled: !!session.data?.user,
    }
  );
  const { data: needsPrivacy } = api.user.termsAgreement.needs.privacy.useQuery(
    undefined,
    {
      enabled: !!session.data?.user,
    }
  );

  const utils = api.useUtils();

  const {
    mutate: acceptTerms,
    isPending: isAcceptingTerms,
    isSuccess: isAcceptedTerms,
  } = api.user.termsAgreement.accept.terms.useMutation({
    onSuccess: () => {
      void utils.user.termsAgreement.needs.terms.invalidate();
    },
  });

  const {
    mutate: acceptPrivacy,
    isPending: isAcceptingPrivacy,
    isSuccess: isAcceptedPrivacy,
  } = api.user.termsAgreement.accept.privacy.useMutation({
    onSuccess: () => {
      void utils.user.termsAgreement.needs.privacy.invalidate();
    },
  });

  const handleAccept = () => {
    acceptTerms(void 0, {
      onSuccess: () => {
        acceptPrivacy(void 0, {
          onSuccess: () => {
            toast.success('Terms of Service and Privacy Policy accepted');
          },
          onError: () => {
            toast.error('Failed to accept privacy policy');
          },
        });
      },
      onError: () => {
        toast.error('Failed to accept terms');
      },
    });
  };

  return (
    <AlertDialog
      open={Boolean(needsTerms?.needs) || Boolean(needsPrivacy?.needs)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Terms of Service and Privacy Policy
          </AlertDialogTitle>
          <AlertDialogDescription>
            {needsTerms?.currentVersion && needsPrivacy?.currentVersion ? (
              <>
                Our{' '}
                <Link href="/terms" target="_blank" className="underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" target="_blank" className="underline">
                  Privacy Policy
                </Link>{' '}
                have changed. Please accept the latest versions to continue.
              </>
            ) : (
              <>
                Please accept our{' '}
                <Link href="/terms" target="_blank" className="underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" target="_blank" className="underline">
                  Privacy Policy
                </Link>{' '}
                to continue.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={() => handleAccept()}
            className="flex-1"
            disabled={
              isAcceptingTerms ||
              isAcceptedTerms ||
              isAcceptingPrivacy ||
              isAcceptedPrivacy
            }
          >
            {isAcceptingTerms || isAcceptingPrivacy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isAcceptedTerms && isAcceptedPrivacy ? (
              <Check className="size-4" />
            ) : (
              'Accept Terms and Privacy Policy'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
