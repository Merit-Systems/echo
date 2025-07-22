import { useState, useEffect, useCallback } from 'react';
import { PublicEchoApp } from '@/lib/types/apps';

interface UsePopularAppsReturn {
  apps: PublicEchoApp[];
  loading: boolean;
  error: string | null;
}

export function usePopularApps(): UsePopularAppsReturn {
  const [apps, setApps] = useState<PublicEchoApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularApps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/apps/public');
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const data = await response.json();
      const popularApps = data.apps as PublicEchoApp[];
      setApps(popularApps);
    } catch (error) {
      console.error('Error fetching popular apps:', error);
      setError('Failed to fetch popular apps.');
      setApps([]); // Clear apps on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPopularApps();
  }, [fetchPopularApps]);

  return {
    apps,
    loading,
    error,
  };
}
