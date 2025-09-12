'use client';

import { Suspense } from 'react';

import { Brain, X, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

import { useFiltersContext } from '../../contexts/filters-context';
import { FeedActivityType } from '@/services/feed/types';

export const EventTypesFilter = () => {
  const { eventType, setEventType } = useFiltersContext();

  return (
    <div className="flex">
      <Select
        value={eventType ?? ''}
        onValueChange={value => setEventType(value as FeedActivityType)}
      >
        <SelectTrigger>
          <SelectValue placeholder="All Events" />
        </SelectTrigger>
        <Suspense fallback={<Skeleton className="h-10 w-full" />}>
          <SelectContent>
            <SelectItem value={FeedActivityType.TRANSACTION}>
              <Brain className="size-4" />
              Transactions
            </SelectItem>
            <SelectItem value={FeedActivityType.SIGNIN}>
              <Users className="size-4" />
              Signins
            </SelectItem>
          </SelectContent>
        </Suspense>
      </Select>
      {eventType && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEventType(undefined)}
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
};
