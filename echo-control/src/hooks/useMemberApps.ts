import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { CustomerEchoApp } from '@/lib/echo-apps/types';

interface UseMemberAppsReturn {
  memberApps: CustomerEchoApp[];
  loading: boolean;
  error: string | null;
}

export function useMemberApps(): UseMemberAppsReturn {
  const { isLoaded } = useUser();
  const [memberApps, setMemberApps] = useState<CustomerEchoApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberApps = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/apps');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch echo apps');
      }

      const allApps = (data.apps || []) as CustomerEchoApp[];

      // Since we're specifically fetching customer apps, all apps should be CustomerEchoApp
      const membershipApps = allApps.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setMemberApps(membershipApps);
    } catch (error) {
      console.error('Error fetching member apps:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to fetch member apps'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      fetchMemberApps();
    }
  }, [isLoaded, fetchMemberApps]);

  return {
    memberApps,
    loading,
    error,
  };
}
