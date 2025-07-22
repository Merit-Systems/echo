import { useState, useEffect, useCallback } from 'react';
import { EnhancedAppData, DetailedEchoApp } from '@/lib/types/apps';

interface UseGlobalAppDataReturn {
  enhancedApp: EnhancedAppData;
  isLoadingGlobal: boolean;
  fetchGlobalData: () => Promise<void>;
}

export function useGlobalAppData(app: DetailedEchoApp): UseGlobalAppDataReturn {
  const [enhancedApp, setEnhancedApp] = useState<EnhancedAppData>(app);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);

  // Function to fetch global data
  const fetchGlobalData = useCallback(async () => {
    if (enhancedApp.globalStats) return; // Already fetched

    setIsLoadingGlobal(true);
    try {
      const response = await fetch(`/api/apps/${app.id}?view=global`);
      if (!response.ok) {
        throw new Error('Failed to fetch global data');
      }
      const globalData = await response.json();
      setEnhancedApp(prev => ({
        ...prev,
        globalStats: globalData.stats,
        globalActivityData: globalData.activityData,
        globalRecentTransactions: globalData.recentTransactions,
      }));
    } catch (error) {
      console.error('Error fetching global data:', error);
    } finally {
      setIsLoadingGlobal(false);
    }
  }, [app.id, enhancedApp.globalStats]);

  // Update enhanced app when the base app changes
  useEffect(() => {
    setEnhancedApp(app);
  }, [app]);

  return {
    enhancedApp,
    isLoadingGlobal,
    fetchGlobalData,
  };
}
