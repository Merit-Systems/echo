import React from 'react';

import Link from 'next/link';

import { ChevronRight } from 'lucide-react';

import type { Route } from 'next';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const Section: React.FC<Props> = ({ children, title, actions }) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl">{title}</h1>
        {actions}
      </div>
      {children}
    </div>
  );
};

interface SubSectionProps<T extends string> extends Props {
  actions?: React.ReactNode;
  href?: Route<T>;
}

export const SubSection = <T extends string>({
  children,
  title,
  actions,
  href,
}: SubSectionProps<T>) => {
  const Header = () => {
    return (
      <div
        className={cn(
          'flex items-center gap-1',
          href && 'group cursor-pointer'
        )}
      >
        <h3
          className={cn(
            'font-bold text-foreground/60',
            href && 'group-hover:text-foreground transition-colors'
          )}
        >
          {title}
        </h3>
        {href && (
          <div className="flex items-center gap-2 bg-muted/0 hover:bg-muted rounded-md p-0.5 transition-all hover:scale-105 group-hover:translate-x-1">
            <ChevronRight className="size-4 text-muted-foreground/60 group-hover:text-muted-foreground" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-2 md:gap-3 max-w-full h-full">
      <div className="flex justify-between items-center">
        {href ? (
          <Link href={href}>
            <Header />
          </Link>
        ) : (
          <Header />
        )}
        {actions}
      </div>
      {children}
    </div>
  );
};
