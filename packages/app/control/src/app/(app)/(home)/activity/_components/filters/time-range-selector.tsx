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
import { useFiltersContext } from '../../contexts/filters-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';

import { ActivityTimeframe } from '@/types/timeframes';
import { cn } from '@/lib/utils';

export const RangeSelector = () => {
  const { startDate, endDate, setDateRange, timeframe, setTimeframe } =
    useFiltersContext();

  // Get only the numeric enum values
  const timeframeValues = Object.values(ActivityTimeframe).filter(
    value => typeof value === 'number'
  ) as ActivityTimeframe[];

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
            className={cn(
              'rounded-r-none shadow-none border-r-[0.5px]',
              timeframe !== ActivityTimeframe.Custom && 'text-muted-foreground'
            )}
          >
            <CalendarDays className="size-4" />
            {timeframe === ActivityTimeframe.Custom && (
              <span>{formatRange(startDate!, endDate!)}</span>
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
        <SelectTrigger
          className={cn(
            'rounded-l-none border-border shadow-none border-l-[0.5px]',
            timeframe === ActivityTimeframe.AllTime && 'text-muted-foreground'
          )}
        >
          {timeframe !== ActivityTimeframe.Custom && (
            <span>
              {timeframe === ActivityTimeframe.AllTime
                ? 'All Time'
                : timeframe === ActivityTimeframe.OneDay
                  ? 'Past 24 Hours'
                  : `Past ${timeframe} Days`}
            </span>
          )}
        </SelectTrigger>
        <SelectContent align="end">
          {timeframeValues.map(value => (
            <SelectItem key={value} value={value.toString()}>
              {value === ActivityTimeframe.Custom
                ? 'Custom'
                : value === ActivityTimeframe.AllTime
                  ? 'All Time'
                  : value === ActivityTimeframe.OneDay
                    ? 'Past 24 Hours'
                    : `Past ${value} Days`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
