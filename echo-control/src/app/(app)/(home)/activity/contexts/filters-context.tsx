'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { subDays } from 'date-fns';

import { ActivityTimeframe } from '@/types/timeframes';
import type { FeedActivityType } from '@/services/feed/types';

interface FiltersContextType {
  appId: string | undefined;
  setAppId: (appId: string | undefined) => void;
  startDate: Date | undefined;
  endDate: Date | undefined;
  setDateRange: (startDate: Date, endDate: Date) => void;
  timeframe: ActivityTimeframe;
  setTimeframe: (timeframe: ActivityTimeframe) => void;
  eventType: FeedActivityType | undefined;
  setEventType: (eventType: FeedActivityType | undefined) => void;
}

const FiltersContext = createContext<FiltersContextType>({
  appId: undefined,
  setAppId: () => void 0,
  startDate: new Date(),
  endDate: new Date(),
  setDateRange: () => void 0,
  timeframe: ActivityTimeframe.AllTime,
  setTimeframe: () => void 0,
  eventType: undefined,
  setEventType: () => void 0,
});

export const FiltersContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [appId, setAppId] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [timeframe, setTimeframe] = useState<ActivityTimeframe>(
    ActivityTimeframe.AllTime
  );

  const [eventType, setEventType] = useState<FeedActivityType | undefined>(
    undefined
  );

  useEffect(() => {
    if (timeframe === ActivityTimeframe.Custom) {
      return;
    }
    if (timeframe === ActivityTimeframe.AllTime) {
      setStartDate(new Date(0));
      setEndDate(new Date());
      return;
    }
    setStartDate(subDays(new Date(), timeframe));
    setEndDate(new Date());
  }, [timeframe]);

  const setDateRange = (startDate: Date, endDate: Date) => {
    setStartDate(startDate);
    setEndDate(endDate);
  };

  return (
    <FiltersContext.Provider
      value={{
        appId,
        setAppId,
        startDate,
        endDate,
        setDateRange,
        timeframe,
        setTimeframe,
        eventType,
        setEventType,
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
};

export const useFiltersContext = () => {
  if (!FiltersContext) {
    throw new Error(
      'useFiltersContext must be used within a FiltersContextProvider'
    );
  }
  return useContext(FiltersContext);
};
