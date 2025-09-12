'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn('flex w-full border-b bg-muted overflow-x-auto', className)}
      {...props}
    />
  );
}

export type TabsTriggerProps = React.ComponentProps<
  typeof TabsPrimitive.Trigger
> & {
  label: string;
  value: string;
} & (
    | {
        isLoading: true;
        amount?: undefined;
      }
    | {
        isLoading?: undefined;
        amount: string;
      }
  );

function TabsTrigger({
  className,
  label,
  isLoading,
  amount,
  ...props
}: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'flex flex-col gap-2 p-3 md:p-4 transition-all duration-200 min-w-28 md:min-w-56 group border-b-2 border-b-transparent',
        'border-r border-r-border',
        'data-[state=active]:border-b-primary data-[state=active]:bg-card',
        'cursor-pointer hover:bg-card/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      disabled={isLoading}
      {...props}
    >
      <div className="flex flex-col gap-1 text-left">
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
        {isLoading === true ? (
          <Skeleton className="w-16 md:w-24 h-[20px] my-[4px] md:h-[30px] md:my-[3px]" />
        ) : (
          <p className="text-xl md:text-3xl font-bold text-muted-foreground group-data-[state=active]:text-foreground">
            {amount}
          </p>
        )}
      </div>
    </TabsPrimitive.Trigger>
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
