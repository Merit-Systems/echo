import { useState, useEffect } from 'react';

interface UserApiKeyStatus {
  isLoading: boolean;
  hasValidApiKey: boolean;
  requiresSetup: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useValidApiKey(): UserApiKeyStatus {
  const [isLoading, setIsLoading] = useState(true);
  const [hasValidApiKey, setHasValidApiKey] = useState(false);
  const [requiresSetup, setRequiresSetup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserStatus = async () => {
    setIsLoading(true);
    setError(null);

    const response = await fetch('/api/user');

    if (!response.ok) {
      if (response.status === 401) {
        setError('Not authenticated');
        setHasValidApiKey(false);
        setRequiresSetup(false);
      } else {
        setError('Failed to check user status');
        setHasValidApiKey(false);
        setRequiresSetup(false);
      }
      setIsLoading(false);
      return;
    }

    const data = await response.json();

    setRequiresSetup(data.requiresSetup || false);
    setHasValidApiKey(!data.requiresSetup && data.user?.hasApiKey);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUserStatus();
  }, []);

  return {
    isLoading,
    hasValidApiKey,
    requiresSetup,
    error,
    refetch: fetchUserStatus,
  };
}
