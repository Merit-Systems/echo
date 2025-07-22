import {
  Activity,
  ArrowLeft,
  CheckCircle,
  Key,
  Plus,
  Trash,
  X,
  Users,
  Eye,
  ExternalLink,
  User as UserIcon,
  GitBranch,
  Package,
  CreditCard,
  DollarSign,
  Clock,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';
import { formatCurrency } from '@/lib/balance';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ProfileAvatar } from '@/components/ui/profile-avatar';
import { CommitChart } from '@/components/activity-chart/chart';
import { DotPattern } from '@/components/ui/dot-background';
import { DetailedEchoApp } from '@/hooks/useEchoAppDetail';
import { AppRole } from '@/lib/permissions/types';

// Add GitHub API imports
import { githubApi, GitHubUser, GitHubRepo } from '@/lib/github-api';
import { useState, useEffect } from 'react';

// Helper functions
export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return value.toLocaleString();
};

export const formatCost = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0.0000';
  }
  return `${Number(value).toFixed(4)}`;
};

export const transformActivityData = (data: number[] | undefined) => {
  if (!data || data.length === 0) {
    return [];
  }
  return data.map((count, index) => ({
    index,
    count,
    date: new Date(
      Date.now() - (data.length - 1 - index) * 24 * 60 * 60 * 1000
    ).toISOString(),
  }));
};

// Shared Layout Component
interface AppDetailLayoutProps {
  children: ReactNode;
  showPaymentSuccess?: boolean;
  onDismissPaymentSuccess?: () => void;
}

export function AppDetailLayout({
  children,
  showPaymentSuccess,
  onDismissPaymentSuccess,
}: AppDetailLayoutProps) {
  return (
    <div className="min-h-screen bg-background relative">
      <DotPattern
        className="opacity-30"
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
      />

      {/* Payment Success Notification */}
      {showPaymentSuccess && onDismissPaymentSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-green-800">
                Payment Successful!
              </h4>
              <p className="text-sm text-green-700">
                Credits have been added to your account.
              </p>
            </div>
          </div>
          <button
            onClick={onDismissPaymentSuccess}
            className="!h-8 !w-8 hover:bg-transparent hover:text-foreground text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {children}
    </div>
  );
}

// Shared Banner Component
interface AppBannerProps {
  app: DetailedEchoApp;
  backUrl?: string;
}

export function AppBanner({ app, backUrl = '/' }: AppBannerProps) {
  return (
    <>
      {/* Header with back button */}
      <div className="absolute top-8 left-8 z-50">
        <Link href={backUrl}>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Banner Background */}
      <div className="h-64 relative overflow-hidden shadow-lg shadow-blue-500/25">
        {app.bannerImageUrl ? (
          <>
            <Image
              src={app.bannerImageUrl}
              alt={`${app.name} banner`}
              fill
              className="object-cover z-0"
            />
            <div className="absolute inset-0 bg-black/40 z-0"></div>
          </>
        ) : (
          <>
            <div className="h-full bg-gradient-to-r from-secondary via-muted to-secondary/80 z-0"></div>
            <div className="absolute inset-0 bg-black/20 z-0"></div>
          </>
        )}
      </div>
    </>
  );
}

// App Profile Section
interface AppProfileProps {
  app: DetailedEchoApp;
  userRole: AppRole | null;
  roleLabel?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

// Add GitHubUserInfo component
interface GitHubUserInfoProps {
  githubId: string;
  githubType: 'user' | 'repo';
}

function GitHubUserInfo({ githubId, githubType }: GitHubUserInfoProps) {
  const [githubData, setGithubData] = useState<GitHubUser | GitHubRepo | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        setLoading(true);
        setError(false);

        let data: GitHubUser | GitHubRepo | null = null;

        if (githubType === 'user') {
          data = await githubApi.verifyUserById(githubId);
        } else if (githubType === 'repo') {
          data = await githubApi.verifyRepoById(githubId);
        }

        setGithubData(data);
        setError(data === null);
      } catch (err) {
        console.error('Error fetching GitHub data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubData();
  }, [githubId, githubType]);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-muted-foreground">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-secondary border-t-transparent"></div>
        <span className="text-sm">Loading GitHub info...</span>
      </div>
    );
  }

  if (error || !githubData) {
    return null; // Don't show anything if GitHub data couldn't be fetched
  }

  const isUser = 'login' in githubData;
  const displayName = isUser
    ? githubData.name || githubData.login
    : githubData.full_name;
  const username = isUser ? `@${githubData.login}` : githubData.full_name;
  const avatarUrl = isUser
    ? githubData.avatar_url
    : githubData.owner.avatar_url;

  return (
    <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
      <Image
        src={avatarUrl}
        alt={displayName}
        width={32}
        height={32}
        className="w-8 h-8 rounded-full flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          {isUser ? (
            <UserIcon className="h-3 w-3 text-secondary flex-shrink-0" />
          ) : (
            <GitBranch className="h-3 w-3 text-secondary flex-shrink-0" />
          )}
          <span className="text-foreground text-sm font-medium truncate">
            {displayName}
          </span>
        </div>
        <p className="text-muted-foreground text-xs truncate">
          {isUser ? username : githubData.description || 'No description'}
        </p>
      </div>
      <a
        href={githubData.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-secondary hover:text-secondary/80 transition-colors"
        title={`View on GitHub`}
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}

export function AppProfile({
  app,
  userRole,
  roleLabel,
  actions,
  children,
}: AppProfileProps) {
  const getRoleIcon = () => {
    switch (userRole) {
      case AppRole.PUBLIC:
        return <Eye className="h-3 w-3 text-white" />;
      case AppRole.CUSTOMER:
        return <Users className="h-3 w-3 text-white" />;
      default:
        return null;
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case AppRole.PUBLIC:
        return 'bg-blue-500';
      case AppRole.CUSTOMER:
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div className="relative -mt-20 px-8 pb-8 z-10">
      <Card className="p-8 bg-card shadow-2xl border border-border">
        <div className="flex items-start gap-8">
          <div className="relative flex-shrink-0">
            <ProfileAvatar
              name={app.name}
              src={app.profilePictureUrl}
              size="2xl"
              rounded="2xl"
              className="shadow-lg"
            />
            <div
              className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-background ${getRoleColor()} shadow-sm flex items-center justify-center`}
            >
              {getRoleIcon()}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-4xl font-bold text-foreground">
                    {app.name}
                  </h1>
                  {roleLabel && (
                    <Badge variant="outline" className="text-xs">
                      {roleLabel}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                  {app.description || 'No description provided'}
                </p>
              </div>

              {/* GitHub Card Section - Right Aligned with title */}
              {app.githubId && app.githubType && (
                <div className="w-80 flex-shrink-0">
                  <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white">
                        {app.githubType === 'user' ? (
                          <UserIcon className="h-4 w-4" />
                        ) : (
                          <GitBranch className="h-4 w-4" />
                        )}
                      </div>
                      <h3 className="text-lg font-bold">
                        GitHub{' '}
                        {app.githubType === 'user' ? 'User' : 'Repository'}
                      </h3>
                    </div>
                    <GitHubUserInfo
                      githubId={app.githubId}
                      githubType={app.githubType as 'user' | 'repo'}
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator className="mb-6" />

            {children}

            {actions && (
              <>
                <Separator className="mb-6" />
                {actions}
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Activity Chart Card
interface ActivityChartProps {
  app: DetailedEchoApp;
  title?: string;
}

export function ActivityChart({ app, title = 'Activity' }: ActivityChartProps) {
  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <Card className="flex-1 p-6 hover:border-secondary relative shadow-secondary shadow-[0_0_8px] transition-all duration-300 bg-background/80 backdrop-blur-sm border-border/50">
        <div className="h-64">
          <CommitChart
            data={{
              data: transformActivityData(app.activityData),
              isLoading: false,
            }}
            numPoints={app.activityData?.length || 0}
            timeWindowOption={{ value: '30d' }}
            startDate={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
            endDate={new Date()}
            chartHeight={240}
            shouldAnimate={true}
          />
        </div>
      </Card>
    </div>
  );
}

// Overview Stats Card
interface OverviewStatsProps {
  app: DetailedEchoApp;
  showAdvanced?: boolean;
}

export function OverviewStats({
  app,
  showAdvanced = true,
}: OverviewStatsProps) {
  return (
    <Card className="p-6 hover:border-secondary relative shadow-secondary shadow-[0_0_8px] transition-all duration-300 bg-background/80 backdrop-blur-sm border-border/50 h-80 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
          <Activity className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-bold">Overview</h3>
      </div>

      <Separator className="my-4" />

      <div className="space-y-4 flex-1">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total Transactions</span>
          <span className="font-bold">
            {formatNumber(app.stats?.totalTransactions)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total Tokens</span>
          <span className="font-bold">
            {formatNumber(app.stats?.totalTokens)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total Spent</span>
          <Badge className="text-black dark:text-white border-[1px] bg-transparent shadow-none">
            {formatCurrency(app.stats?.totalCost)}
          </Badge>
        </div>
        {showAdvanced && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Created</span>
            <span className="font-medium text-sm">
              {new Date(app.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

// API Keys Card
interface ApiKeysCardProps {
  app: DetailedEchoApp;
  hasCreatePermission: boolean;
  hasManagePermission: boolean;
  onCreateApiKey?: () => void;
  onArchiveApiKey?: (id: string) => void;
  deletingKeyId?: string | null;
}

export function ApiKeysCard({
  app,
  hasCreatePermission,
  hasManagePermission,
  onCreateApiKey,
  onArchiveApiKey,
  deletingKeyId,
}: ApiKeysCardProps) {
  return (
    <Card className="p-6 hover:border-secondary relative shadow-secondary shadow-[0_0_8px] transition-all duration-300 bg-background/80 backdrop-blur-sm border-border/50 h-80 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white">
            <Key className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold">API Keys</h3>
        </div>
        {hasCreatePermission && onCreateApiKey && (
          <Button onClick={onCreateApiKey} className="!h-8 !w-8 !p-0">
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator className="my-4" />

      <div className="space-y-3 flex-1 overflow-auto">
        {app.apiKeys && app.apiKeys.length > 0 ? (
          <>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Active Keys</span>
              <span className="font-bold">{app.apiKeys.length}</span>
            </div>
            {app.apiKeys.slice(0, 3).map(apiKey => (
              <div
                key={apiKey.id}
                className="flex justify-between items-center text-sm"
              >
                <span className="truncate flex-1">
                  {apiKey.name || 'Unnamed Key'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {formatCurrency(apiKey.totalSpent)}
                  </span>
                  {hasManagePermission && onArchiveApiKey && (
                    <button
                      onClick={() => onArchiveApiKey(apiKey.id)}
                      disabled={deletingKeyId === apiKey.id}
                      className="text-destructive hover:text-destructive/80 disabled:opacity-50"
                    >
                      <Trash className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {app.apiKeys.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{app.apiKeys.length - 3} more keys
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm">No API keys yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create one to get started
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

// Recent Activity Card
interface RecentActivityCardProps {
  app: DetailedEchoApp;
  title?: string;
}

export function RecentActivityCard({
  app,
  title = 'Recent Activity',
}: RecentActivityCardProps) {
  return (
    <Card className="p-6 hover:border-secondary relative shadow-secondary shadow-[0_0_8px] transition-all duration-300 bg-background/80 backdrop-blur-sm border-border/50 h-80 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3 flex-1 overflow-auto">
        {app.recentTransactions && app.recentTransactions.length > 0 ? (
          <>
            {app.recentTransactions.slice(0, 4).map(transaction => (
              <div
                key={transaction.id}
                className="flex justify-between items-start text-sm"
              >
                <div className="flex-1">
                  <p className="font-medium truncate">{transaction.model}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCost(transaction.cost)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(transaction.totalTokens)} tokens
                  </p>
                </div>
              </div>
            ))}
            {app.recentTransactions.length > 4 && (
              <p className="text-xs text-muted-foreground">
                +{app.recentTransactions.length - 4} more transactions
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-8 flex-1 flex items-center justify-center">
            <div>
              <p className="text-muted-foreground text-sm">No activity yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start using your API keys to see activity
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// Top Models Card
interface TopModelsCardProps {
  app: DetailedEchoApp;
  title?: string;
}

export function TopModelsCard({
  app,
  title = 'Top Models',
}: TopModelsCardProps) {
  return (
    <div className="flex flex-col">
      <Card className="flex-1 p-6 hover:border-secondary relative shadow-secondary shadow-[0_0_8px] transition-all duration-300 bg-background/80 backdrop-blur-sm border-border/50 h-80 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <Separator className="my-4" />
        <CardContent className="p-0 h-full flex-1 overflow-auto">
          {app.stats?.modelUsage && app.stats.modelUsage.length > 0 ? (
            <div className="space-y-4">
              {app.stats.modelUsage.slice(0, 5).map((usage, index) => (
                <div
                  key={usage.model}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{usage.model}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(usage._count)} requests
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      {formatCost(usage._sum?.cost)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(usage._sum?.totalTokens)} tokens
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 flex-1 flex items-center justify-center">
              <div>
                <p className="text-muted-foreground text-sm">
                  No model usage yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Usage statistics will appear here
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Subscription Card
interface Product {
  id: string;
  name: string;
  description?: string;
  stripeProductId: string;
  stripePriceId: string;
  price: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionPackage {
  id: string;
  name: string;
  description?: string;
  products: Product[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionCardProps {
  app: DetailedEchoApp;
  onSubscribe?: (type: 'product' | 'package', id: string) => void;
}

export function SubscriptionCard({ app, onSubscribe }: SubscriptionCardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch products and packages
        const [productsResponse, packagesResponse] = await Promise.all([
          fetch(`/api/stripe/subscriptions/public?appId=${app.id}`),
          fetch(`/api/stripe/subscriptions/packages/public?appId=${app.id}`),
        ]);

        const productsResult = await productsResponse.json();
        const packagesResult = await packagesResponse.json();

        if (productsResponse.ok) {
          setProducts(productsResult.products || []);
        }

        if (packagesResponse.ok) {
          setPackages(packagesResult.packages || []);
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        setError('Failed to load subscriptions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [app.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleSubscribe = async (type: 'product' | 'package', id: string) => {
    if (!onSubscribe) return;

    setSubscribing(id);
    try {
      await onSubscribe(type, id);
    } finally {
      setSubscribing(null);
    }
  };

  const allSubscriptions = [
    ...products.map(p => ({ ...p, type: 'product' as const })),
    ...packages.map(p => ({ ...p, type: 'package' as const })),
  ];

  if (loading) {
    return (
      <Card className="p-6 hover:border-secondary relative shadow-secondary shadow-[0_0_8px] transition-all duration-300 bg-background/80 backdrop-blur-sm border-border/50 h-80 flex flex-col">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:border-secondary relative shadow-secondary shadow-[0_0_8px] transition-all duration-300 bg-background/80 backdrop-blur-sm border-border/50 h-80 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
            <Package className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold">Subscriptions</h3>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3 flex-1 overflow-auto">
        {error && (
          <div className="text-center py-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {!error && allSubscriptions.length > 0 ? (
          <>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Available Plans</span>
              <span className="font-bold">{allSubscriptions.length}</span>
            </div>
            {allSubscriptions.slice(0, 2).map(subscription => (
              <div
                key={subscription.id}
                className="border border-border rounded-lg p-3 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm truncate">
                      {subscription.name}
                    </h4>
                    {subscription.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {subscription.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-2">
                    <div className="flex items-center gap-1 font-bold">
                      <DollarSign className="h-3 w-3 text-green-500" />
                      {formatCurrency(
                        subscription.type === 'package'
                          ? subscription.totalPrice
                          : subscription.price
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">per month</p>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    handleSubscribe(subscription.type, subscription.id)
                  }
                  disabled={subscribing === subscription.id}
                  size="sm"
                  className="w-full"
                >
                  {subscribing === subscription.id ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-3 w-3 mr-2" />
                      Subscribe
                    </>
                  )}
                </Button>
              </div>
            ))}
            {allSubscriptions.length > 2 && (
              <p className="text-xs text-muted-foreground">
                +{allSubscriptions.length - 2} more plans
              </p>
            )}
          </>
        ) : !error ? (
          <div className="text-center py-4 flex-1 flex items-center justify-center">
            <div>
              <Package className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No subscriptions available
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Check back later for subscription plans
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

// Active Subscriptions Card
interface ActiveSubscriptionsCardProps {
  app: DetailedEchoApp;
  onSubscriptionUpdate?: () => void;
}

interface SubscriptionData {
  id: string;
  stripeSubscriptionId: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  type: 'package' | 'product';
  package: {
    id: string;
    name: string;
    description: string | null;
    products: Array<{
      id: string;
      name: string;
      description: string | null;
      price: number;
      currency: string;
    }>;
  } | null;
  products: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
  }>;
}

export function ActiveSubscriptionsCard({
  app,
  onSubscriptionUpdate,
}: ActiveSubscriptionsCardProps) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<{
    subscriptionId: string;
    subscriptionName: string;
  } | null>(null);

  useEffect(() => {
    const fetchActiveSubscriptions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/apps/${app.id}/subscriptions`);
        const result = await response.json();

        if (response.ok) {
          setSubscriptions(result.subscriptions || []);
        } else {
          setError(result.error || 'Failed to load active subscriptions');
        }
      } catch (error) {
        console.error('Error fetching active subscriptions:', error);
        setError('Failed to load active subscriptions');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveSubscriptions();
  }, [app.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'trialing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'past_due':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'canceled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTotalPrice = (subscription: SubscriptionData) => {
    if (subscription.type === 'package' && subscription.package) {
      return subscription.package.products.reduce(
        (total, product) => total + product.price,
        0
      );
    }
    return subscription.products.reduce(
      (total, product) => total + product.price,
      0
    );
  };

  const getDisplayName = (subscription: SubscriptionData) => {
    if (subscription.type === 'package' && subscription.package) {
      return subscription.package.name;
    }
    if (subscription.products.length === 1) {
      return subscription.products[0].name;
    }
    return `${subscription.products.length} Products`;
  };

  const handleCancelSubscription = async (
    subscriptionId: string,
    immediate = false
  ) => {
    setCancelingId(subscriptionId);
    try {
      const response = await fetch(
        `/api/apps/${app.id}/subscriptions?subscriptionId=${subscriptionId}&immediate=${immediate}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();

      if (response.ok) {
        // Refresh subscriptions
        const subscriptionsResponse = await fetch(
          `/api/apps/${app.id}/subscriptions`
        );
        const subscriptionsResult = await subscriptionsResponse.json();
        if (subscriptionsResponse.ok) {
          setSubscriptions(subscriptionsResult.subscriptions || []);
        }

        // Notify parent component
        onSubscriptionUpdate?.();
      } else {
        setError(result.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setError('Failed to cancel subscription');
    } finally {
      setCancelingId(null);
      setShowCancelConfirm(null);
    }
  };

  const handleReactivateSubscription = async (subscriptionId: string) => {
    setReactivatingId(subscriptionId);
    try {
      const response = await fetch(
        `/api/apps/${app.id}/subscriptions?subscriptionId=${subscriptionId}&action=reactivate`,
        {
          method: 'PATCH',
        }
      );

      const result = await response.json();

      if (response.ok) {
        // Refresh subscriptions
        const subscriptionsResponse = await fetch(
          `/api/apps/${app.id}/subscriptions`
        );
        const subscriptionsResult = await subscriptionsResponse.json();
        if (subscriptionsResponse.ok) {
          setSubscriptions(subscriptionsResult.subscriptions || []);
        }

        // Notify parent component
        onSubscriptionUpdate?.();
      } else {
        setError(result.error || 'Failed to reactivate subscription');
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      setError('Failed to reactivate subscription');
    } finally {
      setReactivatingId(null);
    }
  };

  const canBeCancelled = (status: string) => {
    return (
      status.toLowerCase() === 'active' || status.toLowerCase() === 'trialing'
    );
  };

  const canBeReactivated = (status: string) => {
    return (
      status.toLowerCase() === 'canceled' ||
      status.toLowerCase() === 'cancelled'
    );
  };

  if (loading) {
    return (
      <Card className="p-6 hover:border-secondary relative shadow-secondary shadow-[0_0_8px] transition-all duration-300 bg-background/80 backdrop-blur-sm border-border/50 h-80 flex flex-col">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:border-secondary relative shadow-secondary shadow-[0_0_8px] transition-all duration-300 bg-background/80 backdrop-blur-sm border-border/50 h-80 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white">
            <Clock className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold">Active Subscriptions</h3>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3 flex-1 overflow-auto">
        {error && (
          <div className="text-center py-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {!error && subscriptions.length > 0 ? (
          <>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Active Plans</span>
              <span className="font-bold">{subscriptions.length}</span>
            </div>
            {subscriptions.slice(0, 2).map(subscription => (
              <div
                key={subscription.id}
                className="border border-border rounded-lg p-3 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm truncate">
                      {getDisplayName(subscription)}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={`text-xs border ${getStatusColor(subscription.status)}`}
                      >
                        {subscription.status.charAt(0).toUpperCase() +
                          subscription.status.slice(1)}
                      </Badge>
                      {subscription.currentPeriodEnd && (
                        <span className="text-xs text-muted-foreground">
                          Until {formatDate(subscription.currentPeriodEnd)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <div className="flex items-center gap-1 font-bold">
                      <DollarSign className="h-3 w-3 text-green-500" />
                      {formatCurrency(getTotalPrice(subscription))}
                    </div>
                    <p className="text-xs text-muted-foreground">per month</p>
                  </div>
                </div>

                {/* Show products for package subscriptions */}
                {subscription.type === 'package' &&
                  subscription.package &&
                  subscription.package.products.length > 0 && (
                    <div className="pt-2 border-t border-border/30">
                      <p className="text-xs text-muted-foreground mb-1">
                        Includes:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {subscription.package.products
                          .slice(0, 2)
                          .map(product => (
                            <Badge
                              key={product.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {product.name}
                            </Badge>
                          ))}
                        {subscription.package.products.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{subscription.package.products.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {canBeCancelled(subscription.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setShowCancelConfirm({
                          subscriptionId: subscription.id,
                          subscriptionName: getDisplayName(subscription),
                        })
                      }
                      disabled={cancelingId === subscription.id}
                      className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      {cancelingId === subscription.id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-destructive mr-2"></div>
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3 mr-2" />
                          Cancel
                        </>
                      )}
                    </Button>
                  )}
                  {canBeReactivated(subscription.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleReactivateSubscription(subscription.id)
                      }
                      disabled={reactivatingId === subscription.id}
                      className="flex-1 text-green-600 border-green-600/30 hover:bg-green-600/10"
                    >
                      {reactivatingId === subscription.id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mr-2"></div>
                          Reactivating...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-3 w-3 mr-2" />
                          Reactivate
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {subscriptions.length > 2 && (
              <p className="text-xs text-muted-foreground">
                +{subscriptions.length - 2} more subscriptions
              </p>
            )}
          </>
        ) : !error ? (
          <div className="text-center py-4 flex-1 flex items-center justify-center">
            <div>
              <Clock className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No active subscriptions
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Subscribe to unlock premium features
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold">Cancel Subscription</h3>
            </div>

            <p className="text-muted-foreground mb-6">
              Are you sure you want to cancel &quot;
              {showCancelConfirm.subscriptionName}&quot;? This will cancel your
              subscription at the end of the current billing period.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(null)}
                className="flex-1"
              >
                Keep Subscription
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  handleCancelSubscription(
                    showCancelConfirm.subscriptionId,
                    false
                  )
                }
                disabled={cancelingId === showCancelConfirm.subscriptionId}
                className="flex-1"
              >
                {cancelingId === showCancelConfirm.subscriptionId ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    Cancelling...
                  </>
                ) : (
                  'Cancel Subscription'
                )}
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <Button
                variant="ghost"
                onClick={() =>
                  handleCancelSubscription(
                    showCancelConfirm.subscriptionId,
                    true
                  )
                }
                disabled={cancelingId === showCancelConfirm.subscriptionId}
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                Cancel Immediately (No Refund)
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
