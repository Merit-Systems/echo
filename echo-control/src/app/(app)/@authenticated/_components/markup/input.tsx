'use client';

import { useDeferredValue, useState, useTransition } from 'react';

import { Percent } from 'lucide-react';

import { AnimatePresence, motion } from 'motion/react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

import { LoadingProfitChart, ProfitChart } from './chart';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  markup: number;
  onMarkupChange: (markup: number) => void;
}

enum MarkupOption {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Custom = 'Custom',
}

const MARKUP_OPTIONS = [
  {
    label: MarkupOption.Low,
    value: 2,
  },

  {
    label: MarkupOption.Medium,
    value: 4,
  },

  {
    label: MarkupOption.High,
    value: 8,
  },
];

export const MarkupInput = ({ markup, onMarkupChange }: Props) => {
  const [selectedMarkupLabel, setSelectedMarkupLabel] = useState<MarkupOption>(
    MARKUP_OPTIONS.find(option => option.value === markup)?.label ??
      MarkupOption.Custom
  );
  const [, startTransition] = useTransition();
  const deferredMarkup = useDeferredValue(markup);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 w-full">
        {[
          ...MARKUP_OPTIONS,
          {
            label: MarkupOption.Custom,
            value: markup,
          },
        ].map(({ label, value }) => (
          <Button
            key={label}
            variant={label === selectedMarkupLabel ? 'turbo' : 'outline'}
            size="sm"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedMarkupLabel(label);
              if (label !== MarkupOption.Custom) {
                startTransition(() => onMarkupChange(value));
              }
            }}
            className="flex-1 flex-col gap-0 h-full p-2 justify-start"
          >
            <span className="text-sm font-bold">{label}</span>
            {label === 'Custom' ? (
              <span className="text-xs opacity-60">Enter a Value</span>
            ) : (
              <span className="text-xs opacity-80">{(value - 1) * 100}%</span>
            )}
          </Button>
        ))}
      </div>
      <AnimatePresence>
        {selectedMarkupLabel === 'Custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{
              opacity: 1,
              height: 'auto',
              marginTop: 8,
              transition: { duration: 0.2, opacity: { delay: 0.1 } },
            }}
            exit={{
              opacity: 0,
              height: 0,
              marginTop: 0,
              transition: {
                duration: 0.2,
                height: { delay: 0.1 },
                marginTop: { delay: 0.1 },
              },
            }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <Input
                value={((markup - 1) * 100).toFixed(0)}
                onChange={e => {
                  const value =
                    e.target.value === '' ? 0 : Number(e.target.value);
                  startTransition(() => onMarkupChange(value / 100 + 1));
                }}
                className="w-18 pr-6"
              />
              <Percent className="size-3 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2" />
            </div>
            <Slider
              min={1}
              max={10}
              step={0.01}
              value={[markup]}
              onValueChange={value =>
                startTransition(() => onMarkupChange(value[0]))
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="w-full mt-4">
        <ProfitChart markup={deferredMarkup - 1} />
      </div>
    </div>
  );
};

export const LoadingMarkupInput = () => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 w-full">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[54px] flex-1" />
        ))}
      </div>
      <div className="w-full mt-4">
        <LoadingProfitChart />
      </div>
    </div>
  );
};
