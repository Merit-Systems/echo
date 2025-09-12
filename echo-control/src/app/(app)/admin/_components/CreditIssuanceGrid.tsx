'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Coins, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Search,
  User,
  Smartphone
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MintedCode {
  code: string;
  grantAmount: number;
  expiresAt: Date;
}

export function CreditIssuanceGrid() {
  // User Search State
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ id: string; name?: string; email?: string } | null>(null);
  const [selectedApp, setSelectedApp] = useState<{ id: string; name?: string } | null>(null);

  // Credit Minting State
  const [amountInDollars, setAmountInDollars] = useState(10);
  const [description, setDescription] = useState('');
  const [isFreeTier, setIsFreeTier] = useState(false);
  const [poolName, setPoolName] = useState('');
  const [defaultSpendLimit, setDefaultSpendLimit] = useState<number | undefined>(undefined);
  const [metadata, setMetadata] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastMintResult, setLastMintResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Code Minting State  
  const [codeAmount, setCodeAmount] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [mintedCodes, setMintedCodes] = useState<MintedCode[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // API calls
  const { data: users } = api.admin.getUsers.useQuery();
  const { data: userApps } = api.admin.getAppsForUser.useQuery(
    { userId: selectedUser?.id || '' },
    { enabled: !!selectedUser?.id }
  );

  const mintCreditsMutation = api.admin.mintCredits.useMutation({
    onSuccess: (data) => {
      setLastMintResult({
        success: true,
        message: data.message,
      });
      setIsSubmitting(false);
      // Reset form
      setAmountInDollars(10);
      setDescription('');
      setIsFreeTier(false);
      setPoolName('');
      setDefaultSpendLimit(undefined);
      setMetadata('');
    },
    onError: (error) => {
      setLastMintResult({
        success: false,
        message: error.message,
      });
      setIsSubmitting(false);
    },
  });

  const mintCodeMutation = api.admin.mintCreditReferralCode.useMutation({
    onSuccess: data => {
      const convertedData: MintedCode = {
        code: data.code,
        grantAmount: typeof data.grantAmount === 'number' ? data.grantAmount : Number(data.grantAmount),
        expiresAt: data.expiresAt,
      };
      setMintedCodes([convertedData, ...mintedCodes]);
      setCodeAmount('');
      setExpiresAt('');
      setError(null);
    },
    onError: error => {
      setError(error.message);
    },
  });

  // Filter users based on search
  const filteredUsers = users?.filter(user =>
    user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.id.includes(userSearchTerm)
  ) || [];

  const handleMintCredits = async () => {
    setIsSubmitting(true);
    setLastMintResult(null);

    if (!selectedUser) {
      setLastMintResult({
        success: false,
        message: 'Please select a user',
      });
      setIsSubmitting(false);
      return;
    }

    let parsedMetadata;
    if (metadata.trim()) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch {
        setLastMintResult({
          success: false,
          message: 'Invalid JSON format in metadata',
        });
        setIsSubmitting(false);
        return;
      }
    }

    await mintCreditsMutation.mutateAsync({
      userId: selectedUser.id,
      amountInDollars,
      options: {
        description: description.trim() || undefined,
        isFreeTier,
        poolName: poolName.trim() || undefined,
        defaultSpendLimit,
        metadata: parsedMetadata,
        source: 'admin' as const,
        echoAppId: selectedApp?.id,
      },
    });
  };

  const handleMintCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const grantAmount = parseFloat(codeAmount);
    if (isNaN(grantAmount) || grantAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    let expiresAtDate: Date | undefined;
    if (expiresAt) {
      expiresAtDate = new Date(expiresAt);
      if (expiresAtDate <= new Date()) {
        setError('Expiration date must be in the future');
        return;
      }
    }

    await mintCodeMutation.mutateAsync({
      amountInDollars: grantAmount,
      expiresAt: expiresAtDate,
    });
  };

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Credit Issuance
          </CardTitle>
          <CardDescription>
            Grant credits to users directly or generate referral codes
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="direct" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="direct">Direct Credit Minting</TabsTrigger>
          <TabsTrigger value="codes">Credit Code Generation</TabsTrigger>
        </TabsList>

        <TabsContent value="direct" className="space-y-6">
          {/* User Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Select User
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users by name, email, or ID..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {userSearchTerm && (
                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`p-3 cursor-pointer hover:bg-muted/50 border-b last:border-b-0 ${
                        selectedUser?.id === user.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => {
                        setSelectedUser({ id: user.id, name: user.name || undefined, email: user.email });
                        setSelectedApp(null);
                        setUserSearchTerm('');
                      }}
                    >
                      <div className="font-medium">{user.name || 'No name'}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="text-xs text-muted-foreground">{user.id}</div>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="p-3 text-sm text-muted-foreground">No users found</div>
                  )}
                </div>
              )}

              {selectedUser && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="font-medium">{selectedUser.name || 'No name'}</div>
                  <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                  <div className="text-xs text-muted-foreground">{selectedUser.id}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* App Selection */}
          {selectedUser && userApps && userApps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Select App (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedApp?.id || ''}
                  onValueChange={(value) => {
                    const app = value ? userApps?.find(app => app.id === value) : null;
                    setSelectedApp(app ? { id: app.id, name: app.name } : null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an app (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific app</SelectItem>
                    {userApps.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Credit Minting Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Credit Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Amount (USD)</label>
                  <Input
                    type="number"
                    value={amountInDollars}
                    onChange={(e) => setAmountInDollars(Number(e.target.value))}
                    min="0.01"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Welcome bonus"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={isFreeTier}
                  onCheckedChange={setIsFreeTier}
                />
                <label className="text-sm font-medium">
                  Free Tier (creates a spend pool)
                </label>
              </div>

              {isFreeTier && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Pool Name</label>
                    <Input
                      value={poolName}
                      onChange={(e) => setPoolName(e.target.value)}
                      placeholder="e.g., Welcome Pool"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Default Spend Limit (Optional)</label>
                    <Input
                      type="number"
                      value={defaultSpendLimit || ''}
                      onChange={(e) => setDefaultSpendLimit(e.target.value ? Number(e.target.value) : undefined)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Metadata (Optional JSON)</label>
                <Textarea
                  value={metadata}
                  onChange={(e) => setMetadata(e.target.value)}
                  placeholder='{"reason": "welcome_bonus", "campaign": "new_user"}'
                  className="font-mono text-sm"
                />
              </div>

              <Button 
                onClick={handleMintCredits}
                disabled={!selectedUser || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Minting...' : `Mint ${formatCurrency(amountInDollars)}`}
              </Button>

              {lastMintResult && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  lastMintResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {lastMintResult.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span className="text-sm">{lastMintResult.message}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="codes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Credit Codes</CardTitle>
              <CardDescription>
                Create referral codes that users can redeem for credits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMintCode} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Credit Amount (USD)</label>
                    <Input
                      type="number"
                      value={codeAmount}
                      onChange={(e) => setCodeAmount(e.target.value)}
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Expires At (Optional)</label>
                    <Input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={mintCodeMutation.isPending} className="w-full">
                  {mintCodeMutation.isPending ? 'Generating...' : 'Generate Code'}
                </Button>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Generated Codes */}
          {mintedCodes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Codes</CardTitle>
                <CardDescription>
                  Recently generated credit codes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mintedCodes.map((mintedCode, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <div className="font-mono text-sm font-medium">
                          {mintedCode.code}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(mintedCode.grantAmount)} •{' '}
                          Expires: {new Date(mintedCode.expiresAt).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(mintedCode.code)}
                      >
                        {copiedCode === mintedCode.code ? (
                          <Check className="h-4 w-4" />
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
        </TabsContent>
      </Tabs>
    </div>
  );
}