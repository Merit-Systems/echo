import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

import { ChartData } from './base-chart';

export interface TooltipRowProps<
  T extends Record<string, number>,
  K extends keyof T = keyof T,
> {
  key: K;
  label: string;
  getValue: (data: T[K]) => string;
  labelClassName?: string;
  valueClassName?: string;
}

interface Props<T extends Record<string, number>> {
  data: ChartData<T>;
  rows: Array<TooltipRowProps<T>>;
  isCumulative?: boolean;
}

export const TooltipContent = <T extends Record<string, number>>({
  data,
  rows,
  isCumulative = false,
}: Props<T>) => {
  return (
    <div>
      <TooltipDate
        date={new Date(data.timestamp)}
        isCumulative={isCumulative}
      />
      <Separator className="my-2" />
      {rows.map(row => (
        <TooltipRow
          {...row}
          key={row.key as string}
          value={row.getValue(data[row.key])}
        />
      ))}
    </div>
  );
};

export const TooltipRow = <
  T extends Record<string, number>,
  K extends keyof T,
>({
  label,
  value,
  labelClassName,
  valueClassName,
}: TooltipRowProps<T, K> & {
  value: string;
}) => {
  return (
    <div className="flex justify-between w-full gap-4">
      <p className={cn('text-sm text-muted-foreground', labelClassName)}>
        {label}
      </p>
      <p
        className={cn(
          'text-sm text-muted-foreground font-medium',
          valueClassName
        )}
      >
        {value}
      </p>
    </div>
  );
};

const TooltipDate = ({
  date,
  isCumulative,
}: {
  date: Date;
  isCumulative?: boolean;
}) => {
  return (
    <div className="flex justify-between items-center w-full gap-4">
      <div className="flex flex-col">
        <p className="font-medium">{format(date, 'MMMM d, yyyy')}</p>
        {isCumulative && (
          <p className="text-xs text-muted-foreground">
            Total up to this point
          </p>
        )}
      </div>
      <p className="text-sm opacity-60">{format(date, 'h:mm a')}</p>
    </div>
  );
};
