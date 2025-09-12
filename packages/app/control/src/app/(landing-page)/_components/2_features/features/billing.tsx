'use client';

import { XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Simulate trending up revenue data
const baseData = [
  { name: 'Day 1', usage: 1000 },
  { name: 'Day 2', usage: 1200 },
  { name: 'Day 3', usage: 1100 }, // down
  { name: 'Day 4', usage: 1300 },
  { name: 'Day 5', usage: 1500 },
  { name: 'Day 6', usage: 1400 }, // down
  { name: 'Day 7', usage: 1600 },
  { name: 'Day 8', usage: 1800 },
  { name: 'Day 9', usage: 1750 }, // down
  { name: 'Day 10', usage: 2000 },
  { name: 'Day 11', usage: 2200 },
  { name: 'Day 12', usage: 2100 }, // down
  { name: 'Day 13', usage: 2300 },
  { name: 'Day 14', usage: 2500 },
  { name: 'Day 15', usage: 2450 }, // down
  { name: 'Day 16', usage: 2700 },
  { name: 'Day 17', usage: 2900 },
  { name: 'Day 18', usage: 3100 },
  { name: 'Day 19', usage: 3050 }, // down
  { name: 'Day 20', usage: 3400 },
];

const markup = 0.5;

const data = baseData.map(item => ({
  ...item,
  profit: item.usage * markup,
}));

export const Billing = () => {
  return (
    <div className="w-full h-40 rounded-lg overflow-hidden relative">
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
        <AreaChart
          data={data}
          margin={{
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <XAxis hide />
          <YAxis hide />
          <Area
            type="monotone"
            dataKey="usage"
            stackId="1"
            stroke="color-mix(in oklab, var(--color-neutral-500) 100%, transparent)"
            fill="color-mix(in oklab, var(--color-neutral-500) 20%, transparent)"
          />
          <Area
            type="monotone"
            dataKey="profit"
            stackId="1"
            stroke="var(--color-primary)"
            fill="var(--color-primary)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
