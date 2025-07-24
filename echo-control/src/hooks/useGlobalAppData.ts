import { useState, useEffect, useCallback } from 'react';
import { OwnerEchoApp, CustomerEchoApp } from '@/lib/echo-apps/types';

type AppWithPossibleGlobalData = CustomerEchoApp | OwnerEchoApp;

interface UseGlobalAppDataReturn {
  enhancedApp: OwnerEchoApp;
  isLoadingGlobal: boolean;
  fetchGlobalData: () => Promise<void>;
}

export function useGlobalAppData(
  app: AppWithPossibleGlobalData
): UseGlobalAppDataReturn {
  const [enhancedApp, setEnhancedApp] = useState<OwnerEchoApp>(
    app as OwnerEchoApp
  );
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);

  // Function to fetch global data
  const fetchGlobalData = useCallback(async () => {
    // Check if this is already an OwnerEchoApp with global data
    if ('globalTotalTransactions' in app.stats) {
      setEnhancedApp(app as OwnerEchoApp);
      return;
    }

    setIsLoadingGlobal(true);
    try {
      const response = await fetch(`/api/apps/${app.id}?view=global`);
      if (!response.ok) {
        throw new Error('Failed to fetch global data');
      }
      const globalData = (await response.json()) as OwnerEchoApp;
      setEnhancedApp(globalData);
    } catch (error) {
      console.error('Error fetching global data:', error);
    } finally {
      setIsLoadingGlobal(false);
    }
  }, [app]);

  // Update enhanced app when the base app changes
  useEffect(() => {
    if ('globalTotalTransactions' in app.stats) {
      setEnhancedApp(app as OwnerEchoApp);
    }
  }, [app]);

  return {
    enhancedApp,
    isLoadingGlobal,
    fetchGlobalData,
  };
}
