import { useCallback, useState } from 'react';

export interface UpdateAppData {
  name?: string;
  description?: string;
  githubType?: 'user' | 'repo';
  githubId?: string;
  authorizedCallbackUrls?: string[];
  profilePictureUrl?: string;
  bannerImageUrl?: string;
  homepageUrl?: string;
  isPublic?: boolean;
}

export interface UseUpdateAppReturn {
  updateApp: (appId: string, data: UpdateAppData) => Promise<void>;
  isUpdating: boolean;
  error: string | null;
  clearError: () => void;
}

export function useUpdateApp(): UseUpdateAppReturn {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateApp = useCallback(
    async (appId: string, data: UpdateAppData): Promise<void> => {
      try {
        setIsUpdating(true);
        setError(null);

        console.log('Updating app with data:', { appId, data });

        const response = await fetch(`/api/apps/${appId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const responseData = await response.json();

        console.log('Response data:', responseData);

        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to update echo app');
        }

        console.log('App updated successfully:', responseData);
      } catch (error) {
        console.error('Error updating app:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to update echo app';
        setError(errorMessage);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return {
    updateApp,
    isUpdating,
    error,
    clearError,
  };
}
