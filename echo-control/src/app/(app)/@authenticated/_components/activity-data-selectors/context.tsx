'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { subDays } from 'date-fns';

import { ActivityTimeframe } from './types';

interface ActivityContextType {
  startDate: Date;
  endDate: Date;
  timeframe: ActivityTimeframe;
  setTimeframe: (timeframe: ActivityTimeframe) => void;
  setDateRange: (startDate: Date, endDate: Date) => void;
  isCumulative: boolean;
  setIsCumulative: (isCumulative: boolean) => void;
  createdAt?: Date;
}

export const ActivityContext = createContext<ActivityContextType>({
  startDate: new Date(),
  endDate: new Date(),
  timeframe: ActivityTimeframe.SevenDays,
  setTimeframe: () => {},
  setDateRange: () => {},
  isCumulative: false,
  setIsCumulative: () => {},
  createdAt: undefined,
});

interface Props {
  children: React.ReactNode;
  initialStartDate: Date;
  initialEndDate: Date;
  initialTimeframe: ActivityTimeframe;
  createdAt?: Date;
}

export const ActivityContextProvider = ({
  children,
  initialStartDate,
  initialEndDate,
  initialTimeframe = ActivityTimeframe.SevenDays,
  createdAt,
}: Props) => {
  const [timeframe, setTimeframe] =
    useState<ActivityTimeframe>(initialTimeframe);
  const [endDate, setEndDate] = useState<Date>(initialEndDate);
  const [startDate, setStartDate] = useState<Date>(initialStartDate);
  const [isCumulative, setIsCumulative] = useState<boolean>(false);

  useEffect(() => {
    if (timeframe === ActivityTimeframe.Custom) {
      return;
    }

    if (timeframe === ActivityTimeframe.AllTime) {
      // Set start date to app creation date if available
      if (createdAt) {
        setStartDate(createdAt);
        setEndDate(new Date());
      }
      return;
    }

    setStartDate(subDays(new Date(), timeframe));
    setEndDate(new Date());
  }, [timeframe, createdAt]);

  const setDateRange = (startDate: Date, endDate: Date) => {
    setStartDate(startDate);
    setEndDate(endDate);
  };

  return (
    <ActivityContext.Provider
      value={{
        startDate,
        endDate,
        timeframe,
        setTimeframe,
        setDateRange,
        isCumulative,
        setIsCumulative,
        createdAt,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivityContext = () => {
  return useContext(ActivityContext);
};
