import React, { Suspense } from 'react';

import { Card } from '@/components/ui/card';
import { CopyCode } from '@/components/ui/copy-code';

import { api } from '@/trpc/server';

interface Props {
  appId: string;
}

export const ReferralCode: React.FC<Props> = async ({ appId }) => {
  return (
    <Card className="border rounded-lg overflow-hidden flex flex-col gap-2 p-4">
      <h1 className="text-base font-semibold text-muted-foreground">
        Your Referral Link
      </h1>
      <div className="w-full">
        <Suspense fallback={<CopyCode isLoading />}>
          <ReferralCodeContent appId={appId} />
        </Suspense>
      </div>
      <p className="text-sm text-muted-foreground">
        You will receive the referral bonus for each user who signs up using
        your link.
      </p>
    </Card>
  );
};

const ReferralCodeContent = async ({ appId }: { appId: string }) => {
  let referralCode = await api.apps.app.referralCode.get.byUser(appId);

  if (!referralCode) {
    referralCode = await api.apps.app.referralCode.create({
      appId,
    });

    if (!referralCode) {
      return null;
    }
  }
  return (
    <CopyCode
      code={referralCode.referralLinkUrl}
      toastMessage="Copied to clipboard"
    />
  );
};
