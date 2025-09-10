'use client';
import { useState } from 'react';

import { Check, Loader2, Smartphone, Building2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

import { api } from '@/trpc/client';

export const RedeemCredits = () => {
  const [code, setCode] = useState<string>('');
  const [freeTier, setFreeTier] = useState<boolean>(false);
  const [echoAppId, setEchoAppId] = useState<string>('');

  const utils = api.useUtils();

  const {
    mutate: redeemReferralCode,
    isPending,
    isSuccess,
    isError,
    error,
  } = api.user.redeem.redeem.useMutation({
    onSuccess: () => {
      setCode('');
      setFreeTier(false);
      setEchoAppId('');
      void utils.user.balance.get.invalidate();
    },
  });

  return (
    <div className="flex flex-col w-full gap-4">
      <Input
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder="Enter Code"
        className="w-full"
      />

      {/* Free Tier Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="size-4 text-muted-foreground" />
          <label htmlFor="free-tier" className="text-sm font-medium">
            Free Tier
          </label>
        </div>
        <Switch
          id="free-tier"
          checked={freeTier}
          onCheckedChange={setFreeTier}
        />
      </div>

      {/* Echo App ID Input */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="echo-app-id"
          className="text-sm font-medium flex items-center gap-2"
        >
          <Building2 className="size-4 text-muted-foreground" />
          Echo App ID (Optional)
        </label>
        <Input
          id="echo-app-id"
          type="text"
          placeholder="Enter Echo App ID"
          value={echoAppId}
          onChange={e => setEchoAppId(e.target.value)}
        />
      </div>
      <Button
        onClick={() =>
          redeemReferralCode({
            code,
            freeTier,
            echoAppId: echoAppId.trim() || undefined,
          })
        }
        disabled={isPending || !code || code.trim() === '' || isSuccess}
        size="lg"
        variant="turbo"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : isSuccess ? (
          <Check className="size-4" />
        ) : (
          'Redeem Credit Code'
        )}
      </Button>
      {isError && error && (
        <div className="text-sm text-red-600 mt-2">
          {error.message || 'Failed to redeem code. Please try again.'}
        </div>
      )}
      {isSuccess && (
        <div className="text-sm text-green-600 mt-2">
          Code redeemed successfully!
        </div>
      )}
    </div>
  );
};
