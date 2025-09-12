import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface DocsLogoProps {
  className?: string;
}

export const DocsLogo: React.FC<DocsLogoProps> = ({ className }) => {
  return (
    <div className={cn('flex items-center', className)}>
      <Image
        src="/logo/light_horizontal.svg"
        alt="Echo"
        width={120}
        height={32}
        className="dark:hidden h-8 w-auto"
        priority
      />
      <Image
        src="/logo/dark_horizontal.svg"
        alt="Echo"
        width={120}
        height={32}
        className="hidden dark:block h-8 w-auto"
        priority
      />
    </div>
  );
};
