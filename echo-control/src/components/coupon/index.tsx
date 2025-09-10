'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Gift } from 'lucide-react';
import type { STATES } from './multi-state-button';
import { MultiStateCouponButton } from './multi-state-button';

interface CouponProps {
  value: number;
  onClaim: () => void;
  isClaiming: boolean;
  isClaimed: boolean;
  subText?: React.ReactNode;
  className?: string;
  states?: STATES;
}

const defaultSubText = (
  <p className="text-sm">
    You can use these credits to make LLM requests on
    <br />
    <strong>any Echo app</strong>.
  </p>
);

export const Coupon: React.FC<CouponProps> = ({
  value,
  onClaim,
  isClaiming,
  isClaimed,
  subText = defaultSubText,
  className,
  states,
}) => {
  return (
    <div
      className={cn(
        'relative mx-auto overflow-hidden w-full',
        'bg-gradient-to-br from-primary via-primary/80 to-primary',
        'rounded-2xl',
        'after:content-[""] after:absolute after:inset-0 after:rounded-2xl after:shadow-[inset_0_8px_32px_0_rgba(0,0,0,0.18)] after:pointer-events-none',
        className
      )}
    >
      <div className="p-6 flex flex-col gap-2 text-white">
        <div className="flex justify-between items-center">
          <p className="text-5xl font-bold text-white">${value.toFixed(2)}</p>
          <div className="flex items-center gap-2 h-fit">
            <p className="font-semibold text-white">Free Credits</p>
            <Gift className="size-5" />
          </div>
        </div>
        {subText}
      </div>
      <div className="-mx-2 flex items-center justify-center w-[calc(100%+1rem)] py-2 z-10">
        <div className="rounded-full size-4 bg-background z-20" />
        <svg className="flex-1 h-[2px] z-20">
          <line
            x1="0"
            y1="0"
            x2="100%"
            y2="0"
            pathLength="100"
            stroke="var(--background)"
            strokeWidth="2"
            strokeDasharray="2 1.5"
          />
        </svg>
        <div className="rounded-full size-4 bg-background z-20" />
      </div>
      <div className="p-4">
        <MultiStateCouponButton
          onClaim={onClaim}
          state={isClaiming ? 'processing' : isClaimed ? 'success' : 'idle'}
          disabled={isClaiming || isClaimed}
          states={states}
        />
      </div>

      {/* Animated shimmer overlay */}
      <style>
        {`
          .animate-coupon-shimmer {
            animation: coupon-shimmer 5s infinite;
          }

          @keyframes coupon-shimmer {
            0% {
              transform: translateX(-400%);
              animation-timing-function: ease-in-out;
            }
            33% {
              transform: translateX(-400%);
              animation-timing-function: ease-in-out;
            }
            66% {
              transform: translateX(400%);
              animation-timing-function: ease-in-out;
            }
            100% {
              transform: translateX(400%);
              animation-timing-function: ease-in-out;
            }
          }
        `}
      </style>
      <div className="absolute top-[-100%] bottom-[-100%] w-[25%] bg-gradient-to-r from-transparent via-white/5 to-transparent animate-coupon-shimmer rounded-3xl rotate-30 pointer-events-none" />
    </div>
  );
};
