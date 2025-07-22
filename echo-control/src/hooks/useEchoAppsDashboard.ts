import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { DashboardEchoApp } from '@/lib/types/apps';

interface UseEchoAppsDashboardReturn {
  echoApps: DashboardEchoApp[];
  loading: boolean;
  error: string | null;
  deletingAppId: string | null;
  fetchEchoApps: () => Promise<void>;
  handleCreateApp: (appData: {
    name: string;
    description?: string;
    githubType?: 'user' | 'repo';
    githubId?: string;
  }) => Promise<void>;
  handleArchiveApp: (id: string) => Promise<void>;
}

export function useEchoAppsDashboard(): UseEchoAppsDashboardReturn {
  const { user, isLoaded } = useUser();
  const [echoApps, setEchoApps] = useState<DashboardEchoApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingAppId, setDeletingAppId] = useState<string | null>(null);

  const fetchEchoApps = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/apps');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch echo apps');
      }

      setEchoApps(data.apps || []);
    } catch (error) {
      console.error('Error fetching echo apps:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to fetch echo apps'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateApp = useCallback(
    async (appData: {
      name: string;
      description?: string;
      githubType?: 'user' | 'repo';
      githubId?: string;
    }) => {
      setError(null);
      const response = await fetch('/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create echo app');
      }

      await fetchEchoApps(); // Refresh the list
    },
    [fetchEchoApps]
  );

  const handleArchiveApp = useCallback(
    async (id: string) => {
      setDeletingAppId(id);
      setError(null);

      try {
        const response = await fetch(`/api/apps/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to archive echo app');
        }

        await fetchEchoApps(); // Refresh the list
      } catch (error) {
        console.error('Error archiving echo app:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to archive echo app'
        );
      } finally {
        setDeletingAppId(null);
      }
    },
    [fetchEchoApps]
  );

  useEffect(() => {
    if (isLoaded && user) {
      fetchEchoApps();
    }
  }, [isLoaded, user, fetchEchoApps]);

  return {
    echoApps,
    loading,
    error,
    deletingAppId,
    fetchEchoApps,
    handleCreateApp,
    handleArchiveApp,
  };
}
