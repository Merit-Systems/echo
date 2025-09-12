import { Skeleton } from '@/components/ui/skeleton';
import { RangeSelector } from './time-range-selector';
import { AppsFilter } from './apps-filter';
import { EventTypesFilter } from './event-types-filter';

export const ActivityFilters = () => {
  return (
    <FiltersContainer>
      <AppsFilter />
      <EventTypesFilter />
      <RangeSelector />
    </FiltersContainer>
  );
};

export const LoadingActivityFilters = () => {
  return (
    <FiltersContainer>
      <Skeleton className="w-24 h-9" />
      <Skeleton className="w-24 h-9" />
      <Skeleton className="w-24 h-9" />
    </FiltersContainer>
  );
};

const FiltersContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center gap-3">{children}</div>;
};
