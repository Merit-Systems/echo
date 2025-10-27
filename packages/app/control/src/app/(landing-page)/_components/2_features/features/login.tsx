'use client';

import { Logo } from '@/components/ui/logo';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';

const GrayAuroraText = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const colors = [
    'hsl(0 0% 35%)',
    'hsl(0 0% 45%)',
    'hsl(0 0% 50%)',
    'hsl(0 0% 45%)',
    'hsl(0 0% 35%)',
  ];

  const gradientStyle = {
    backgroundImage: `linear-gradient(135deg, ${colors.join(', ')}, ${colors[0]})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animationDuration: '10s',
  };

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="sr-only">{children}</span>
      <span
        className="relative animate-aurora bg-[length:200%_auto] bg-clip-text text-transparent"
        style={gradientStyle}
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  );
};

const AnimatedNumber: React.FC<{ value: number; shouldAnimate: boolean }> = ({
  value,
  shouldAnimate,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!shouldAnimate) {
      // Keep the value when flipping back, only reset if we haven't animated yet
      if (hasAnimated) {
        setDisplayValue(value);
      } else {
        setDisplayValue(0);
      }
      return;
    }

    // Only animate if we haven't animated yet
    if (!hasAnimated) {
      // Start animation after flip completes
      const timeout = setTimeout(() => {
        const duration = 1000;
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
          } else {
            setHasAnimated(true);
          }
        };

        rafId = requestAnimationFrame(animate);

        return () => {
          cancelAnimationFrame(rafId);
        };
      }, 100);

      return () => clearTimeout(timeout);
    } else {
      setDisplayValue(value);
    }
  }, [value, shouldAnimate, hasAnimated]);

  return <span className="tabular-nums">{formatCurrency(displayValue)}</span>;
};

export const Login = () => {
  const [rotateY, setRotateY] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const flipped = rotateY % 360 === 180;

  const handleClick = () => {
    const newRotation = rotateY + 180;
    setRotateY(newRotation);

    // If flipping back to Connect (new rotation will be multiple of 360)
    if (newRotation % 360 === 0) {
      setTimeout(() => {
        setResetKey(prev => prev + 1);
      }, 600);
    }
  };

  return (
    <div className="size-full flex items-center justify-center">
      <div className="flex items-center justify-center">
        <div style={{ perspective: '1000px' }}>
          <motion.div
            className="relative w-[160px] h-14"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{
              rotateY: rotateY,
            }}
            transition={{
              duration: 0.6,
              ease: 'easeInOut',
            }}
          >
            {/* Front side */}
            <div
              className="absolute inset-0"
              style={{
                backfaceVisibility: 'hidden',
              }}
            >
              <button
                onClick={handleClick}
                className="w-full h-full inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md text-base md:text-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed gap-4 border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 py-1 px-1 shadow-xs active:shadow-none active:translate-y-[2px]"
              >
                <Logo className="size-8" />
                <GrayAuroraText className="text-xl font-semibold tracking-wide">
                  Connect
                </GrayAuroraText>
              </button>
            </div>

            {/* Back side */}
            <div
              className="absolute inset-0"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <button
                onClick={handleClick}
                className="w-full h-full inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md text-base md:text-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed gap-4 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 py-1 px-1 active:shadow-none active:translate-y-[2px]"
              >
                <Logo className="size-8" />
                <GrayAuroraText className="text-xl font-bold">
                  <AnimatedNumber
                    key={resetKey}
                    value={84.29}
                    shouldAnimate={flipped}
                  />
                </GrayAuroraText>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
