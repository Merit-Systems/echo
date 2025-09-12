'use client';

import { forwardRef, useEffect, useId, useState } from 'react';

import { motion } from 'motion/react';

import { cn } from '@/lib/utils';

import type { RefObject } from 'react';
import { Card } from '../ui/card';

interface AnimatedBeamProps {
  className?: string;
  containerRef: RefObject<HTMLElement | null>; // Container ref
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
  pathType?: 'curved' | 'angular'; // New prop for path style
  isVertical?: boolean;
  repeatDelay?: number;
  beamWidth?: number;
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false, // Include the reverse prop
  duration = 10,
  delay = 0,
  pathColor = 'var(--color-primary)',
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = 'var(--color-primary)',
  gradientStopColor = 'var(--color-primary)',
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  pathType = 'curved', // Default to curved
  isVertical = false,
  repeatDelay = 0,
  beamWidth = 10,
}) => {
  const id = useId();
  const [pathD, setPathD] = useState('');
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  const [gradientCoordinates, setGradientCoordinates] = useState({
    x1: ['10%', '110%'],
    x2: ['0%', '100%'],
    y1: ['0%', '0%'],
    y2: ['0%', '0%'],
  });

  useEffect(() => {
    const updatePath = () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const rectA = fromRef.current.getBoundingClientRect();
        const rectB = toRef.current.getBoundingClientRect();

        const svgWidth = containerRect.width;
        const svgHeight = containerRect.height;
        setSvgDimensions({ width: svgWidth, height: svgHeight });

        const startX =
          rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
        const startY =
          rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
        const endX =
          rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
        const endY =
          rectB.top - containerRect.top + rectB.height / 2 + endYOffset;

        // Update gradient coordinates based on direction
        setGradientCoordinates(
          isVertical
            ? reverse
              ? {
                  x1: ['0%', '0%'],
                  x2: ['0%', '0%'],
                  y1: [`100%`, `-${beamWidth}%`],
                  y2: [`${100 + beamWidth}%`, `0%`],
                }
              : {
                  x1: ['0%', '0%'],
                  x2: ['0%', '0%'],
                  y1: [`0%`, `${100 + beamWidth}%`],
                  y2: [`-${beamWidth}%`, `100%`],
                }
            : reverse
              ? {
                  x1: [`100%`, `-${beamWidth}%`],
                  x2: [`${100 + beamWidth}%`, `0%`],
                  y1: ['0%', '0%'],
                  y2: ['0%', '0%'],
                }
              : {
                  x1: [`0%`, `${100 + beamWidth}%`],
                  x2: [`-${beamWidth}%`, `100%`],
                  y1: ['0%', '0%'],
                  y2: ['0%', '0%'],
                }
        );

        let d = '';
        if (pathType === 'angular') {
          // Create angular path with rounded corners
          const controlPointY = (startY + endY) / 2;
          const cornerRadius = 8;

          if (Math.abs(startX - endX) < 5) {
            // Nearly straight vertical line - use curved path to avoid stem overlap
            d = `M ${startX},${startY} L ${endX},${endY}`;
          } else {
            // L-shaped path with rounded corner
            const verticalEnd = controlPointY - cornerRadius;
            const horizontalStart =
              startX + (endX > startX ? cornerRadius : -cornerRadius);
            const horizontalEnd =
              endX - (endX > startX ? cornerRadius : -cornerRadius);
            const verticalStart = controlPointY + cornerRadius;

            d = `M ${startX},${startY} L ${startX},${verticalEnd} Q ${startX},${controlPointY} ${horizontalStart},${controlPointY} L ${horizontalEnd},${controlPointY} Q ${endX},${controlPointY} ${endX},${verticalStart} L ${endX},${endY}`;
          }
        } else {
          // Original curved path
          const controlY = startY - curvature;
          d = `M ${startX},${startY} Q ${(startX + endX) / 2},${controlY} ${endX},${endY}`;
        }
        setPathD(d);
      }
    };

    // Initialize ResizeObserver
    const resizeObserver = new ResizeObserver(entries => {
      // For all entries, recalculate the path
      entries.forEach(() => {
        updatePath();
      });
    });

    // Observe the container element
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Call the updatePath initially to set the initial path
    updatePath();

    // Clean up the observer on component unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
    reverse,
    pathType,
    isVertical,
    beamWidth,
  ]);

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        'pointer-events-none absolute top-0 left-0 transform-gpu stroke-2',
        className
      )}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      <motion.path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
        transition={{
          repeat: Infinity,
          repeatType: 'loop',
          duration: 2,
          ease: 'linear',
        }}
      />
      <path
        d={pathD}
        strokeWidth={pathWidth}
        stroke={`url(#${id})`}
        strokeOpacity="1"
        strokeLinecap="round"
      />
      <defs>
        <motion.linearGradient
          className="transform-gpu"
          id={id}
          gradientUnits={'userSpaceOnUse'}
          initial={{
            x1: '0%',
            x2: '0%',
            y1: '0%',
            y2: '0%',
          }}
          animate={{
            x1: gradientCoordinates.x1,
            x2: gradientCoordinates.x2,
            y1: gradientCoordinates.y1,
            y2: gradientCoordinates.y2,
          }}
          transition={{
            delay,
            duration,
            ease: [0.16, 1, 0.3, 1],
            repeat: Infinity,
            repeatDelay,
          }}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0"></stop>
          <stop stopColor={gradientStartColor}></stop>
          <stop offset="32.5%" stopColor={gradientStopColor}></stop>
          <stop
            offset="100%"
            stopColor={gradientStopColor}
            stopOpacity="0"
          ></stop>
        </motion.linearGradient>
      </defs>
    </svg>
  );
};

export const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <Card
      ref={ref}
      className={cn(
        'bg-card z-10 flex items-center justify-center rounded-full border p-2 shadow-sm',
        className
      )}
    >
      {children}
    </Card>
  );
});

Circle.displayName = 'Circle';
