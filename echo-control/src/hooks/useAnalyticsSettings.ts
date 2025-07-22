'use client';

import { useState, useEffect, useCallback } from 'react';

interface AppAnalytics {
  totalUsers: number;
  totalApiKeys: number;
  totalSpent: number;
  topUsers: Array<{
    id: string;
    email: string;
    name?: string;
    apiKeyCount: number;
    totalSpent: number;
  }>;
}

interface UseAnalyticsSettingsResult {
  analytics: AppAnalytics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAnalyticsSettings = (
  appId: string
): UseAnalyticsSettingsResult => {
  const [analytics, setAnalytics] = useState<AppAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/owner/apps/${appId}/analytics`);

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};
