'use client';

import { format, subDays } from 'date-fns';
import { Charts, LoadingCharts } from '@/app/(app)/_components/charts';
import { ChartData } from '@/app/(app)/_components/charts/base-chart';

import { api } from '@/trpc/client';
import { useActivityContext } from '../../../../../../_components/time-range-selector/context';

import { formatCurrency } from '@/lib/utils';
import { useMemo } from 'react';

interface Props {
  appId: string;
}

export const ActivityCharts: React.FC<Props> = ({ appId }) => {
  const { startDate, endDate } = useActivityContext();

  const [activity] = api.apps.app.stats.bucketed.useSuspenseQuery(
    {
      appId,
      startDate,
      endDate,
    },
    {
      refetchInterval: 15000,
    }
  );

  const [isOwner] = api.apps.app.isOwner.useSuspenseQuery(appId);
  const [numTokens] = api.apps.app.getNumTokens.useSuspenseQuery({ appId });
  const [numTransactions] = api.apps.app.transactions.count.useSuspenseQuery({
    appId,
  });

  const isInitialized = useMemo(() => {
    return !isOwner || (numTokens > 0 && numTransactions > 0);
  }, [isOwner, numTokens, numTransactions]);

  // Transform data for the chart
  const chartData: ChartData<Omit<(typeof activity)[number], 'timestamp'>>[] =
    useMemo(() => {
      if (!isInitialized) {
        return Array.from({ length: 48 }, (_, i) => ({
          timestamp: format(subDays(new Date(), i), 'MMM dd HH:mm yyyy'),
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
    }, [activity, isInitialized]);

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
            amount: numTokens === 0 ? '--' : formatCurrency(totalProfit),
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
            amount:
              numTokens === 0
                ? '--'
                : totalTokens.toLocaleString(undefined, {
                    notation: 'compact',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  }),
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
            amount:
              numTokens === 0
                ? '--'
                : totalTransactions.toLocaleString(undefined, {
                    notation: 'compact',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  }),
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
    />
  );
};

export const LoadingActivityCharts = () => {
  return <LoadingCharts tabs={['Profit', 'Tokens', 'Transactions']} />;
};
