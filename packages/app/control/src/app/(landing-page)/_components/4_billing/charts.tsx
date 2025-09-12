'use client';

import { Charts } from '@/app/(app)/_components/charts';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { chartData } from './data';

export const BillingSectionCharts = () => {
  const totalProfit = chartData.reduce(
    (sum, item) => sum + item.totalProfit,
    0
  );
  const totalTokens = chartData.reduce(
    (sum, item) => sum + item.totalTokens,
    0
  );
  const totalTransactions = chartData.reduce(
    (sum, item) => sum + item.transactionCount,
    0
  );
  const numTokens = totalTokens;

  return (
    <Card className="overflow-hidden w-full">
      <Charts
        chartData={chartData}
        tabs={[
          {
            trigger: {
              value: 'profit',
              label: 'Profit',
              amount: formatCurrency(totalProfit),
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
      />
    </Card>
  );
};
