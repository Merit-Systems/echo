'use client';

import React, { useEffect, useState } from 'react';
import { SiGithub } from '@icons-pack/react-simple-icons';

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

export const FreeOss: React.FC = () => {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://api.github.com/repos/merit-systems/echo')
      .then(res => res.json())
      .then((data: { stargazers_count: number }) =>
        setStars(data.stargazers_count)
      )
      .catch(() => setStars(null));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2">
      <a
        href="https://github.com/merit-systems/echo"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity group"
      >
        <SiGithub className="size-12" />
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="text-sm font-medium">
            {stars !== null ? stars.toLocaleString() : '---'}
          </span>
        </div>
        <div className="text-sm text-center group-hover:underline">
          <GrayAuroraText>merit-systems/echo</GrayAuroraText>
        </div>
      </a>
    </div>
  );
};
