'use client';

import React from 'react';

import { XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Simulate trending up revenue data
// Generate a jagged quadratic: y = a*x^2 + b*x + c + jaggedness
const baseData = Array.from({ length: 20 }, (_, i) => {
  const x = i + 1;
  // Stronger upward trend, but with more jaggedness
  const a = 8;
  const b = 20;
  const c = 1000;
  // More jagged: sum of several random up/downs, and a bigger swing
  const jag =
    (Math.random() - 0.5) * 300 + // large random swing
    Math.sin(x * 1.2) * 150 + // periodic up/down
    (i % 3 === 0 ? 1 : -1) * (Math.random() * 180 + 90); // extra jag
  return {
    name: `Day ${x}`,
    usage: Math.max(0, Math.round(a * x * x + b * x + c + jag)),
  };
});

interface Props {
  markup: number;
}

export const ProfitChart: React.FC<Props> = ({ markup }) => {
  const data = baseData.map(item => ({
    ...item,
    profit: item.usage * markup,
  }));

  const MAX_VALUE = Math.max(...data.map(item => item.profit + item.usage));
  const NUM_TICKS = 4;
  const TICKS = Array.from({ length: NUM_TICKS + 1 }, (_, i) =>
    Math.round(MAX_VALUE * (i / NUM_TICKS))
  );

  return (
    <div className="w-full h-40 overflow-hidden relative">
      <div className="absolute top-2 left-2 flex flex-col gap-1 text-neutral-500 text-xs">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="bg-primary rounded-full size-2 animate-ping absolute inset-0" />
            <div className="bg-primary rounded-full size-2" />
          </div>
          <span className="text-primary font-bold">Your Profit</span>
        </div>
        <div className="flex items-center gap-2 opacity-60">
          <span className="bg-neutral-500 rounded-full size-2" />
          <span className="text-neutral-500">Token Spend</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 2,
            right: 0,
            left: 0,
            bottom: 2,
          }}
        >
          <XAxis hide />
          <YAxis
            domain={['0', 'dataMax']}
            orientation="right"
            tickFormatter={(value: number) =>
              `$${value.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}`
            }
            tickCount={4}
            tickLine={false}
            axisLine={false}
            tick={{
              fill: 'var(--color-neutral-500)',
              fontSize: 10,
            }}
            interval="preserveEnd"
            ticks={TICKS}
          />
          <Bar
            type="monotone"
            dataKey="usage"
            stackId="1"
            stroke="color-mix(in oklab, var(--color-neutral-500) 60%, transparent)"
            fill="color-mix(in oklab, var(--color-neutral-500) 20%, transparent)"
            radius={markup === 0 ? 4 : [0, 0, 4, 4]}
          />
          <Bar
            type="monotone"
            dataKey="profit"
            stackId="1"
            stroke="color-mix(in oklab, var(--color-primary) 100%, transparent)"
            fill="color-mix(in oklab, var(--color-primary) 60%, transparent)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const LoadingProfitChart = () => {
  const MAX_VALUE = Math.max(...baseData.map(({ usage }) => usage));
  const NUM_TICKS = 4;
  const TICKS = Array.from({ length: NUM_TICKS + 1 }, (_, i) =>
    Math.round(MAX_VALUE * (i / NUM_TICKS))
  );

  return (
    <div className="w-full h-40 overflow-hidden relative animate-pulse">
      <div className="absolute top-2 left-2 flex flex-col gap-1 text-neutral-500 text-xs">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="bg-primary rounded-full size-2 animate-ping absolute inset-0" />
            <div className="bg-primary rounded-full size-2" />
          </div>
          <span className="text-primary font-bold">Your Profit</span>
        </div>
        <div className="flex items-center gap-2 opacity-60">
          <span className="bg-neutral-500 rounded-full size-2" />
          <span className="text-neutral-500">Token Spend</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={baseData}
          margin={{
            top: 2,
            right: 0,
            left: 0,
            bottom: 2,
          }}
        >
          <XAxis hide />
          <YAxis
            domain={['0', 'dataMax']}
            orientation="right"
            tickFormatter={(value: number) =>
              `$${value.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}`
            }
            tickCount={4}
            tickLine={false}
            axisLine={false}
            tick={{
              fill: 'var(--color-neutral-500)',
              fontSize: 10,
            }}
            interval="preserveEnd"
            ticks={TICKS}
          />
          <Bar
            type="monotone"
            dataKey="usage"
            stackId="1"
            stroke="color-mix(in oklab, var(--color-neutral-500) 60%, transparent)"
            fill="color-mix(in oklab, var(--color-neutral-500) 20%, transparent)"
            radius={4}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
