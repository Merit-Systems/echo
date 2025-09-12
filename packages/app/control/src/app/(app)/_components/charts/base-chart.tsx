import {
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
  ResponsiveContainer,
  BarProps,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { format, subDays } from 'date-fns';
import { useMemo } from 'react';
import { TooltipContent, TooltipRowProps } from './tooltip';

export type ChartData<T extends Record<string, number>> = {
  timestamp: string;
} & T;

export interface ChartProps<T extends Record<string, number>> {
  data: ChartData<T>[];
  bars: Array<
    BarProps & {
      dataKey: keyof T;
      color: string;
    }
  >;
  children?: React.ReactNode;
  tooltipRows?: Array<TooltipRowProps<T>>;
  height?: number | string;
}

export const BaseChart = <T extends Omit<Record<string, number>, 'timestamp'>>({
  data,
  children,
  tooltipRows,
  bars,
  height = 350,
}: ChartProps<T>) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 6, left: 6, bottom: 0 }}>
        <defs>
          {bars.map(({ dataKey, color }) => (
            <linearGradient
              key={dataKey as string}
              id={`${dataKey as string}-gradient`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={color} stopOpacity={0.9} />
              <stop offset="100%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          ))}
        </defs>
        <XAxis
          tickLine={false}
          tick={false}
          axisLine={false}
          interval="preserveEnd"
          height={0}
        />
        <YAxis domain={['0', 'dataMax']} hide={true} />
        {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
        {bars.map(({ dataKey, color, ref, ...barProps }, index) => {
          return (
            <Bar
              key={dataKey as string}
              isAnimationActive={index === bars.length - 1}
              dataKey={dataKey as string}
              stackId="1"
              fill={`color-mix(in oklab, ${color} 40%, transparent)`}
              stroke={color}
              radius={index === bars.length - 1 ? [4, 4, 0, 0] : undefined}
              {...barProps}
            />
          );
        })}
        {children}
        {tooltipRows && (
          <Tooltip
            content={({ payload }) => {
              if (payload && payload.length) {
                return (
                  <Card className="p-2">
                    <TooltipContent
                      data={payload[0].payload as ChartData<T>}
                      rows={tooltipRows}
                    />
                  </Card>
                );
              }
              return null;
            }}
            cursor={{
              fill: 'var(--color-neutral-500)',
              opacity: 0.3,
              radius: 4,
            }}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};

const simulateChartData = () => {
  const data: ChartData<{ value: number }>[] = [];
  const baseValue = 10;
  const variance = 20;
  let currentValue = baseValue;

  for (let i = 48; i >= 0; i--) {
    const date = subDays(new Date(), i);
    // Increment can be positive or negative, with some random variation
    const increment = (Math.random() - 0.5) * 2 * variance; // Range: -variance to +variance
    if (i !== 48) {
      currentValue += increment;
    }
    data.push({
      timestamp: format(date, 'MMM dd'),
      value: Math.max(0, Math.round(currentValue)),
    });
  }

  return data;
};

export const LoadingChart = ({
  height = 350,
}: {
  height?: number | string;
}) => {
  const simulatedData = useMemo(simulateChartData, []);

  return (
    <div className="animate-pulse">
      <BaseChart
        data={simulatedData}
        bars={[
          {
            dataKey: 'value',
            color:
              'color-mix(in oklab, var(--color-neutral-500) 20%, transparent)',
            isAnimationActive: false,
          },
        ]}
        height={height}
      />
    </div>
  );
};
