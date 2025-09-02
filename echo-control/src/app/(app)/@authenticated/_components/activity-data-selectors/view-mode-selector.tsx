'use client';

import { BarChart3, TrendingUp } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useActivityContext } from './context';

export const ViewModeSelector: React.FC = () => {
  const { isCumulative, setIsCumulative } = useActivityContext();
  return (
    <div className="flex items-center h-6">
      <Button
        size="icon"
        variant="outline"
        className="rounded-r-none shadow-none border-r-[0.5px]"
      >
        {isCumulative ? (
          <TrendingUp className="size-4" />
        ) : (
          <BarChart3 className="size-4" />
        )}
      </Button>
      <Select
        value={isCumulative ? 'cumulative' : 'timeseries'}
        onValueChange={value => {
          setIsCumulative(value === 'cumulative');
        }}
      >
        <SelectTrigger className="rounded-l-none border-border shadow-none border-l-[0.5px] text-xs">
          <span>{isCumulative ? 'Cumulative' : 'Time Series'}</span>
        </SelectTrigger>
        <SelectContent align="start">
          <SelectItem value="timeseries">Time Series</SelectItem>
          <SelectItem value="cumulative">Cumulative</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
