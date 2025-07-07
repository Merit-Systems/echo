'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  WalletIcon,
  PlusIcon,
  DollarSignIcon,
  InfoIcon,
  RefreshCwIcon,
  SparklesIcon,
  TrendingUpIcon,
  EditIcon,
  SaveIcon,
  XIcon,
} from 'lucide-react';
import { GlassButton } from './glass-button';
import { formatCurrency } from '@/lib/balance';

interface AppFreeSpendPoolCardProps {
  appId: string;
  appName: string;
}

interface AppPoolInfo {
  freeSpendPoolAmount: number;
  maxPerUserPoolSpendAmount: number;
  totalPoolSpent: number; // Sum of all AppMembership.freeSpendPoolSpent for this app
}

const POOL_FUNDING_PACKAGES = [
  { amount: 50, price: 50, popular: false },
  { amount: 100, price: 100, popular: true },
  { amount: 250, price: 250, popular: false },
  { amount: 500, price: 500, popular: false },
];

export default function AppFreeSpendPoolCard({
  appId,
  appName,
}: AppFreeSpendPoolCardProps) {
  const [loading, setLoading] = useState(false);
  const [poolInfo, setPoolInfo] = useState<AppPoolInfo | null>(null);
  const [poolInfoLoading, setPoolInfoLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(
    POOL_FUNDING_PACKAGES[1]
  ); // Default to popular option
  const [showFundingModal, setShowFundingModal] = useState(false);

  // Per user limit editing state
  const [editingPerUserLimit, setEditingPerUserLimit] = useState(false);
  const [newPerUserLimit, setNewPerUserLimit] = useState(0);
  const [updatingPerUserLimit, setUpdatingPerUserLimit] = useState(false);
  const [perUserLimitError, setPerUserLimitError] = useState<string | null>(
    null
  );

  const fetchPoolInfo = useCallback(async () => {
    try {
      setPoolInfoLoading(true);
      const response = await fetch(`/api/apps/${appId}/pool-info`);
      const data = await response.json();

      if (response.ok) {
        setPoolInfo(data);
        setNewPerUserLimit(data.maxPerUserPoolSpendAmount);
      }
    } catch (error) {
      console.error('Error fetching pool info:', error);
    } finally {
      setPoolInfoLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetchPoolInfo();
  }, [fetchPoolInfo]);

  const handleFundPool = async (amount: number) => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description: `Fund Free Spend Pool - ${appName}`,
          successUrl: `${window.location.origin}/owner/apps/${appId}/dashboard?pool_funded=success`,
          paymentDestination: 'app_free_pool',
          echoAppId: appId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment link');
      }

      if (data.paymentLink?.url) {
        // Navigate to Stripe payment page
        window.location.href = data.paymentLink.url;
      }
    } catch (error) {
      console.error('Error creating payment link:', error);
      alert(
        `Error: ${error instanceof Error ? error.message : 'Failed to create payment link'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const updatePerUserLimit = async () => {
    if (newPerUserLimit < 0) {
      setPerUserLimitError('Per user limit cannot be negative');
      return;
    }

    if (newPerUserLimit > 10000) {
      setPerUserLimitError('Per user limit cannot exceed $10,000');
      return;
    }

    if (poolInfo && newPerUserLimit === poolInfo.maxPerUserPoolSpendAmount) {
      setEditingPerUserLimit(false);
      setPerUserLimitError(null);
      return;
    }

    try {
      setUpdatingPerUserLimit(true);
      setPerUserLimitError(null);

      const response = await fetch(`/api/apps/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxPerUserPoolSpendAmount: newPerUserLimit,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update per user limit');
      }

      // Update local state
      if (poolInfo) {
        setPoolInfo({
          ...poolInfo,
          maxPerUserPoolSpendAmount: newPerUserLimit,
        });
      }
      setEditingPerUserLimit(false);
    } catch (error) {
      console.error('Error updating per user limit:', error);
      setPerUserLimitError(
        error instanceof Error
          ? error.message
          : 'Failed to update per user limit'
      );
    } finally {
      setUpdatingPerUserLimit(false);
    }
  };

  const cancelEditPerUserLimit = () => {
    if (poolInfo) {
      setNewPerUserLimit(poolInfo.maxPerUserPoolSpendAmount);
    }
    setEditingPerUserLimit(false);
    setPerUserLimitError(null);
  };

  const availableAmount = poolInfo
    ? poolInfo.freeSpendPoolAmount - poolInfo.totalPoolSpent
    : 0;
  const utilizationPercentage =
    poolInfo && poolInfo.freeSpendPoolAmount > 0
      ? (poolInfo.totalPoolSpent / poolInfo.freeSpendPoolAmount) * 100
      : 0;

  const getUtilizationColor = () => {
    if (utilizationPercentage >= 90)
      return 'from-red-500/20 to-red-600/30 border-red-500/30';
    if (utilizationPercentage >= 70)
      return 'from-orange-500/20 to-orange-600/30 border-orange-500/30';
    return 'from-green-500/20 to-green-600/30 border-green-500/30';
  };

  const getProgressBarColor = () => {
    if (utilizationPercentage >= 90) return 'from-red-400 to-red-600';
    if (utilizationPercentage >= 70) return 'from-orange-400 to-orange-600';
    return 'from-green-400 to-green-600';
  };

  return (
    <>
      <div className="group relative bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-xl rounded-2xl border border-border/50 p-8 shadow-2xl shadow-black/5 hover:shadow-black/10 transition-all duration-500 hover:scale-[1.02] hover:border-border/70">
        {/* Ambient glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Header */}
        <div className="relative flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative w-14 h-14 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-2xl flex items-center justify-center ring-1 ring-green-500/20 shadow-lg shadow-green-500/10">
              <WalletIcon className="h-7 w-7 text-green-500" />
              <div className="absolute -top-1 -right-1">
                <SparklesIcon className="h-4 w-4 text-green-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Free Spend Pool
              </h3>
              <p className="text-muted-foreground/90 font-medium">
                Fund credits for your users to consume
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 px-4 py-2 bg-muted/20 rounded-xl border border-border/30">
            <InfoIcon className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Owner funded
            </span>
          </div>
        </div>

        {poolInfoLoading ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-muted/30 border-t-green-500"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-500/20 to-green-600/20 animate-pulse"></div>
            </div>
            <p className="text-muted-foreground font-medium">
              Loading pool information...
            </p>
          </div>
        ) : poolInfo ? (
          <>
            {/* Pool Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: 'Total Pool',
                  value: formatCurrency(poolInfo.freeSpendPoolAmount),
                  color: 'text-foreground',
                  bgColor: 'from-slate-500/10 to-slate-600/20',
                  icon: WalletIcon,
                },
                {
                  label: 'Available',
                  value: formatCurrency(availableAmount),
                  color: 'text-green-600 dark:text-green-400',
                  bgColor: 'from-green-500/10 to-green-600/20',
                  icon: TrendingUpIcon,
                },
                {
                  label: 'Used',
                  value: formatCurrency(poolInfo.totalPoolSpent),
                  color: 'text-orange-600 dark:text-orange-400',
                  bgColor: 'from-orange-500/10 to-orange-600/20',
                  icon: DollarSignIcon,
                },
                {
                  label: 'Per User Limit',
                  value: formatCurrency(poolInfo.maxPerUserPoolSpendAmount),
                  color: 'text-blue-600 dark:text-blue-400',
                  bgColor: 'from-blue-500/10 to-blue-600/20',
                  icon: InfoIcon,
                  editable: true,
                },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className={`relative group/stat text-center p-5 bg-gradient-to-br ${stat.bgColor} rounded-xl border border-border/30 hover:border-border/50 transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className="h-4 w-4 text-muted-foreground/60" />
                  </div>
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                    {stat.label}
                  </div>

                  {/* Edit button for per user limit */}
                  {stat.editable && (
                    <button
                      onClick={() => setEditingPerUserLimit(true)}
                      className="opacity-0 group-hover/stat:opacity-100 transition-opacity duration-200 absolute top-2 right-2 w-6 h-6 bg-blue-500/20 hover:bg-blue-500/30 rounded-md flex items-center justify-center border border-blue-500/30"
                    >
                      <EditIcon className="h-3 w-3 text-blue-600" />
                    </button>
                  )}

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>

            {/* Per User Limit Editing Modal */}
            {editingPerUserLimit && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl w-full max-w-md">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-xl flex items-center justify-center">
                          <InfoIcon className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">
                            Edit Per User Limit
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Set maximum spend per user from the free pool
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={cancelEditPerUserLimit}
                        className="w-8 h-8 rounded-lg bg-muted/20 hover:bg-muted/30 border border-border/30 hover:border-border/50 text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center justify-center"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Per User Limit ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10000"
                          step="0.01"
                          value={newPerUserLimit}
                          onChange={e =>
                            setNewPerUserLimit(parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-4 py-3 border border-input bg-input/50 text-input-foreground rounded-xl text-lg font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                          placeholder="0.00"
                          disabled={updatingPerUserLimit}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Maximum amount each user can spend from the free pool
                          (0 = unlimited)
                        </p>
                      </div>

                      {perUserLimitError && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {perUserLimitError}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={cancelEditPerUserLimit}
                        disabled={updatingPerUserLimit}
                        className="flex-1 px-4 py-3 bg-muted/20 hover:bg-muted/30 border border-border/30 hover:border-border/50 rounded-xl text-foreground font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={updatePerUserLimit}
                        disabled={updatingPerUserLimit}
                        className="flex-1 relative overflow-hidden bg-gradient-to-r from-blue-500/10 via-blue-500/15 to-blue-600/10 hover:from-blue-500/20 hover:via-blue-500/25 hover:to-blue-600/20 border border-blue-500/30 hover:border-blue-400/50 rounded-xl px-4 py-3 text-blue-700 dark:text-blue-300 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="relative flex items-center justify-center space-x-2">
                          {updatingPerUserLimit ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500/30 border-t-blue-500" />
                          ) : (
                            <SaveIcon className="h-4 w-4" />
                          )}
                          <span>
                            {updatingPerUserLimit ? 'Saving...' : 'Save'}
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Usage Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center text-sm font-semibold mb-4">
                <span className="text-foreground">Pool Utilization</span>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-lg font-bold ${utilizationPercentage >= 90 ? 'text-red-500' : utilizationPercentage >= 70 ? 'text-orange-500' : 'text-green-500'}`}
                  >
                    {utilizationPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="w-full bg-gradient-to-r from-muted/30 to-muted/50 rounded-full h-4 shadow-inner">
                  <div
                    className={`h-4 rounded-full bg-gradient-to-r ${getProgressBarColor()} transition-all duration-1000 ease-out shadow-lg relative overflow-hidden`}
                    style={{
                      width: `${Math.min(utilizationPercentage, 100)}%`,
                    }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
                  </div>
                </div>
                {/* Threshold indicators */}
                <div className="absolute top-0 left-[70%] w-0.5 h-4 bg-orange-400/60" />
                <div className="absolute top-0 left-[90%] w-0.5 h-4 bg-red-400/60" />
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowFundingModal(true)}
                disabled={loading}
                className="group/btn flex-1 relative overflow-hidden bg-gradient-to-r from-green-500/10 via-green-500/15 to-green-600/10 hover:from-green-500/20 hover:via-green-500/25 hover:to-green-600/20 border border-green-500/30 hover:border-green-400/50 rounded-xl px-6 py-4 text-green-700 dark:text-green-300 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="relative flex items-center justify-center space-x-3">
                  <PlusIcon className="h-5 w-5 transition-transform duration-300 group-hover/btn:rotate-90" />
                  <span>{loading ? 'Processing...' : 'Fund Pool'}</span>
                </div>
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/10 to-green-400/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
              </button>

              <button
                onClick={fetchPoolInfo}
                disabled={poolInfoLoading}
                className="group/refresh px-6 py-4 bg-gradient-to-r from-muted/20 to-muted/30 hover:from-muted/30 hover:to-muted/40 border border-border/50 hover:border-border/70 rounded-xl text-foreground font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCwIcon
                  className={`h-5 w-5 transition-transform duration-300 ${poolInfoLoading ? 'animate-spin' : 'group-hover/refresh:rotate-180'}`}
                />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12 space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <InfoIcon className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground mb-2">
                Unable to load pool information
              </p>
              <p className="text-muted-foreground">
                Please check your connection and try again
              </p>
            </div>
            <button
              onClick={fetchPoolInfo}
              className="px-6 py-3 bg-gradient-to-r from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 border border-blue-500/30 hover:border-blue-400/50 rounded-xl text-blue-600 dark:text-blue-400 font-semibold transition-all duration-300 hover:scale-105"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Funding Modal */}
      {showFundingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl w-full max-w-lg transform animate-in zoom-in-95 duration-300">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-xl flex items-center justify-center">
                    <DollarSignIcon className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">
                      Fund Free Spend Pool
                    </h3>
                    <p className="text-muted-foreground">
                      Add credits to your pool
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFundingModal(false)}
                  className="w-10 h-10 rounded-xl bg-muted/20 hover:bg-muted/30 border border-border/30 hover:border-border/50 text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center justify-center text-xl font-light"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6 mb-8">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    💡 Choose an amount to add to your app&apos;s free spend
                    pool. Users will be able to consume these credits for free.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {POOL_FUNDING_PACKAGES.map((pkg, index) => (
                    <button
                      key={pkg.amount}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`relative p-6 rounded-xl border transition-all duration-300 transform hover:scale-105 ${
                        selectedPackage.amount === pkg.amount
                          ? 'border-green-500/50 bg-gradient-to-br from-green-500/10 to-green-600/20 text-green-600 dark:text-green-400 shadow-lg shadow-green-500/20'
                          : 'border-border/30 bg-gradient-to-br from-muted/10 to-muted/20 hover:border-border/50 hover:bg-muted/20'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">
                            ⭐ Popular
                          </span>
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-2xl font-bold mb-1">
                          {formatCurrency(pkg.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                          Fund {pkg.amount} credits
                        </div>
                      </div>
                      {/* Selection indicator */}
                      {selectedPackage.amount === pkg.amount && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full shadow-lg" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowFundingModal(false)}
                  className="flex-1 px-6 py-4 bg-muted/20 hover:bg-muted/30 border border-border/30 hover:border-border/50 rounded-xl text-foreground font-semibold transition-all duration-300 hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowFundingModal(false);
                    handleFundPool(selectedPackage.amount);
                  }}
                  disabled={loading}
                  className="flex-1 relative overflow-hidden bg-gradient-to-r from-green-500/10 via-green-500/15 to-green-600/10 hover:from-green-500/20 hover:via-green-500/25 hover:to-green-600/20 border border-green-500/30 hover:border-green-400/50 rounded-xl px-6 py-4 text-green-700 dark:text-green-300 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="relative flex items-center justify-center space-x-3">
                    <DollarSignIcon className="h-5 w-5" />
                    <span>Fund {formatCurrency(selectedPackage.amount)}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(300%) skewX(-12deg);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </>
  );
}
