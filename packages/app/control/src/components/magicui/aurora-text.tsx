'use client';

import React, { memo } from 'react';

interface AuroraTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  speed?: number;
}

export const AuroraText = memo(
  ({
    children,
    className = '',
    colors = [
      'var(--primary)',
      'color-mix(in oklab, var(--primary) 80%, transparent)',
      'color-mix(in oklab, var(--primary) 60%, transparent)',
      'color-mix(in oklab, var(--primary) 80%, transparent)',
      'var(--primary)',
    ],
    speed = 1,
  }: AuroraTextProps) => {
    const gradientStyle = {
      backgroundImage: `linear-gradient(135deg, ${colors.join(', ')}, ${
        colors[0]
      })`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      animationDuration: `${10 / speed}s`,
    };

    return (
      <span className={`relative inline-block ${className}`}>
        <span className="sr-only">{children}</span>
        <span
          className="relative animate-aurora bg-[length:200%_auto] bg-clip-text text-transparent bg-primary/50"
          style={gradientStyle}
          aria-hidden="true"
        >
          {children}
        </span>
      </span>
    );
  }
);

AuroraText.displayName = 'AuroraText';
