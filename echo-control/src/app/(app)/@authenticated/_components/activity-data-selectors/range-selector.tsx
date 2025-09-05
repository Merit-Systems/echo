'use client';

import { format } from 'date-fns';

import { CalendarDays } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useActivityContext } from './context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';

import { ActivityTimeframe } from './types';

export const RangeSelector = () => {
  const {
    startDate,
    endDate,
    setDateRange,
    timeframe,
    setTimeframe,
    createdAt,
  } = useActivityContext();

  // Get only the numeric enum values
  const timeframeValues = Object.values(ActivityTimeframe).filter(
    value => typeof value === 'number'
  ) as ActivityTimeframe[];

  // Only show "All Time" if createdAt is available
  // We don't yet have a good concept for All Time for the user overview page
  const showAllTime = Boolean(createdAt);

  const formatRange = (startDate: Date, endDate: Date) => {
    if (startDate.getFullYear() === endDate.getFullYear()) {
      if (startDate.getMonth() === endDate.getMonth()) {
        // Same month and year: show month only once
        return `${format(startDate, 'MMM d')} - ${format(endDate, 'd')}`;
      }
      // Different month: show both
      return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`;
    }
    // Different month or year: show both
    return `${format(startDate, 'MMM d, yyyy')} - ${format(
      endDate,
      'MMM d, yyyy'
    )}`;
  };

  return (
    <div className="flex items-center h-6">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size={timeframe === ActivityTimeframe.Custom ? 'default' : 'icon'}
            variant="outline"
            className="rounded-r-none shadow-none border-r-[0.5px]"
          >
            <CalendarDays className="size-4" />
            {timeframe === ActivityTimeframe.Custom && (
              <span>{formatRange(startDate, endDate)}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 size-fit">
          <Calendar
            mode="range"
            selected={{
              from: startDate,
              to: endDate,
            }}
            onSelect={dateRange => {
              if (dateRange?.from && dateRange?.to) {
                setDateRange(dateRange.from, dateRange.to);
                setTimeframe(ActivityTimeframe.Custom);
              }
            }}
          />
        </PopoverContent>
      </Popover>
      <Select
        value={timeframe.toString()}
        onValueChange={value => {
          setTimeframe(Number(value));
        }}
      >
        <SelectTrigger className="rounded-l-none border-border shadow-none border-l-[0.5px] text-xs">
          {timeframe !== ActivityTimeframe.Custom && (
            <span>
              {timeframe === ActivityTimeframe.AllTime
                ? 'All Time'
                : timeframe === 1
                  ? 'Past 24 Hours'
                  : `Past ${timeframe} Days`}
            </span>
          )}
        </SelectTrigger>
        <SelectContent align="end">
          {timeframeValues
            .filter(value => showAllTime || value !== ActivityTimeframe.AllTime)
            .map(value => (
              <SelectItem key={value} value={value.toString()}>
                {value === ActivityTimeframe.AllTime
                  ? 'All Time'
                  : value === 0
                    ? 'Custom'
                    : value === 1
                      ? 'Past 24 Hours'
                      : `Past ${value} Days`}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
};
