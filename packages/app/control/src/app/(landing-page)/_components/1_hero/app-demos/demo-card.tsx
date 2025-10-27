'use client';

import Image from 'next/image';
import React, { useEffect } from 'react';
import { Users } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';
import { ToolkitBody } from './toolkit-demo';
import { ShirtslopBody } from './shirtslop-demo';
import { EchoVibesBody } from './vibes-demo';

export interface CardBodyProps {
  isActive: boolean;
}

interface DemoCardProps {
  image: string;
  title: string;
  author: string;
  body: React.FC<CardBodyProps>;
  earnings: number;
  users: number;
  isFirst?: boolean;
}

export const cards: DemoCardProps[] = [
  {
    image: '/images/toolkit.svg',
    title: 'Toolkit.dev',
    body: ToolkitBody,
    author: 'Jason Hedman',
    earnings: 156.78,
    users: 561,
  },
  {
    image: '/images/shirtslop.png',
    title: 'Shirtslop',
    body: ShirtslopBody,
    author: 'Ryan Sproule',
    earnings: 212.91,
    users: 123,
  },
  {
    image: '/images/vibes.png',
    title: 'EchoVibes',
    body: EchoVibesBody,
    author: 'Sam Ragsdale',
    earnings: 348.63,
    users: 488,
  },
];

const AnimatedNumber: React.FC<{ value: number; shouldAnimate: boolean }> = ({
  value,
  shouldAnimate,
}) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayValue(0);
      return;
    }

    // Start animation after flip completes (500ms delay + 600ms flip = 1100ms)
    const timeout = setTimeout(() => {
      const duration = 1000; // 1 second to count up
      const startTime = Date.now();
      const startValue = 0;
      let rafId: number;

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = startValue + (value - startValue) * eased;

        setDisplayValue(current);

        if (progress < 1) {
          rafId = requestAnimationFrame(animate);
        }
      };

      rafId = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(rafId);
      };
    }, 100);

    return () => clearTimeout(timeout);
  }, [value, shouldAnimate]);

  return <span className="tabular-nums">{formatCurrency(displayValue)}</span>;
};

export const DemoCard: React.FC<DemoCardProps> = ({
  image,
  title,
  body: BodyComponent,
  earnings,
  users,
  isFirst = false,
}) => {
  const [clicked, setClicked] = React.useState(false);
  const [flipped, setFlipped] = React.useState(false);
  const [bodyActive, setBodyActive] = React.useState(false);

  useEffect(() => {
    // Reset and start animation only when card becomes first
    if (isFirst) {
      setClicked(false);
      setFlipped(false);
      setBodyActive(false);

      // Simulate click at 500ms
      const clickTimeout = setTimeout(() => {
        setClicked(true);
        // Hold click for 100ms, then flip
        setTimeout(() => {
          setFlipped(true);
        }, 100);
      }, 500);

      // Start body animations after flip completes (500ms delay + 100ms click + 600ms flip = 1200ms)
      const bodyTimeout = setTimeout(() => {
        setBodyActive(true);
      }, 1200);

      return () => {
        clearTimeout(clickTimeout);
        clearTimeout(bodyTimeout);
      };
    } else {
      // Reset when card goes back in stack
      setClicked(false);
      setFlipped(false);
      setBodyActive(false);
    }
  }, [isFirst]);

  return (
    <div className="flex flex-col gap-2 p-1.5 md:p-2 size-full">
      <div className="flex items-center gap-2 border-b pb-2 justify-between">
        <div className="flex gap-2">
          <Image
            src={image}
            alt={title}
            width={20}
            height={20}
            className="size-6"
          />
          <div>
            <h3 className="font-bold">{title}</h3>
          </div>
        </div>
        <div style={{ perspective: '1000px' }}>
          <motion.div
            className="relative w-[96px] h-8 md:h-9"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{
              rotateY: flipped ? 180 : 0,
            }}
            transition={{
              duration: 0.6,
              ease: 'easeInOut',
            }}
          >
            {/* Front side */}
            <motion.div
              className="absolute inset-0"
              style={{
                backfaceVisibility: 'hidden',
              }}
              animate={{
                y: clicked && !flipped ? 2 : 0,
                scale: clicked && !flipped ? 0.97 : 1,
              }}
              transition={{
                duration: 0.1,
              }}
            >
              <button
                className={`w-full h-full inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md text-xs md:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed gap-2 border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 px-2 ${clicked && !flipped ? 'shadow-none bg-accent' : 'shadow-xs'}`}
              >
                <Logo className="size-4" />
                <span className="text-xs">Connect</span>
              </button>
            </motion.div>

            {/* Back side */}
            <div
              className="absolute inset-0"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <button className="w-full h-full inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md text-xs md:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed gap-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 px-2">
                <Logo className="size-4" />
                <span className="text-xs font-bold text-primary">
                  <AnimatedNumber value={84.29} shouldAnimate={flipped} />
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <BodyComponent isActive={bodyActive} />
      <div className="flex items-center justify-between gap-2 mt-auto">
        <p className="text-xs text-primary font-bold">
          {formatCurrency(earnings)}
        </p>
        <div className="flex items-center gap-1 text-muted-foreground">
          <p className="text-xs">{users.toLocaleString()}</p>
          <Users className="size-3" />
        </div>
      </div>
    </div>
  );
};
