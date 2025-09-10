'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/trpc/client';
import type { User, EchoApp} from '@/generated/prisma';
import { EnumPaymentSource } from '@/generated/prisma';
import { DollarSign, Coins, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CreditMinterProps {
  user: User;
  selectedApp: EchoApp | null;
}

export function CreditMinter({ user, selectedApp }: CreditMinterProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastMintResult, setLastMintResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Form state
  const [amountInDollars, setAmountInDollars] = useState(10);
  const [description, setDescription] = useState('');
  const [isFreeTier, setIsFreeTier] = useState(false);
  const [poolName, setPoolName] = useState('');
  const [defaultSpendLimit, setDefaultSpendLimit] = useState<
    number | undefined
  >(undefined);
  const [metadata, setMetadata] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mintCreditsMutation = api.admin.mintCredits.useMutation();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!amountInDollars || amountInDollars <= 0) {
      newErrors.amountInDollars = 'Amount must be positive';
    }

    if (metadata.trim()) {
      try {
        JSON.parse(metadata);
      } catch {
        newErrors.metadata = 'Invalid JSON format';
      }
    }

    if (isFreeTier && !selectedApp) {
      newErrors.general = 'Please select an app for free tier credits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setLastMintResult(null);

    try {
      let parsedMetadata: Record<string, string> = {};

      if (metadata.trim()) {
        parsedMetadata = JSON.parse(metadata);
      }

      const result = await mintCreditsMutation.mutateAsync({
        userId: user.id,
        amountInDollars,
        options: {
          description: description.trim() || undefined,
          isFreeTier,
          echoAppId: isFreeTier ? selectedApp?.id : undefined,
          metadata:
            Object.keys(parsedMetadata).length > 0 ? parsedMetadata : undefined,
          poolName: poolName.trim() || undefined,
          defaultSpendLimit: defaultSpendLimit || undefined,
          source: EnumPaymentSource.admin,
        },
      });

      setLastMintResult({
        success: true,
        message: result.message,
      });

      // Reset form but keep the amount for convenience
      setDescription('');
      setIsFreeTier(false);
      setPoolName('');
      setDefaultSpendLimit(undefined);
      setMetadata('');
      setErrors({});
    } catch (error) {
      setLastMintResult({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to mint credits',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAmounts = [5, 10, 25, 50, 100];

  return (
    <div className="space-y-6">
      {/* User Summary */}
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Coins className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="font-medium">
            Minting credits for {user.name || user.email}
          </div>
          <div className="text-sm text-muted-foreground">
            {isFreeTier && selectedApp
              ? `Free tier credits for "${selectedApp.name}"`
              : 'Personal balance credits'}
          </div>
        </div>
      </div>

      {/* Quick Amount Buttons */}
      <div>
        <label className="text-sm font-medium mb-2 block">Quick amounts</label>
        <div className="flex gap-2 flex-wrap">
          {quickAmounts.map(amount => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              onClick={() => setAmountInDollars(amount)}
              className="h-8"
            >
              ${amount}
            </Button>
          ))}
        </div>
      </div>

      {/* General Error */}
      {errors.general && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {errors.general}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div>
          <label className="text-sm font-medium mb-1 block">
            Amount (USD) <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="10.00"
              className="pl-10"
              value={amountInDollars}
              onChange={e =>
                setAmountInDollars(parseFloat(e.target.value) || 0)
              }
            />
          </div>
          {errors.amountInDollars && (
            <p className="text-sm text-destructive mt-1">
              {errors.amountInDollars}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium mb-1 block">Description</label>
          <Input
            placeholder="Optional description for this credit mint"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Free Tier Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Free tier credits</label>
            <p className="text-xs text-muted-foreground">
              Credits tied to a specific app (requires app selection)
            </p>
          </div>
          <Switch checked={isFreeTier} onCheckedChange={setIsFreeTier} />
        </div>

        {/* Free Tier Options */}
        {isFreeTier && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">
                  Free Tier Mode
                </Badge>
                {!selectedApp && (
                  <Badge variant="destructive" className="text-xs">
                    App Required
                  </Badge>
                )}
              </div>

              {!selectedApp && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  Please select an app above to enable free tier credit minting
                </div>
              )}

              {selectedApp && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Pool name
                    </label>
                    <Input
                      placeholder="e.g., starter-credits, welcome-bonus"
                      value={poolName}
                      onChange={e => setPoolName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Optional pool name for organizing free tier credits
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Default spend limit (USD)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="10.00"
                      value={defaultSpendLimit || ''}
                      onChange={e =>
                        setDefaultSpendLimit(
                          parseFloat(e.target.value) || undefined
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Optional limit for how much of these credits can be spent
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <div>
          <label className="text-sm font-medium mb-1 block">
            Metadata (JSON)
          </label>
          <Input
            placeholder='{"source": "manual", "reason": "customer support"}'
            value={metadata}
            onChange={e => setMetadata(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Optional JSON object for additional metadata
          </p>
          {errors.metadata && (
            <p className="text-sm text-destructive mt-1">{errors.metadata}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || (isFreeTier && !selectedApp)}
          className="w-full"
        >
          {isSubmitting ? 'Minting Credits...' : 'Mint Credits'}
        </Button>
      </form>

      {/* Result Display */}
      {lastMintResult && (
        <Card
          className={
            lastMintResult.success
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          }
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              {lastMintResult.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span
                className={`font-medium ${lastMintResult.success ? 'text-green-800' : 'text-red-800'}`}
              >
                {lastMintResult.success ? 'Success!' : 'Error'}
              </span>
            </div>
            <p
              className={`text-sm mt-1 ${lastMintResult.success ? 'text-green-700' : 'text-red-700'}`}
            >
              {lastMintResult.message}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
