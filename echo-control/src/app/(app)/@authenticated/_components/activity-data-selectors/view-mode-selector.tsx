'use client';

import { BarChart3, TrendingUp } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { useActivityContext } from './context';

export const ViewModeSelector: React.FC = () => {
  const { isCumulative, setIsCumulative } = useActivityContext();
  return (
    <div className="flex items-center h-6">
      <Select
        value={isCumulative ? 'cumulative' : 'timeseries'}
        onValueChange={value => {
          setIsCumulative(value === 'cumulative');
        }}
      >
        <SelectTrigger className="border-border shadow-none text-xs">
          <span className="flex items-center gap-2">
            {isCumulative ? (
              <TrendingUp className="size-4" />
            ) : (
              <BarChart3 className="size-4" />
            )}
            {isCumulative ? 'Cumulative' : 'Time Series'}
          </span>
        </SelectTrigger>
        <SelectContent align="start">
          <SelectItem value="timeseries">Time Series</SelectItem>
          <SelectItem value="cumulative">Cumulative</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
