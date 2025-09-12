'use client';

import { BaseChart, ChartData, ChartProps, LoadingChart } from './base-chart';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsTriggerProps,
} from './tabs';

interface TabProps<T extends Record<string, number>> {
  trigger: TabsTriggerProps;
  bars: ChartProps<T>['bars'];
  tooltipRows?: ChartProps<T>['tooltipRows'];
}

interface Props<T extends Record<string, number>> {
  chartData: ChartData<T>[];
  tabs: TabProps<T>[];
  height?: number | string;
}

export const Charts = <T extends Record<string, number>>({
  tabs,
  chartData,
  height,
}: Props<T>) => {
  return (
    <Tabs defaultValue={tabs[0].trigger.value} className="h-full">
      <TabsList>
        {tabs.map(tab => (
          <TabsTrigger key={tab.trigger.label} {...tab.trigger} />
        ))}
      </TabsList>
      {tabs.map(({ trigger, bars, tooltipRows }) => (
        <TabsContent
          key={trigger.label}
          value={trigger.value}
          className="flex-1 h-0"
        >
          <BaseChart
            data={chartData}
            bars={bars}
            tooltipRows={tooltipRows}
            height={height}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

interface LoadingChartsProps {
  tabs: string[];
  height?: number | string;
}

export const LoadingCharts: React.FC<LoadingChartsProps> = ({
  tabs,
  height,
}) => {
  return (
    <div className="animate-pulse">
      <Tabs defaultValue={tabs[0]}>
        <TabsList>
          {tabs.map(tab => (
            <TabsTrigger key={tab} value={tab} label={tab} isLoading={true} />
          ))}
        </TabsList>
        {tabs.map(tab => (
          <TabsContent key={tab} value={tab}>
            <LoadingChart height={height} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
