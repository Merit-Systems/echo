import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { AppRole } from '@/lib/permissions/types';
import { AuthenticatedEchoApp } from '@/lib/types/apps';

interface UseMyAppsReturn {
  userApps: AuthenticatedEchoApp[];
  loading: boolean;
  error: string | null;
}

export function useMyApps(): UseMyAppsReturn {
  const { user, isLoaded } = useUser();
  const [userApps, setUserApps] = useState<AuthenticatedEchoApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApps = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/owner/apps');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch echo apps');
      }

      const allApps = (data.apps || []) as AuthenticatedEchoApp[];

      // Filter for owner apps
      const owner = allApps.filter(app => app.userRole === AppRole.OWNER);

      setUserApps(owner);
    } catch (error) {
      console.error('Error fetching echo apps:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to fetch echo apps'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && user) {
      fetchApps();
    } else if (isLoaded && !user) {
      setLoading(false);
    }
  }, [isLoaded, user, fetchApps]);

  return {
    userApps,
    loading,
    error,
  };
}
