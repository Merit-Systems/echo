'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { EchoApp } from '@/lib/types/apps';

interface UseAllAppsResult {
  apps: EchoApp[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAllApps = (
  fetchApps: () => Promise<EchoApp[]>
): UseAllAppsResult => {
  const { isLoaded: isUserLoaded } = useUser();
  const [apps, setApps] = useState<EchoApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApps = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedApps = await fetchApps();
      setApps(fetchedApps);
    } catch (err) {
      console.error('Error fetching apps:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load applications.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUserLoaded) {
      loadApps();
    }
  }, [fetchApps, isUserLoaded, loadApps]);

  return {
    apps,
    loading,
    error,
    refetch: loadApps,
  };
};
