'use client';

import { Suspense } from 'react';
import { TrendingUp, DollarSign, Users, BarChart3 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { api } from '@/trpc/client';
import { formatCurrency } from '@/lib/balance';
import { useUser } from '@/hooks/use-user';

interface App {
  id: string;
  name: string;
  description?: string | null;
}

function AppEarningsCard({ app }: { app: App }) {
  const {
    data: breakdown,
    isLoading,
    error,
  } = api.user.earnings.getAppEarningsBreakdown.useQuery({
    appId: app.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{app.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-sm">
            Error loading earnings: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalEarnings = breakdown?.grossEarnings || 0;
  const hasEarnings = totalEarnings > 0;
  const referralEarningsCount = breakdown?.referralEarnings
    ? Object.keys(breakdown.referralEarnings).length
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {breakdown?.appName || app.name}
          </CardTitle>
          <Badge variant={hasEarnings ? 'default' : 'secondary'}>
            {hasEarnings ? 'Earning' : 'No Revenue'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Gross Earnings</span>
          <span className="text-xl font-bold text-green-600">
            {formatCurrency(breakdown?.grossEarnings || 0)}
          </span>
        </div>

        {breakdown && hasEarnings && (
          <>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Markup Earnings</span>
                <span className="font-medium">
                  {formatCurrency(breakdown.markupEarnings)}
                </span>
              </div>

              {breakdown.totalReferralEarnings > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total Referral Earnings
                    </span>
                    <span className="font-medium">
                      {formatCurrency(breakdown.totalReferralEarnings)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-xs">
                      From {referralEarningsCount} referrer
                      {referralEarningsCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TotalEarningsDisplay() {
  const { data: earnings, isLoading, error } = api.user.earnings.get.useQuery();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        Error loading earnings: {error.message}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total Gross</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(earnings?.totalGrossEarnings || 0)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Markup Earnings
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(earnings?.totalMarkupEarnings || 0)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Referral Earnings
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(earnings?.totalReferralEarnings || 0)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AppsEarningsList() {
  const { data: earnings, isLoading: earningsLoading } =
    api.user.earnings.get.useQuery();

  if (earningsLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  if (!earnings || earnings.appsBreakdown.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="space-y-2">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No Apps Found</h3>
            <p className="text-muted-foreground">
              Create your first Echo app to start earning revenue.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {earnings.appsBreakdown.map(app => (
        <AppEarningsCard
          key={app.appId}
          app={{ id: app.appId, name: app.appName }}
        />
      ))}
    </div>
  );
}

export default function EarningsPage() {
  const { isAuthenticated, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-1 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Earnings</h1>
          <p className="text-muted-foreground">
            Please sign in to view your earnings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Earnings</h1>
        <p className="text-muted-foreground">
          Track your revenue from Echo app markups and referral rewards across
          all your apps.
        </p>
        <Separator />
      </div>

      {/* Main Earnings Display Cards */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            Total Earnings Across All Apps
          </h2>
          <p className="text-muted-foreground">
            Lifetime earnings from all your Echo apps and referrals
          </p>
        </div>
        <Suspense
          fallback={
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          }
        >
          <TotalEarningsDisplay />
        </Suspense>
      </div>

      {/* Earnings by App */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Earnings by App</h2>
        <p className="text-muted-foreground">
          Detailed revenue breakdown for each of your apps.
        </p>
        <Suspense
          fallback={
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          }
        >
          <AppsEarningsList />
        </Suspense>
      </div>

      {/* Information Section */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">How Earnings Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4" />
                App Markup Earnings
              </h3>
              <p className="text-sm text-muted-foreground">
                Earn revenue from the markup applied to LLM usage in your apps.
                The markup amount is calculated based on your app&apos;s pricing
                configuration.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" />
                Referral Earnings
              </h3>
              <p className="text-sm text-muted-foreground">
                Earn rewards when users you&apos;ve referred use Echo apps.
                Referral rewards are a percentage of the markup earnings from
                their usage.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
