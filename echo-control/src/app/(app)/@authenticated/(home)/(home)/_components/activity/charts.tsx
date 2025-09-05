'use client';

import { format } from 'date-fns';
import {
  Charts,
  LoadingCharts,
} from '@/app/(app)/@authenticated/_components/charts';
import { ChartData } from '@/app/(app)/@authenticated/_components/charts/base-chart';

import { api } from '@/trpc/client';
import { useActivityContext } from '@/app/(app)/@authenticated/_components/activity-data-selectors/context';

import { formatCurrency } from '@/lib/utils';
import { useMemo } from 'react';

export const ActivityCharts: React.FC = () => {
  const { startDate, endDate, isCumulative } = useActivityContext();

  const [activity] = api.activity.creator.getCurrent.useSuspenseQuery({
    startDate,
    endDate,
    isCumulative,
  });
  const [numApps] = api.apps.count.owner.useSuspenseQuery();

  const hasApps = useMemo(() => {
    return numApps > 0;
  }, [numApps]);

  // Transform data for the chart
  const chartData: ChartData<Omit<(typeof activity)[number], 'timestamp'>>[] =
    useMemo(() => {
      if (!hasApps) {
        // Show placeholder data if user has no apps
        return Array.from({ length: 48 }, (_, i) => ({
          timestamp: format(
            new Date(Date.now() - i * 60 * 60 * 1000),
            'MMM dd HH:mm yyyy'
          ),
          totalProfit: Math.random() * 100,
          totalCost: Math.random() * 100,
          totalTokens: Math.random() * 100,
          totalInputTokens: Math.random() * 100,
          totalOutputTokens: Math.random() * 100,
          transactionCount: Math.random() * 100,
        }));
      }
      return activity.map(({ timestamp, ...rest }) => ({
        ...rest,
        timestamp: format(timestamp, 'MMM dd HH:mm yyyy'),
      }));
    }, [activity, hasApps]);

  const totalProfit = chartData.reduce(
    (acc, item) => acc + item.totalProfit,
    0
  );
  const totalTokens = chartData.reduce(
    (acc, item) => acc + item.totalTokens,
    0
  );
  const totalTransactions = chartData.reduce(
    (acc, item) => acc + item.transactionCount,
    0
  );

  return (
    <Charts
      tabs={[
        {
          trigger: {
            value: 'profit',
            label: 'Profit',
            amount: hasApps ? formatCurrency(totalProfit) : '--',
          },
          bars: [
            {
              dataKey: 'totalCost',
              color:
                'color-mix(in oklab, var(--color-muted-foreground) 40%, transparent)',
            },
            {
              dataKey: 'totalProfit',
              color: 'var(--color-primary)',
            },
          ],
          tooltipRows: [
            {
              key: 'totalProfit',
              label: 'Profit',
              getValue: data => formatCurrency(data),
              valueClassName: 'font-bold text-primary',
            },
            {
              key: 'totalCost',
              label: 'Cost',
              getValue: data => formatCurrency(data),
            },
          ],
        },
        {
          trigger: {
            value: 'tokens',
            label: 'Tokens',
            amount: hasApps
              ? totalTokens.toLocaleString(undefined, {
                  notation: 'compact',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })
              : '--',
          },
          bars: [
            {
              dataKey: 'totalInputTokens',
              color:
                'color-mix(in oklab, var(--color-primary) 40%, transparent)',
            },
            {
              dataKey: 'totalOutputTokens',
              color:
                'color-mix(in oklab, var(--color-primary) 100%, transparent)',
            },
          ],
          tooltipRows: [
            {
              key: 'totalInputTokens',
              label: 'Input Tokens',
              getValue: data =>
                data.toLocaleString(undefined, {
                  notation: 'compact',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 4,
                }),
            },
            {
              key: 'totalOutputTokens',
              label: 'Output Tokens',
              getValue: data =>
                data.toLocaleString(undefined, {
                  notation: 'compact',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 4,
                }),
            },
          ],
        },

        {
          trigger: {
            value: 'transactions',
            label: 'Transactions',
            amount: hasApps
              ? totalTransactions.toLocaleString(undefined, {
                  notation: 'compact',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })
              : '--',
          },
          bars: [
            {
              dataKey: 'transactionCount',
              color: 'var(--color-primary)',
            },
          ],
          tooltipRows: [
            {
              key: 'transactionCount',
              label: 'Transactions',
              getValue: data =>
                data.toLocaleString(undefined, {
                  notation: 'compact',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }),
            },
          ],
        },
      ]}
      chartData={chartData}
      isCumulative={isCumulative} // For tooltips
    />
  );
};

export const LoadingActivityCharts = () => {
  return <LoadingCharts tabs={['Profit', 'Tokens', 'Transactions']} />;
};
