'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Copy, Check } from 'lucide-react';
import { api } from '@/trpc/client';

interface MintedCode {
  code: string;
  grantAmount: number;
  expiresAt: Date;
}

export function CreditCodeMinter() {
  const [amount, setAmount] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [mintedCodes, setMintedCodes] = useState<MintedCode[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mintCodeMutation = api.admin.mintCreditReferralCode.useMutation({
    onSuccess: data => {
      // Convert grantAmount from Decimal to number
      const convertedData: MintedCode = {
        code: data.code,
        grantAmount:
          typeof data.grantAmount === 'number'
            ? data.grantAmount
            : Number(data.grantAmount),
        expiresAt: data.expiresAt,
      };
      setMintedCodes([convertedData, ...mintedCodes]);
      setAmount('');
      setExpiresAt('');
      setError(null);
    },
    onError: error => {
      setError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountInDollars = parseFloat(amount);
    if (isNaN(amountInDollars) || amountInDollars <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }

    const expirationDate = expiresAt ? new Date(expiresAt) : undefined;

    await mintCodeMutation.mutateAsync({
      amountInDollars,
      expiresAt: expirationDate,
    });
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mint Code Form */}
      <Card>
        <CardHeader>
          <CardTitle>Mint Credit Grant Code</CardTitle>
          <CardDescription>
            Create a new referral code that grants credits to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Credit Amount (USD)
              </label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount in dollars"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="expiresAt" className="text-sm font-medium">
                Expiration Date (Optional)
              </label>
              <Input
                id="expiresAt"
                type="date"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to default to 1 year from now
              </p>
            </div>

            <Button
              type="submit"
              disabled={mintCodeMutation.isPending || !amount}
              className="w-full"
            >
              {mintCodeMutation.isPending
                ? 'Minting Code...'
                : 'Mint Credit Code'}
            </Button>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Minted Codes List */}
      {mintedCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently Minted Codes</CardTitle>
            <CardDescription>
              Codes created in this session. Share these with users to grant
              them credits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mintedCodes.map((mintedCode, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="font-mono text-sm font-medium">
                      {mintedCode.code}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${mintedCode.grantAmount.toFixed(2)} • Expires{' '}
                      {mintedCode.expiresAt.toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(mintedCode.code)}
                    className="ml-2"
                  >
                    {copiedCode === mintedCode.code ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
