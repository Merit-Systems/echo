import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Gift, Plus, Check, AlertCircle, Copy } from 'lucide-react';
import { Separator } from '../ui/separator';
import { CustomerEchoApp } from '@/lib/types/apps';
import { api } from '@/trpc/client';
import { useState } from 'react';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

interface CreateReferralCodeCardProps {
  app: CustomerEchoApp;
}

export function CreateReferralCodeCard({ app }: CreateReferralCodeCardProps) {
  const [error, setError] = useState<string | null>(null);
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const { data: referralCode } = api.apps.app.referralCode.get.byUser.useQuery(
    app.id
  );

  const utils = api.useUtils();

  const {
    mutate: createReferralCode,
    data: createdReferralCode,
    isPending: isLoading,
  } = api.apps.app.referralCode.create.useMutation({
    onSuccess: () => {
      setError(null);
      utils.apps.app.referralCode.get.byUser.invalidate(app.id);
    },
    onError: error => {
      setError(error.message || 'Failed to create referral code');
    },
  });

  const handleMintReferralCode = () => {
    createReferralCode({
      appId: app.id,
    });
  };

  return (
    <Card className="p-6 hover:border-primary relative shadow-primary shadow-[0_0_8px] transition-all duration-300 bg-background/80 backdrop-blur-xs border-border/50 h-80 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
            <Gift className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold">Referral Codes</h3>
        </div>
        <Button
          onClick={handleMintReferralCode}
          className="h-8! w-8! p-0!"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Separator className="my-4" />

      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg mb-4">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {createdReferralCode && (
          <div className="space-y-4 mb-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-300">
                Referral code created successfully!
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Your New Referral Code:
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-muted rounded-lg">
                  <code className="text-sm font-mono break-all">
                    {createdReferralCode.referralLinkUrl}
                  </code>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(createdReferralCode.referralLinkUrl)
                  }
                  className={`transition-all duration-200 ${
                    isCopied
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : ''
                  }`}
                >
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Expires:{' '}
                {new Date(createdReferralCode.expiresAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {referralCode ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground">
              Your Recent Referral Code:
            </p>
            <div key={referralCode.code} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-muted rounded-lg">
                  <code className="text-sm font-mono break-all">
                    {referralCode.referralLinkUrl}
                  </code>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(referralCode.referralLinkUrl)}
                  className={`transition-all duration-200 ${
                    isCopied
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : ''
                  }`}
                >
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Expires: {new Date(referralCode.expiresAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ) : (
          !createdReferralCode && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground text-center">
                No referral codes yet. Click the + button to create one.
              </p>
            </div>
          )
        )}
      </div>
    </Card>
  );
}
