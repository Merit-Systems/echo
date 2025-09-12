'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { subDays } from 'date-fns';

import { ActivityTimeframe } from '@/types/timeframes';

interface ActivityContextType {
  startDate: Date;
  endDate: Date;
  timeframe: ActivityTimeframe;
  setTimeframe: (timeframe: ActivityTimeframe) => void;
  setDateRange: (startDate: Date, endDate: Date) => void;
}

const ActivityContext = createContext<ActivityContextType>({
  startDate: new Date(),
  endDate: new Date(),
  timeframe: ActivityTimeframe.SevenDays,
  setTimeframe: () => {},
  setDateRange: () => {},
});

interface Props {
  children: React.ReactNode;
  initialStartDate: Date;
  initialEndDate: Date;
  creationDate: Date;
}

export const ActivityContextProvider = ({
  children,
  initialStartDate,
  initialEndDate,
  creationDate,
}: Props) => {
  const [timeframe, setTimeframe] = useState<ActivityTimeframe>(
    ActivityTimeframe.AllTime
  );
  const [endDate, setEndDate] = useState<Date>(initialEndDate);
  const [startDate, setStartDate] = useState<Date>(initialStartDate);

  useEffect(() => {
    if (timeframe === ActivityTimeframe.Custom) {
      return;
    }
    if (timeframe === ActivityTimeframe.AllTime) {
      setStartDate(creationDate);
      setEndDate(new Date());
      return;
    }
    setStartDate(subDays(new Date(), timeframe));
    setEndDate(new Date());
  }, [timeframe, creationDate]);

  const setDateRange = (startDate: Date, endDate: Date) => {
    setStartDate(startDate);
    setEndDate(endDate);
  };

  return (
    <ActivityContext.Provider
      value={{ startDate, endDate, timeframe, setTimeframe, setDateRange }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivityContext = () => {
  return useContext(ActivityContext);
};
