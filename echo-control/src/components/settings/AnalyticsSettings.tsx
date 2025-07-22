'use client';

import React from 'react';
import {
  BarChart,
  TrendingUpIcon,
  UsersIcon,
  KeyIcon,
  DollarSignIcon,
} from 'lucide-react';
import { formatCurrency } from '@/lib/balance';
import { useAnalyticsSettings } from '@/hooks/useAnalyticsSettings';

interface AnalyticsSettingsProps {
  appId: string;
}

export default function AnalyticsSettings({ appId }: AnalyticsSettingsProps) {
  const { analytics, loading, error } = useAnalyticsSettings(appId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Analytics & Insights</h3>
        <p className="text-sm text-muted-foreground">
          Monitor your app&apos;s performance and user engagement
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="text-sm text-destructive-foreground">{error}</div>
        </div>
      )}

      {analytics && (
        <>
          {/* Analytics Overview */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center mb-4">
              <BarChart className="h-5 w-5 mr-2 text-muted-foreground" />
              <h4 className="text-sm font-semibold text-foreground">
                Overview
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="group relative bg-muted/30 hover:bg-muted/50 transition-all duration-300 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {analytics.totalUsers}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <UsersIcon className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="group relative bg-muted/30 hover:bg-muted/50 transition-all duration-300 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      API Keys
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {analytics.totalApiKeys}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <KeyIcon className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="group relative bg-muted/30 hover:bg-muted/50 transition-all duration-300 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(analytics.totalSpent)}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    <DollarSignIcon className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>
              </div>

              <div className="group relative bg-muted/30 hover:bg-muted/50 transition-all duration-300 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Avg per User
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      $
                      {analytics.totalUsers > 0
                        ? (analytics.totalSpent / analytics.totalUsers).toFixed(
                            2
                          )
                        : '0.00'}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUpIcon className="h-4 w-4 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          {analytics.topUsers.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center mb-4">
                <TrendingUpIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                <h4 className="text-sm font-semibold text-foreground">
                  Top Performers
                </h4>
              </div>

              <div className="space-y-3">
                {analytics.topUsers.slice(0, 10).map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {user.name || user.email}
                        </p>
                        {user.name && (
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-sm font-bold text-foreground">
                        {formatCurrency(user.totalSpent)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.apiKeyCount} keys
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
